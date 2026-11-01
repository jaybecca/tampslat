from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi.responses import Response, JSONResponse
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.ttLib import TTFont
import io, re, unicodedata

app = FastAPI(title="TAMPslat CFF OpenType Compiler", version="1.0.0")
origins=[x.strip() for x in os.getenv("CORS_ORIGINS","http://127.0.0.1:5500,http://localhost:5500,http://127.0.0.1:8000,http://localhost:8000").split(",")]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["GET","POST"], allow_headers=["Content-Type"])

@app.middleware("http")
async def request_size_guard(request, call_next):
    length = request.headers.get("content-length")
    if length and int(length) > 20 * 1024 * 1024:
        return JSONResponse({"detail": "Font project payload exceeds the 20 MB service limit"}, status_code=413)
    return await call_next(request)

def safe_name(value, fallback):
    value = unicodedata.normalize("NFKD", str(value or fallback))
    value = re.sub(r"[^A-Za-z0-9_.]", "", value)
    if not value or not value[0].isalpha(): value = "g" + value
    return value[:63]

def emit_path(pen, commands):
    if len(commands or []) > 10000: raise ValueError("A glyph cannot contain more than 10,000 path commands")
    def coord(value):
        value=float(value)
        if not (-32768 <= value <= 32767): raise ValueError("Glyph coordinates must be within -32768..32767 font units")
        return value
    open_contour = False
    current = (0.0, 0.0)
    for cmd in commands or []:
        kind = str(cmd.get("type", "")).upper()
        if kind == "M":
            if open_contour: pen.closePath()
            current = (coord(cmd["x"]), coord(cmd["y"]))
            pen.moveTo(current); open_contour = True
        elif kind == "L":
            if not open_contour: raise ValueError("Line command before move command")
            current = (coord(cmd["x"]), coord(cmd["y"]))
            pen.lineTo(current)
        elif kind == "Q":
            if not open_contour: raise ValueError("Quadratic command before move command")
            q = (coord(cmd["x1"]), coord(cmd["y1"]))
            end = (coord(cmd["x"]), coord(cmd["y"]))
            c1 = (current[0] + (q[0]-current[0])*2/3, current[1] + (q[1]-current[1])*2/3)
            c2 = (end[0] + (q[0]-end[0])*2/3, end[1] + (q[1]-end[1])*2/3)
            pen.curveTo(c1, c2, end); current = end
        elif kind == "C":
            if not open_contour: raise ValueError("Cubic command before move command")
            c1=(coord(cmd["x1"]),coord(cmd["y1"]));c2=(coord(cmd["x2"]),coord(cmd["y2"]))
            end=(coord(cmd["x"]),coord(cmd["y"]))
            pen.curveTo(c1,c2,end);current=end
        elif kind == "Z":
            if open_contour: pen.closePath();open_contour=False
        else:
            raise ValueError(f"Unsupported path command: {kind}")
    if open_contour: pen.closePath()

@app.get("/health")
def health(): return {"ok": True, "engine": "fontTools", "outline": "CFF/OpenType"}

