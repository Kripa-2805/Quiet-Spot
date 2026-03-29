from flask import Flask, render_template, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)
DATA_FILE = "data/reports.json"

def load_data():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

LOCATIONS = [
    "Main Library",
    "Central Canteen",
    "Block A Corridor",
    "Block B Corridor",
    "Ground Floor Lobby",
    "Reading Room",
    "Computer Lab",
    "Seminar Hall",
    "Parking Area",
    "Sports Ground"
]

@app.route("/")
def index():
    return render_template("index.html", locations=LOCATIONS)

@app.route("/submit", methods=["POST"])
def submit():
    data = load_data()
    entry = {
        "id": len(data) + 1,
        "location": request.form.get("location"),
        "noise_level": int(request.form.get("noise_level")),
        "note": request.form.get("note", "").strip(),
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "hour": datetime.now().hour
    }
    data.append(entry)
    save_data(data)
    return jsonify({"success": True, "message": "Report submitted!"})

@app.route("/api/stats")
def stats():
    data = load_data()
    if not data:
        return jsonify({"locations": [], "heatmap": [], "recent": [], "total": 0})

    # Per-location avg noise
    loc_data = {}
    for entry in data:
        loc = entry["location"]
        if loc not in loc_data:
            loc_data[loc] = []
        loc_data[loc].append(entry["noise_level"])

    location_stats = []
    for loc, levels in loc_data.items():
        avg = sum(levels) / len(levels)
        location_stats.append({
            "location": loc,
            "avg_noise": round(avg, 1),
            "reports": len(levels),
            "status": get_status(avg)
        })
    location_stats.sort(key=lambda x: x["avg_noise"])

    # Heatmap by hour (0-23)
    hour_data = {}
    for entry in data:
        h = entry["hour"]
        if h not in hour_data:
            hour_data[h] = []
        hour_data[h].append(entry["noise_level"])

    heatmap = []
    for h in range(8, 22):
        if h in hour_data:
            avg = sum(hour_data[h]) / len(hour_data[h])
        else:
            avg = 0
        heatmap.append({"hour": h, "avg_noise": round(avg, 1)})

    # Recent 5 reports
    recent = sorted(data, key=lambda x: x["timestamp"], reverse=True)[:5]

    # Best spot right now
    current_hour = datetime.now().hour
    current_data = [e for e in data if e["hour"] == current_hour]
    best_now = None
    if current_data:
        loc_now = {}
        for e in current_data:
            loc = e["location"]
            if loc not in loc_now:
                loc_now[loc] = []
            loc_now[loc].append(e["noise_level"])
        best_loc = min(loc_now, key=lambda x: sum(loc_now[x])/len(loc_now[x]))
        best_now = best_loc

    return jsonify({
        "locations": location_stats,
        "heatmap": heatmap,
        "recent": recent,
        "total": len(data),
        "best_now": best_now
    })

def get_status(avg):
    if avg <= 2:
        return "Silent"
    elif avg <= 4:
        return "Quiet"
    elif avg <= 6:
        return "Moderate"
    elif avg <= 8:
        return "Noisy"
    else:
        return "Very Noisy"

if __name__ == "__main__":
    os.makedirs("data", exist_ok=True)
    # Seed some demo data
    if not os.path.exists(DATA_FILE):
        import random
        demo = []
        locs = LOCATIONS
        for i in range(60):
            hour = random.randint(8, 21)
            demo.append({
                "id": i+1,
                "location": random.choice(locs),
                "noise_level": random.randint(1, 10),
                "note": "",
                "timestamp": f"2025-01-15 {hour:02d}:{random.randint(0,59):02d}:00",
                "hour": hour
            })
        save_data(demo)
    app.run(debug=True)
