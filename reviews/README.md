# Reviews

Overnote comments made while reviewing each stage, handed to the next stage's Claude Code session.

## Exporting a review

1. Annotate the pages as usual with the Overnote toolbar (bottom right).
2. On any moment page, click **Export review** in the footer. You get one file, `review-YYYY-MM-DD.json`, with every comment saved in this browser across all of the site's pages.
3. Save it in the folder for the stage you reviewed, for example `reviews/stage-1/review-2026-10-17.json`. Several files in one folder are fine.

Comments live in the browser's `localStorage`, separately for each address (`localhost:8000` and the GitHub Pages site don't share them). Export from the same browser and address you annotated in.

## What the next session does

Each stage prompt tells Claude Code to read every file in the previous stage's folder before it starts. For each comment it either addresses it or says why not, and it reports how each one was handled.

Highlights anchor to the exact text they quote. Once a comment has been handled, the highlighted wording may change and the highlight will no longer appear on the page. The export file keeps the comment either way.

## Format

```jsonc
{
  "format": "rare-viz-review", "version": 1,
  "site": "http://localhost:8000/", "exportedAt": "…", "reviewer": "…",
  "pageCount": 2, "commentCount": 5,
  "pages": [
    {
      "page": "moments/1-millionth-farmer/",
      "annotations": [ /* Overnote annotations: target (quoted text or CSS selector) + comments */ ]
    }
  ]
}
```

## Not published

The repo and its GitHub Pages site are public, so review files are **gitignored** (`reviews/**/*.json`) and stay on this machine. Only this README is committed. To share a review with someone, send them the file.
