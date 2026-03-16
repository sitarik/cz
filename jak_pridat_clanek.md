# Jak přidat nový článek

## Postup

### 1. Vytvoř soubor

V adresáři `log/` vytvoř nový soubor podle schématu:

```
log/YYYY-MM-DD-slug.md
```

**Příklady:**
```
log/2026-03-15-vlsm-subnetting.md
log/2026-04-01-ospf-vs-eigrp.md
log/2026-05-10-packet-tracer-tipy.md
```

Pravidla:
- datum vždy na začátku ve formátu `YYYY-MM-DD`
- slug = krátký popis tématu, malá písmena, pomlčky místo mezer, bez diakritiky
- přípona `.md`

---

### 2. Obsah souboru

**První řádek musí být nadpis** — z něj se čte titul článku:

```markdown
# Název článku

Úvodní odstavec...

## Podnadpis

Další obsah, **tučný text**, *kurzíva*, `inline kód`.

- odrážka jedna
- odrážka dvě

### Menší nadpis

> Citát nebo poznámka

---

Závěr.
```

[Podporovaný Markdown](typografie.html)

---

### 3. Publikace na GitHubu (automaticky)

```bash
git add log/2026-03-15-vlsm-subnetting.md
git commit -m "log: přidán článek o VLSM subnettingu"
git push
```

GitHub Action automaticky:
1. přečte první `# Nadpis` z nového souboru
2. aktualizuje `log/log.json`
3. commitne zpět do repozitáře

Článek se zobrazí na webu do ~1 minuty.

---

### 3b. Lokální aktualizace index.json (bez GitHubu)

Pokud web provozuješ jinde nebo chceš index aktualizovat ručně:

```bash
# Spusť z kořene repozitáře
python3 generate_log_index.py
```

Výstup:
```
  + 2026-03-15  VLSM subnetting — jak na to
  + 2025-01-27  NetAcad CCNA vs. Cisco CCNA

Vygenerováno 2 záznamů → log/log.json
```

---

## Tip: lokální testování před publikací

```bash
cd /cesta/k/repozitáři
python3 generate_log_index.py   # aktualizuj index
python3 -m http.server 8080     # spusť server
```

Otevři: `http://localhost:8080`