@app.post("/api/compile/otf")
def compile_otf(data: dict):
    try:
        family = str(data.get("family") or "TAMPSLAT Custom")[:128]
        style = str(data.get("style") or "Regular")[:64]
        metrics = data.get("metrics") or {}
        upm = int(metrics.get("upm", 1000))
        if upm < 16 or upm > 16384: raise ValueError("Units per em must be between 16 and 16384")
        glyph_data = data.get("glyphs") or []
        if len(glyph_data) < 1 or len(glyph_data) > 4096: raise ValueError("Provide between 1 and 4096 glyph records")
        seen_unicode=set(); total_commands=0; glyph_order=[".notdef"]; cmap={}; widths={".notdef":(600,0)}; charstrings={}
        for item in glyph_data:
            total_commands += len(item.get("commands",[]) or [])
            if total_commands > 200000: raise ValueError("Font project exceeds 200,000 path commands")
            uni=item.get("unicode")
            if uni is None: continue
            uni=int(uni)
            if uni < 0 or uni > 0x10FFFF or 0xD800 <= uni <= 0xDFFF: raise ValueError("Invalid Unicode scalar value")
            if uni in seen_unicode: raise ValueError(f"Duplicate Unicode mapping U+{uni:04X}")
            seen_unicode.add(uni)
            name=safe_name(item.get("name"),f"uni{uni:04X}")
            if name in glyph_order: name=f"{name}_{uni:04X}"
            glyph_order.append(name);cmap[uni]=name
            advance=max(0,min(5000,int(item.get("advanceWidth",600))))
            lsb=max(-2000,min(2000,int(item.get("leftSideBearing",0))))
            widths[name]=(advance,lsb)
            pen=T2CharStringPen(advance,None)
            emit_path(pen,item.get("commands",[]))
            charstrings[name]=pen.getCharString(private=None,globalSubrs=None)
        # .notdef must have an actual empty charstring.
        notdef_pen=T2CharStringPen(600,None);notdef_pen.moveTo((80,0));notdef_pen.lineTo((80,700));notdef_pen.lineTo((520,700));notdef_pen.lineTo((520,0));notdef_pen.closePath();notdef_pen.moveTo((180,100));notdef_pen.lineTo((420,100));notdef_pen.lineTo((420,600));notdef_pen.lineTo((180,600));notdef_pen.closePath();charstrings[".notdef"]=notdef_pen.getCharString(private=None,globalSubrs=None)
        fb=FontBuilder(unitsPerEm=upm,isTTF=False)
        fb.setupGlyphOrder(glyph_order)
        fb.setupCharacterMap(cmap)
        fb.setupHorizontalMetrics(widths)
        asc=int(metrics.get("ascender",800));desc=int(metrics.get("descender",-200))
        fb.setupHorizontalHeader(ascent=asc,descent=desc)
        fb.setupNameTable({"familyName":family,"styleName":style,"uniqueFontIdentifier":f"TAMPSLAT-{family}-{style}","fullName":f"{family} {style}","psName":safe_name(family.replace(' ','')+'-'+style.replace(' ',''),'TAMPSLATCustom')})
        fb.setupOS2(sTypoAscender=asc,sTypoDescender=desc,usWinAscent=max(0,asc),usWinDescent=max(0,-desc),sxHeight=int(metrics.get("xHeight",500)),sCapHeight=int(metrics.get("capHeight",700)))
        fb.setupPost();fb.setupMaxp()
        fb.setupCFF(safe_name(family.replace(' ','')+'-'+style.replace(' ',''),'TAMPSLATCustom'),{"FullName":f"{family} {style}","FamilyName":family,"Weight":style,"version":"Version 1.000"},charstrings, {})
        # Emit legacy kern pairs as a real OpenType kern table where both glyphs exist.
        font=fb.font
        pairs={}
        by_unicode={int(x.get("unicode")):safe_name(x.get("name"),f"uni{int(x.get('unicode')):04X}") for x in glyph_data if x.get("unicode") is not None}
        for pair in data.get("kerning",[]):
            key,val=pair
            left,right=[int(v) for v in key.split(":")]
            if left in by_unicode and right in by_unicode:
                pairs[(by_unicode[left],by_unicode[right])]=int(val)
        if pairs:
            from fontTools.ttLib import newTable
            kern=newTable("kern");kern.version=0
            sub=newTable("kern")
            from fontTools.ttLib.tables._k_e_r_n import KernTable_format_0
            st=KernTable_format_0();st.version=0;st.coverage=1;st.kernTable=pairs
            kern.kernTables=[st];font["kern"]=kern
        out=io.BytesIO();font.save(out);payload=out.getvalue()
        # Re-open the generated binary to ensure the font tables are parseable.
        check=TTFont(io.BytesIO(payload),lazy=False)
        if "CFF " not in check or "cmap" not in check or "hmtx" not in check: raise ValueError("Generated OTF is missing required CFF/OpenType tables")
        return Response(payload,media_type="font/otf",headers={"Content-Disposition":f'attachment; filename="{safe_name(family,"TAMPSLAT")}.otf"',"X-Font-Format":"CFF-OpenType","X-Glyph-Count":str(len(glyph_order))})
    except Exception as exc:
        raise HTTPException(status_code=422,detail=str(exc))

