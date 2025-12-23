# Weekly Reset

Weekly reset is a companion web app I made for myself as a way to track the current video game seasons/events/etc. A FOMO visualizator, I guess.
> This is not available online, however you can self-host this. See below.

---


### What it does

- Dashboard: Visual overview of active events sorted by urgency.
- Status Tracking: Mark events as finished when you're done. (Or press skip)
- CRUD Management: Add, edit, and delete events directly from the UI.
- Filtering: Toggle visibility of skipped items and sort by Game, Start Date, or Deadline.
- Game Themes: Dynamic styling based on the specific game (e.g., colors, logos).
- Mobile-user friendly (don't check SoT Tracker's commits to see how late it became mobile friendly. At least this time I did it early!)

> This is still WIP! Don't expect a fully fleshed out fancy website. Let me cook.

### How it works

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Data is handled via a local JSON (no external DB)



## I want it!!!!
### Prerequisites
- Node.js 18+
- npm or npx

1. Clone the repo:
```bash
git clone https://github.com/yourusername/weekly-reset.git
cd weekly-reset
```

2. Install the dependencies:
```bash
npm install
```

3. Create data/events.json, manually or
```bash
mkdir data
echo "[]" > data/events.json
```

4. Run the development server:
```bash
npm run dev
```


5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Pull Requests

If you happen to be wishing to help this project, sure, go on. PRs are open. Thanks for the help.
