# Groundwell

A static, self-contained wellness learning library and personal supplement tracker. The current edition includes six connected field guides and 25 focused research dossiers, including longer H. pylori, IBS, and damp-building studies, plus 29 concise topic briefs, longer topic guides for nutrition, oral health, mold, autoimmune health, ADHD, depression and vaccine questions, 20 nutrient cards, an expert directory, and a personal journal. Research sources are tucked into expandable notes after the explanations.

## Deploy on GitHub Pages

Extract the site ZIP into your repository root. `index.html`, `app.js`, `routine.js`, `style.css`, `sw.js`, and `data/` must be together. Enable Pages from that root (or move the whole set into a `docs/` folder and publish from there). No build step, server, account, paid API, or subscription is required. Paths are relative, so project subpaths work.

The standalone `Groundwell-Preview.html` can be opened on its own. It is a preview, not the installable PWA; use the ZIP for GitHub Pages.

## Learning content

`data/fieldguides.js`, `data/fieldguides2.js`, `data/fieldnotes.js`, `data/fieldguides3.js`, `data/fieldguides4.js`, `field-ui.js`, and `field-extra.js` hold the gut, supplement, oral, damp-building, midlife digestive and autoimmune field guides and their worksheets. `gut-log.js` adds a person-specific digestive symptom log; entries are included in the existing My wellness JSON backup. `data/monographs.js`, `data/volume2.js`, and `data/volume3.js` hold the research dossiers, evidence comparisons, and reference notes. `data/timing.js` provides a practical timing, form, amount, and caution guide for each of the 20 nutrient cards. The reference target is total intake and must not be treated as a prescribed capsule dose. `data/atlas.js` holds the concise topic briefs, glossary, and reading paths. `app.js` holds the long guides, nutrient explanations, directory, search and journal. `data/library.json` holds nutrient and people records plus an archive of original links. Archive entries are labeled as catalog records; they are not presented as full on-site articles. `routine.js` holds the supplement planner. `data/interactions.js` holds a limited, curated interaction index; it is not a complete safety screen.

Search in **Explore** indexes the written chapter text as well as nutrients and the other guides. External links are optional source notes, not the main explanation. Videos need an internet connection and load only when requested.

## Supplement routine and backups

Each person can have a separate routine on the same browser. Enter the product's exact label name, serving, times, days, units per dose and bottle quantity. Tap **Taken** or **Skip**. The capsule graphic displays the portion taken for the selected day. A seven-day strip highlights unrecorded past doses. Remaining quantity is estimated from recorded taken doses since the stock date; a refill creates a new stock baseline. The estimate cannot account for doses consumed outside the app. The calendar export contains the next 28 days of scheduled reminders; import it into your phone calendar to use that device's own notifications. In-app due items appear when the page is opened. Browser background alerts are not promised.

Data is stored locally on that device. **Export backup** includes the journal and routine in one JSON file. Restore replaces the current local records, so keep a backup before changing devices or clearing browser data. The initial site load needs a connection; after the service worker caches the core files, repeat visits can work offline. Videos remain online-only.

## Updating

Edit the content files, then increment the `CACHE` name in `sw.js` so installed copies refresh their offline files. Review every health claim and source before publishing changes. This is an educational reference and tracking tool, not a diagnostic service or individualized dosage generator.