@app.post("/api/compile/ttf")
def compile_ttf(data: dict):
    try:
        family = str(data.get("family") or "TAMPSLAT Custom")[:128]
        style = str(data.get("style") or "Regular")[:64]
        metrics = data.get("metrics") or {}
        upm = int(metrics.get("upm", 1000))
        if upm < 16 or upm > 16384: raise ValueError("Units per em must be between 16 and 16384")
        glyph_data = data.get("glyphs") or []
        if len(glyph_data) < 1 or len(glyph_data) > 4096: raise ValueError("Provide between 1 and 4096 glyph records")
        from fontTools.pens.ttGlyphPen import TTGlyphPen
        from fontTools.pens.cu2quPen import Cu2QuPen
        glyph_order=[".notdef"]; cmap={}; widths={".notdef":(600,0)}; glyf={}; seen=set(); total=0
        def make_glyph(commands, advance):
            base=TTGlyphPen(None)
            pen=Cu2QuPen(base,max_err=1.0,reverse_direction=True)
            emit_path(pen,commands)
            return base.glyph()
        glyf[".notdef"]=make_glyph([{"type":"M","x":80,"y":0},{"type":"L","x":80,"y":700},{"type":"L","x":520,"y":700},{"type":"L","x":520,"y":0},{"type":"Z"},{"type":"M","x":180,"y":100},{"type":"L","x":420,"y":100},{"type":"L","x":420,"y":600},{"type":"L","x":180,"y":600},{"type":"Z"}],600)
        for item in glyph_data:
            commands=item.get("commands",[]) or [];total+=len(commands)
            if len(commands)>10000 or total>200000: raise ValueError("Font project exceeds the supported glyph path command limits")
            uni=item.get("unicode")
            if uni is None: continue
            uni=int(uni)
            if uni<0 or uni>0x10FFFF or 0xD800<=uni<=0xDFFF: raise ValueError("Invalid Unicode scalar value")
            if uni in seen: raise ValueError(f"Duplicate Unicode mapping U+{uni:04X}")
            seen.add(uni);name=safe_name(item.get("name"),f"uni{uni:04X}")
            if name in glyph_order:name=f"{name}_{uni:04X}"
            glyph_order.append(name);cmap[uni]=name
            advance=max(0,min(5000,int(item.get("advanceWidth",600))));lsb=max(-2000,min(2000,int(item.get("leftSideBearing",0))))
            widths[name]=(advance,lsb);glyf[name]=make_glyph(commands,advance)
        fb=FontBuilder(unitsPerEm=upm,isTTF=True);fb.setupGlyphOrder(glyph_order);fb.setupCharacterMap(cmap);fb.setupGlyf(glyf);fb.setupHorizontalMetrics(widths)
        asc=int(metrics.get("ascender",800));desc=int(metrics.get("descender",-200))
        fb.setupHorizontalHeader(ascent=asc,descent=desc)
        fb.setupNameTable({"familyName":family,"styleName":style,"uniqueFontIdentifier":f"TAMPSLAT-{family}-{style}","fullName":f"{family} {style}","psName":safe_name(family.replace(' ','')+'-'+style.replace(' ',''),'TAMPSLATCustom')})
        fb.setupOS2(sTypoAscender=asc,sTypoDescender=desc,usWinAscent=max(0,asc),usWinDescent=max(0,-desc),sxHeight=int(metrics.get("xHeight",500)),sCapHeight=int(metrics.get("capHeight",700)))
        fb.setupPost();fb.setupMaxp();font=fb.font
        by_unicode={int(x.get("unicode")):safe_name(x.get("name"),f"uni{int(x.get('unicode')):04X}") for x in glyph_data if x.get("unicode") is not None}
        pairs={}
        for pair in data.get("kerning",[]):
            key,val=pair;left,right=[int(v) for v in key.split(":")]
            if left in by_unicode and right in by_unicode:pairs[(by_unicode[left],by_unicode[right])]=int(val)
        if pairs:
            from fontTools.ttLib import newTable
            from fontTools.ttLib.tables._k_e_r_n import KernTable_format_0
            kern=newTable("kern");kern.version=0;st=KernTable_format_0();st.version=0;st.coverage=1;st.kernTable=pairs;kern.kernTables=[st];font["kern"]=kern
        out=io.BytesIO();font.save(out);payload=out.getvalue();check=TTFont(io.BytesIO(payload),lazy=False)
        if "glyf" not in check or "cmap" not in check or "hmtx" not in check or "OS/2" not in check:raise ValueError("Generated TTF is missing required TrueType tables")
        return Response(payload,media_type="font/ttf",headers={"Content-Disposition":f'attachment; filename="{safe_name(family,"TAMPSLAT")}.ttf"',"X-Font-Format":"TrueType-glyf","X-Glyph-Count":str(len(glyph_order))})
    except Exception as exc:
        raise HTTPException(status_code=422,detail=str(exc))
