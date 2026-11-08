# Groundwell

Groundwell is a static wellness reference and personal journal for GitHub Pages. It includes guides on nutrition, supplements, oral health, mold and indoor air, and COVID vaccination questions, along with a people directory, selected videos, and a source archive.

The site uses HTML, CSS, and JavaScript. It requires no build step, account, paid service, or runtime API.

## Publish on GitHub Pages

1. Place `index.html`, `app.js`, `style.css`, `sw.js`, `manifest.webmanifest`, the icon files, and the `data` folder at the root of your repository. Keep `library.json` inside `data`.
2. Open the repository's **Settings → Pages**.
3. Choose **Deploy from a branch**, select your publishing branch, and select **/(root)**.
4. Open the GitHub Pages URL after deployment.

If your repository publishes from a `docs` folder, place all site files together in `docs` and select **/docs** in Pages settings. The first visit requires an internet connection.

## Site files

| File | Purpose |
| --- | --- |
| `index.html` | Page shell, navigation, and opening screen |
| `style.css` | Layout, colors, typography, and mobile styles |
| `app.js` | Guides, search, videos, profile, and journal |
| `data/library.json` | Nutrients, people, and source archive |
| `manifest.webmanifest` and icons | Installable app name and icons |
| `sw.js` | Offline cache for core site files |

## Update content

Edit guides and video entries in `app.js`. Edit nutrient, people, and archive records in `data/library.json`. Keep JSON syntax valid.

When core content changes, update the `CACHE` name near the top of `sw.js`, such as changing `groundwell-v2` to `groundwell-v3`. Publish the changed files together. An installed copy may need to be closed and reopened before the new cache takes over.

## Personal records

**My wellness** stores the profile and journal entries in the browser on that device. There is no account or automatic sync.

Use **Export all data** to download a JSON backup. Use **Restore backup** to bring it into another browser or device. Restoring replaces the current profile and entries on that device. Clearing browser site data can remove local records.

Profile nutrient targets describe total daily intake from food and supplements. Groundwell does not calculate supplement doses from body weight.

## Videos and offline reading

Written guides and the journal can work offline after the site has loaded and cached. Videos require a connection. The video player contacts its host only after a visitor presses **Play video here**. Written viewing notes remain available without playback.

If a page appears outdated after publishing, reopen the site and check the cache version in `sw.js`. If search or a directory fails to load, confirm that `data/library.json` exists at the published path and contains valid JSON.

## Editorial upkeep

Review health content before publishing changes. Keep review dates, claims, uncertainty, and source notes aligned. Groundwell articles should remain understandable without opening their external references.
