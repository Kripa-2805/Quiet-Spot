# 🔇 QuietSpot — Campus Noise Intelligence

> A community-powered noise map for your campus. Know where to study before you walk there.

## What It Does

QuietSpot lets students report noise levels at different campus locations in real time. The dashboard shows:

- **Spot Rankings** — quietest to noisiest locations based on all reports
- **Hourly Heatmap** — which hours are loud vs peaceful on campus
- **Live Best Spot** — the quietest place right now, based on recent reports
- **Recent Feed** — live reports from your campus community

## Tech Stack

- **Backend**: Python + Flask
- **Frontend**: HTML, CSS, Vanilla JS
- **Storage**: JSON file (no database needed)
- **Fonts**: Google Fonts (Playfair Display, DM Mono, Crimson Pro)

## Setup & Run

```bash
# 1. Clone or download the project
cd quietspot

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the app
python app.py

# 4. Open in browser
http://127.0.0.1:5000
```

## Project Structure

```
quietspot/
├── app.py              # Flask backend (routes, data logic)
├── requirements.txt    # Python dependencies
├── data/
│   └── reports.json    # Stored reports (auto-created)
└── templates/
    └── index.html      # Full frontend (HTML + CSS + JS)
```

## How to Use

1. Select a campus location from the dropdown
2. Drag the slider to rate the noise level (1 = silent, 10 = chaotic)
3. Add an optional note (e.g. "construction going on")
4. Hit Submit — dashboard updates instantly

## Features

- Real-time noise stats per location
- Hourly heatmap (8am–9pm)
- Auto-refreshes every 30 seconds
- "Best spot right now" recommendation
- Fully responsive design

## Demo Data

On first run, 60 sample reports are auto-generated so the dashboard looks populated. These are clearly demo entries and get replaced by real reports.

---

Made with 🤫 for students who just want to focus.
