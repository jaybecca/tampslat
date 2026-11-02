# TAMPslat language toggle reliability fix

## What changed
- Workspace translation now listens for the shared `tampslat-language-change` event and browser storage updates.
- All language controls on a page stay synchronised, including the studio, public, auth and vault selectors.
- Dynamically rendered workspace panels are re-processed after their content is inserted, so translated labels do not silently revert when tabs or tools are opened.
- Common translated attributes (`placeholder`, `title`, `aria-label`) are also updated and restored from their original values when switching languages.
- Authentication language changes no longer reload the page; they apply immediately and retain the selected language.
- Arabic continues to set right-to-left document direction.

## Scope and limitation
This fixes selector wiring, state synchronisation, dynamic-content reapplication and translation restoration. It does not automatically translate arbitrary new copy that has no entry in the relevant language dictionary. Any newly added English phrase still needs French, Portuguese, Spanish and Arabic dictionary entries.

## Validation
- JavaScript syntax checks passed for shared locale and authentication scripts.
- Existing application and Worker checks are run as part of packaging.
