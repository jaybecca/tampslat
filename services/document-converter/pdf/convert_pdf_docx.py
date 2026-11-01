#!/usr/bin/env python3
"""PDF -> editable DOCX reconstruction using pdf2docx/PyMuPDF layout analysis."""
import sys
from pdf2docx import Converter

if len(sys.argv) != 3:
    raise SystemExit('usage: convert_pdf_docx.py INPUT.pdf OUTPUT.docx')
source, target = sys.argv[1:]
cv = Converter(source)
try:
    cv.convert(target, start=0, end=None)
finally:
    cv.close()
