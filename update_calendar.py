#!/usr/bin/env python3
"""Download an iCal feed and create availability.json for the static website."""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

OUTPUT = Path("availability.json")


def unfold_ical(text: str) -> list[str]:
    lines: list[str] = []
    for raw in text.replace("\r\n", "\n").split("\n"):
        if raw.startswith((" ", "\t")) and lines:
            lines[-1] += raw[1:]
        else:
            lines.append(raw)
    return lines


def parse_ical_date(value: str) -> date:
    value = value.strip()
    match = re.search(r"(\d{8})", value)
    if not match:
        raise ValueError(f"Fecha iCal no reconocida: {value!r}")
    return datetime.strptime(match.group(1), "%Y%m%d").date()


def main() -> int:
    url = os.environ.get("AIRBNB_ICAL_URL", "").strip()
    if not url:
        print("Falta el secreto AIRBNB_ICAL_URL.", file=sys.stderr)
        return 1

    request = urllib.request.Request(
        url,
        headers={"User-Agent": "Apartamento-Rural-Pedrosillo/1.0"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        ical_text = response.read().decode("utf-8", errors="replace")

    lines = unfold_ical(ical_text)
    events: list[tuple[date, date]] = []
    current: dict[str, str] | None = None

    for line in lines:
        if line == "BEGIN:VEVENT":
            current = {}
        elif line == "END:VEVENT":
            if current and "DTSTART" in current and "DTEND" in current:
                start = parse_ical_date(current["DTSTART"])
                end = parse_ical_date(current["DTEND"])
                if end > start:
                    events.append((start, end))
            current = None
        elif current is not None and ":" in line:
            key, value = line.split(":", 1)
            base_key = key.split(";", 1)[0]
            if base_key in {"DTSTART", "DTEND"}:
                current[base_key] = value

    occupied: set[str] = set()
    today = date.today()
    horizon = today + timedelta(days=730)

    for start, end in events:
        cursor = max(start, today)
        event_end = min(end, horizon)
        # DTEND is exclusive in iCal.
        while cursor < event_end:
            occupied.add(cursor.isoformat())
            cursor += timedelta(days=1)

    payload = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "occupied_dates": sorted(occupied),
    }
    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Generadas {len(occupied)} fechas ocupadas a partir de {len(events)} eventos.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
