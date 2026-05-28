# Macro Tracker — Claude Code Handoff Prompt

Paste everything below this line into Claude Code:

---

## Context

I've been building a macro tracking web app in a Claude.ai conversation. The app is already live. Here's everything you need to know to take over.

## Live URLs
- **GitHub:** https://github.com/ross1073/macro-tracker
- **Netlify:** https://ross-macro-tracker.netlify.app

## What the app does
A single HTML file (macro-tracker.html) that lets me log meals and nutrition data to a Google Sheet via a Pabbly webhook. It uses the Claude API with web search enabled to look up real nutrition data for anything I type or photograph.

## My profile (baked into the app)
- 52-year-old male, 6ft, 182lbs
- Daily targets: 2200 cal / 150g protein / 220g carbs / 70g fat / 38g fiber

## App features
1. **Daily progress bars** — tracks calories, protein, carbs, fat against my targets with a color-coded coaching message after each meal
2. **Quick Log buttons** — 4 hardcoded favorites with exact macros from their nutrition labels:
   - ☕ Perk (80 cal, 9g protein, 2.5g fat, 8g carbs, 5g sugar, 2g fiber, 0mg chol, 8oz water)
   - 🥛 Protein Shake — Happy Day whey 2 scoops + 16oz 1% milk (334 cal, 42g protein, 7g fat, 28g carbs, 27g sugar, 1g fiber, 20mg chol, 16oz water)
   - 🍫 Misery Pudding — 2 scoops whey + 1 cup nonfat Greek yogurt + 1 tbsp granola (310 cal, 52g protein, 3g fat, 20g carbs, 15g sugar, 1g fiber, 8mg chol, 0oz water)
   - 💧 Water 12oz (all zeros except 12oz water)
3. **Text or photo input** — describe a meal or upload a photo
4. **Claude API + web search** — Claude searches the web in real time for accurate nutrition data instead of guessing from memory
5. **Clarifying questions** — only asked when the food is genuinely unidentifiable (e.g. "leftovers"), never for obvious foods
6. **Confirm before logging** — macros shown first, user edits if needed, then hits Confirm & Log
7. **Pabbly webhook** — fires JSON payload to Pabbly which writes a row to Google Sheets
8. **Settings hidden behind ⚙ gear icon** — webhook URL stored in localStorage

## Google Sheet columns (exact order)
Timestamp | Meal | Food | Calories | Protein | Fat | Carbs | Sugar | Fiber | Cholesterol | Water

## JSON payload sent to Pabbly
```json
{
  "timestamp": "2026-03-26 08:42:00",
  "meal": "Breakfast",
  "food": "2 scrambled eggs, whole wheat toast",
  "calories": 320,
  "protein": 18,
  "fat": 12,
  "carbs": 34,
  "sugar": 4,
  "fiber": 3,
  "cholesterol": 380,
  "water": 0
}
```

## Claude API call structure (important)
The nutrition lookup uses web search enabled:
```javascript
fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: SYSTEM,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    messages: conversationHistory
  })
})
```

## Current issue to fix first
The live Netlify site is showing an older version of the file that's missing the Quick Log favorite buttons. The correct latest file needs to be pulled and redeployed. The latest correct version of macro-tracker.html should have:
- Quick Log section with 4 favorite buttons (Perk, Protein Shake, Misery Pudding, Water)
- ⚙ Settings drawer at the bottom (no visible webhook label in main UI)
- Claude + web search for nutrition lookup (no USDA API)

## What I need you to do
1. Check what's currently in the macro-tracker repo
2. Compare it to the feature list above and identify what's missing or outdated
3. Update macro-tracker.html to match all features described above
4. Push to GitHub and redeploy to Netlify
5. Confirm the live URL is showing the correct version

My webhook URL is already saved in the app's localStorage on my phone — don't hardcode it in the file.
