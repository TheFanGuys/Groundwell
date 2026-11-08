# Groundwell

Static wellness reference for GitHub Pages. No build step, account, paid service, or runtime API is required.

## Deploy

Extract this ZIP into the root of your GitHub Pages repository. `index.html` must sit at the repository root alongside `app.js`, `style.css`, `sw.js`, and `data/`. You can also put all contents together in a `docs/` folder and select that folder as the Pages publishing source. All application paths are relative, so a project subpath also works. Serve over HTTPS for installation and offline reading.

The library, videos, and source archive live in `data/library.json`. The written guides and tools live in `app.js`. Edit these files, then publish again. Change `CACHE` in `sw.js` when core content changes so existing installations refresh their offline files.

Personal records stay in the browser. My wellness provides a JSON export and restore flow. A new browser or device needs that export to bring the records over. The initial load needs a connection. Offline use starts after the site has been visited and cached.

The video player loads a third-party embed only when the visitor presses Play. The written notes remain on the page without video access.
