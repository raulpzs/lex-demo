# LEX — VS Code Project

This is the LEX public platform demo.

## Important architecture note

This folder is a **static frontend**. It has no custom backend.

- `index.html` — page structure
- `styles.css` — visual design
- `app.js` — interactions, search, filters, tab navigation
- `data/laws.js` — laws shown in Explore Corpus
- `data/codebook.js` — 253 searchable Fall 2025 codebook items
- `data/tracker.js` — monthly Global Tracker entries
- `data/scores.js` — future Human Rights Reporting scores/categories
- `Codebook_F25.pdf` — PDF linked from the Codebook page

The embedded Hugging Face Space is remote and remains the live coding service:
`https://huggingface.co/spaces/raulpzs/expression_laws`

The local Round 1 / Round 2 interface above the embedded Space is frontend behavior only.

## Open in VS Code

1. Unzip the folder.
2. Open VS Code.
3. Choose **File → Open Folder**.
4. Select the `lex-vscode` folder.

## Preview locally

### Easiest: VS Code Live Server extension

Install the **Live Server** extension, then right-click `index.html` and choose:

`Open with Live Server`

### Without an extension

If Python is installed, open the VS Code terminal in this folder and run:

```bash
python -m http.server 8000
```

Then open:

`http://localhost:8000`

## What to edit most often

### Add/update a law
Edit:
`data/laws.js`

### Monthly Global Tracker update
Edit:
`data/tracker.js`

Example:

```js
{
  country: "Country",
  region: "Europe",
  bill: "Bill name",
  status: "Introduced",
  relevance: "Why this may affect freedom of expression.",
  reviewed: "Sep 2026",
  source: "https://official-government-source.example"
}
```

### Add human-rights scores later
Edit:
`data/scores.js`

Example:

```js
{
  id: "eu24",
  score: 0.65,
  category: "Your future category",
  rationale: "Short explanation of the score."
}
```

### Change layout/text
Edit:
`index.html`

### Change colors/fonts/spacing
Edit:
`styles.css`

### Change interaction behavior
Edit:
`app.js`

## Publish to Hugging Face

Because this remains a static site, upload the contents of this folder to your Hugging Face Static Space.

The Space needs:
- `index.html`
- `styles.css`
- `app.js`
- the `data/` folder
- `Codebook_F25.pdf`

You can also commit this folder to GitHub later and deploy it with Vercel.
