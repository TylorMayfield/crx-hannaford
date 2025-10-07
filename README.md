# Hannaford Coupons Auto-Clipper (Chrome Extension)

Automatically scroll and clip available coupons on `https://www.hannaford.com/coupons` with one click.

> IMPORTANT: This project is for personal convenience and educational purposes only.

## What it does

- Opens or focuses the Hannaford coupons page
- Scrolls to the bottom with a 250ms delay between steps until no more coupons auto-load
- Clicks all coupon buttons (`.clipTarget`) with a 750ms stagger
- Shows status notifications in the popup

You must be logged in to your Hannaford account for clipping to work.

## Installation (Developer Mode)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the extension:
   ```bash
   npm run build
   ```
3. Load the extension in Chrome:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` directory

## Usage

1. Click the extension icon to open the popup
2. Press "Clip All Coupons"
3. If you're not logged in, the extension will prompt you to log in first

## Permissions

- `tabs`, `scripting` (to open/focus the coupons tab and message the content script)
- Host permission: `https://www.hannaford.com/*`

## Privacy

See `PRIVACY.md`. This extension does not collect, transmit, or sell personal data.

## Disclaimer (Non‑Affiliation)

This project is an independent, community-built tool. **I am not affiliated with Hannaford, Hannaford Supermarkets, Ahold Delhaize, or any Hannaford-related entity.** All trademarks, service marks, and brand names are the property of their respective owners.

## Development

- React 18 + Mantine UI
- Built with Vite and `@crxjs/vite-plugin`

### Scripts

```bash
npm run dev      # local development
npm run build    # production build (outputs to dist)
npm run preview  # preview build
```

## Project Structure

```
├── src/
│   ├── App.jsx              # Popup UI
│   ├── main.jsx             # Popup entry
│   ├── App.css              # Popup styles
│   └── content/content.js   # Coupons logic (scroll + click)
├── index.html               # Popup HTML
├── manifest.json            # Chrome extension manifest (MV3)
├── vite.config.js           # Build config
├── PRIVACY.md               # Privacy policy
└── README.md                # This file
```

## License

MIT
