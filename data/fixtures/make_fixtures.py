"""Regenerate the xlsx and json variants of the SYNTHETIC fixtures from the csv files.

    uv run python data/fixtures/make_fixtures.py

Test fixtures only. Never loaded outside tests.
"""
import csv
import json
from pathlib import Path

from openpyxl import Workbook

HERE = Path(__file__).parent


def read(name):
    with open(HERE / name, newline="", encoding="utf-8") as fh:
        return list(csv.reader(fh))


def to_xlsx(name, out):
    wb = Workbook()
    ws = wb.active
    for r in read(name):
        ws.append([c if c != "" else None for c in r])
    wb.save(HERE / out)


def to_json(name, out):
    rows = read(name)
    head = rows[0]
    recs = [{h: v for h, v in zip(head, r) if v != ""} for r in rows[1:]]
    (HERE / out).write_text(json.dumps(recs, indent=1), encoding="utf-8")


if __name__ == "__main__":
    to_xlsx("operators_synthetic.csv", "operators_synthetic.xlsx")
    to_json("operators_synthetic.csv", "operators_synthetic.json")
    to_xlsx("outreach_lists_synthetic.csv", "outreach_lists_synthetic.xlsx")
    to_json("aircraft_synthetic.csv", "aircraft_synthetic.json")
