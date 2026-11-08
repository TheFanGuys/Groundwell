# Groundwell

Static research workspace, label reader, and Dispatch starter. No account, API key, build step, or CDN dependency at runtime.

## Run locally

Run `npm run dev` with Node.js or serve this folder with a static HTTP server. Open port 4173 in your browser.

## Publish on GitHub Pages

1. Extract the ZIP and commit its contents to the root of a public GitHub repository on `main`, including the hidden `.github` folder.
2. Select GitHub Actions in Settings → Pages → Build and deployment.
3. Run **Publish Groundwell** from the Actions tab if the initial workflow has not started.

## Maintain Dispatch

Ask Claude to return a JSON array with title, date (YYYY-MM-DD), topic, kind (Research, Breaking, or Events), HTTPS source URL, and summary. Review every item and its source. Open **Dispatch → Publish Desk**, paste the array and export. Replace the repository's `dispatch.json` with the exported file. The site reads it at runtime.

## Scope

The research collection, ingredient index, and expert directory are starter collections. The scanner uses on-device Tesseract.js and requires the OCR assets on its first run. The English OCR and Chart.js files are vendored under their upstream licenses. Bookmarks and preferences are browser-local. The scanner separates preference flags from potential allergy matches and withholds a numeric toxicity rating when exposure is unknown. Full nutrition logging and personalized protocols are outside this starter.
