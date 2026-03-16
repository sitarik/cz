#!/usr/bin/env python3
"""
generate_log_index.py — Lokální generátor log/index.json

Použití:
    python3 generate_log_index.py

Spusť z kořene repozitáře. Vygeneruje log/index.json
ze všech .md souborů ve složce log/.

Formát názvu souboru: YYYY-MM-DD-slug.md
Titul se čte z prvního řádku začínajícího #
Seřazeno od nejnovějšího.
"""

import os
import json
import re

LOG_DIR = "log"


def main():
    posts = []

    for name in sorted(os.listdir(LOG_DIR), reverse=True):
        if not name.endswith(".md"):
            continue

        # Datum z názvu souboru
        date_match = re.match(r"^(\d{4}-\d{2}-\d{2})", name)
        if not date_match:
            print(f"  PŘESKOČENO (chybí datum v názvu): {name}")
            continue
        date = date_match.group(1)

        # Titul z prvního řádku začínajícího #
        title = name  # fallback pokud # nenajdeme
        path = os.path.join(LOG_DIR, name)
        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("# "):
                    title = line[2:].strip()
                    break

        posts.append({"file": name, "title": title, "date": date})
        print(f"  + {date}  {title}")

    output_path = os.path.join(LOG_DIR, "log.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)

    print(f"\nVygenerováno {len(posts)} záznamů → {output_path}")


if __name__ == "__main__":
    main()
