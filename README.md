# Newsletter AI Generator

AI-powered newsletter generator that learns your writing style from examples and creates complete newsletter drafts with real, current news.

## Features

- **Claude (Anthropic) or GPT (OpenAI)** — choose your AI provider
- **Style learning** — upload 3-10 past newsletters and the AI mimics your voice
- **Source management** — add custom sources or search for new ones
- **Customizable** — timeframe, topics, language (Hebrew/English), tone
- **Source links** — every news item includes real source URLs
- **Download** — export as markdown, copy to clipboard

## Deploy to Netlify

### Option A: Git-based deploy (recommended)

1. Push this project to a GitHub/GitLab repo
2. Go to [app.netlify.com](https://app.netlify.com)
3. Click **"Add new site"** → **"Import an existing project"**
4. Connect your repo
5. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click **Deploy**

### Option B: Manual deploy (drag & drop)

```bash
npm install
npm run build
```

Then drag the `dist/` folder to [app.netlify.com/drop](https://app.netlify.com/drop)

## Local Development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Tech Stack

- React 19 + Vite
- Claude API / OpenAI API (called directly from browser)
- No backend needed — API keys stay in browser memory only

## Cost

~$0.15-0.40 per newsletter generation (depends on model and example count).
