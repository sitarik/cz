# CLAUDE.md — sitarik.cz

Instrukce pro Claude Code při práci v tomto repozitáři.

## O projektu

Terminálový web sitarik.cz — čisté HTML/CSS/JS, žádný framework.
Obsahuje terminálové hry (`games/`), log zápisků (`log/`), tipy (`tips.json`) a interaktivní prvky.

## Tvorba terminálových her

Hry jsou uloženy v `games/`. Hráč je spouští příkazem `play <číslo>` v terminálu webu.

### Soubory

- `games/index.json` — seznam her (zobrazí se příkazem `games`)
- `games/<název>.json` — samotná hra

### index.json

```json
[
  {
    "file": "nazev-hry.json",
    "title": "Zobrazovaný název",
    "desc": "Krátký popis — jeden řádek."
  }
]
```

### Struktura hry

```json
{
  "title": "Název hry",
  "start": "id_uvodni_sceny",
  "stats": { "xp": 0, "lives": 3 },
  "scenes": { ... }
}
```

| Pole | Popis |
|---|---|
| `title` | Zobrazí se při spuštění jako `── NÁZEV HRY ──` |
| `start` | ID scény, kde hra začíná |
| `stats.xp` | Počáteční XP (obvykle 0) |
| `stats.lives` | Počet životů (0 = hra bez životů) |

### Scéna

```json
"id_sceny": {
  "name": "Volitelný název scény",
  "text": "Popis situace.\nMůže být víceřádkový.",
  "choices": [ ... ]
}
```

| Pole | Popis |
|---|---|
| `name` | Zobrazí se jako `▌ NÁZEV` — nepovinné, fallback je ID scény |
| `text` | Zobrazí se šedě; odřádkování přes `\n` |
| `choices` | Pole dostupných příkazů |
| `end: true` | Konec — výhra; zobrazí `── KONEC HRY ──` a celkové XP |
| `dead: true` | Konec — prohra; zobrazí `── GAME OVER ──` |

Scéna má buď `choices`, nebo `end`/`dead` — nikdy obojí.

### Volba (choice)

```json
{
  "cmd": "prozkoumej rack",
  "next": "id_dalsi_sceny",
  "reply": "Text zobrazený před přechodem.",
  "xp": 10,
  "lives": -1,
  "gives": "název_předmětu",
  "requires": "název_předmětu",
  "requires_xp": 50,
  "missing": "Text při nesplnění podmínky.",
  "once": true
}
```

| Pole | Povinné | Popis |
|---|---|---|
| `cmd` | ✓ | Příkaz, který hráč napíše |
| `next` | ✓ | ID cílové scény |
| `reply` | — | Zpráva zobrazená před přechodem |
| `xp` | — | Přičtené XP |
| `lives` | — | Změna životů (`-1`, `+1`, `-3` …) |
| `gives` | — | Přidá předmět do inventáře |
| `requires` | — | Dostupné jen s tímto předmětem v inventáři |
| `requires_xp` | — | Dostupné jen při dostatku XP |
| `missing` | — | Text při nesplněné podmínce |
| `once` | — | Volba zmizí po prvním použití |

### Vestavěné příkazy (vždy dostupné během hry)

| Příkaz | Funkce |
|---|---|
| `inventar` | Vypíše inventář |
| `exit` | Ukončí hru bez výsledku |
| `restart` | Restartuje hru (dostupný i po konci) |

### HUD

Zobrazuje se automaticky, pokud `lives > 0`:
```
❤ ❤ ❤   XP: 25   │   patch_kabel, tester_kabelu
```

### Doporučení

- Příkazy bez diakritiky nebo s ní — důsledně jedno nebo druhé v celé hře
- 2–4 volby na scénu
- `once: true` na sběr předmětů — zabrání opakování
- `dead` scény nemají `choices`
- Více konců s různým XP zpestří hru
- Po přidání hry aktualizuj `games/index.json`
