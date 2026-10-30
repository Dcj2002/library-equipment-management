# Equipment reference photos

Five supplied JPEG files are bundled in client/src/assets/equipment in this order: computer, headphones, printer, projector and scanner. Original images are retained without removing watermarks or changing their content. They are reference photos, not a guarantee of an individual asset's make or model.

## Default mapping

| Category | Default photo |
| --- | --- |
| Computer | computer.jpeg |
| Audio | headphones.jpeg |
| Printer | printer.jpeg |
| Projector | projector.jpeg |
| Scanner | scanner.jpeg |
| Other | No photo |

Equipment has an optional photoKey string: empty for Automatic, or computer/headphones/printer/projector/scanner/none. A blank or absent value uses the category mapping, including for legacy records. none explicitly hides the photo. Arbitrary URLs and file paths are rejected by the server; the model also uses an enum. Existing database records are not rewritten by this update.

Admins choose an included reference photo in the Add/Edit equipment form. The selected key is saved through the existing POST/PUT routes. Images display on the public category gallery, inventory thumbnail, details dialog and My Borrowings list. Missing or failed images show a placeholder.

This version selects among bundled images; it does not upload new files from the browser. To add more options later, add assets, update EquipmentPhoto.jsx and both the API/model allowed photo keys.

## Verification

Vite production build passed. All 14 server tests passed, including accepted photo choices, backward-compatible requests and rejected paths/objects. Frontend render checks passed for category defaults, manual overrides, no-photo states and image/selector markup. Browser interactions and live MongoDB persistence of the new photoKey still need local acceptance checks.
