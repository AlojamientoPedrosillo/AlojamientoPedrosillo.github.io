#!/usr/bin/env python3
"""Combine Airbnb and Booking iCal feeds into availability.json."""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

OUTPUT = Path("availability.json")
CALENDARS = {
    "Airbnb": "AIRBNB_ICAL_URL",
    "Booking": "BOOKING_ICAL_URL",
}


def unfold_ical(text: str) -> list[str]:
    """Join folded iCalendar lines."""
    lines: list[str] = []
    for raw in text.replace("\r\n", "\n").split("\n"):
        if raw.startswith((" ", "\t")) and lines:
            lines[-1] += raw[1:]
        else:
            lines.append(raw)
    return lines


def parse_ical_date(value: str) -> date:
    """Extract a YYYYMMDD date from an iCalendar value."""
    match = re.search(r"(\d{8})", value.strip())
    if not match:
        raise ValueError(f"Fecha iCal no reconocida: {value!r}")
    return datetime.strptime(match.group(1), "%Y%m%d").date()


def download_calendar(name: str, url: str) -> str:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "Apartamento-Rural-Pedrosillo/2.0"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        content_type = response.headers.get("Content-Type", "")
        raw = response.read()

    text = raw.decode("utf-8", errors="replace")
    if "BEGIN:VCALENDAR" not in text:
        raise ValueError(
            f"La respuesta de {name} no parece un calendario iCal "
            f"(Content-Type: {content_type or 'desconocido'})."
        )
    return text


def parse_events(ical_text: str) -> list[tuple[date, date]]:
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

    return events


def main() -> int:
    configured: list[tuple[str, str]] = []

    for name, variable in CALENDARS.items():
        url = os.environ.get(variable, "").strip()
        if url:
            configured.append((name, url))
        else:
            print(f"Aviso: no se ha configurado {variable}.", file=sys.stderr)

    if not configured:
        print(
            "No hay ningún calendario configurado. "
            "Añade AIRBNB_ICAL_URL y BOOKING_ICAL_URL como secretos.",
            file=sys.stderr,
        )
        return 1

    occupied: set[str] = set()
    today = date.today()
    horizon = today + timedelta(days=730)
    source_summary: dict[str, int] = {}

    for name, url in configured:
        try:
            ical_text = download_calendar(name, url)
            events = parse_events(ical_text)
        except Exception as exc:
            print(f"Error al procesar {name}: {exc}", file=sys.stderr)
            return 1

        source_summary[name] = len(events)

        for start, end in events:
            cursor = max(start, today)
            event_end = min(end, horizon)

            # DTEND es exclusivo en iCalendar:
            # la fecha de salida vuelve a quedar disponible.
            while cursor < event_end:
                occupied.add(cursor.isoformat())
                cursor += timedelta(days=1)

    payload = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "sources": source_summary,
        "occupied_dates": sorted(occupied),
    }

    OUTPUT.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    source_text = ", ".join(
        f"{name}: {count} eventos" for name, count in source_summary.items()
    )
    print(f"Calendarios procesados: {source_text}.")
    print(f"Generadas {len(occupied)} fechas ocupadas sin duplicados.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
