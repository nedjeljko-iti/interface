# Interface - Import podataka u Oracle bazu

## Što gradimo

Web aplikacija (React + Node.js) za import financijskih podataka iz Excel fajlova u Oracle bazu podataka. Zamjena za stari Delphi program (`stari_interface/`).

Počinjemo s jednim modulom: **Univerzalni import temeljnice** (import journal entries iz Excela).

---

## Arhitektura

- **Frontend**: React
- **Backend**: Node.js (REST API)
- **Baza**: Oracle (paket `fininterface`, schema `itifin`)

---

## Oracle procedura

Puno ime: `itifin.fininterface.Univerzalni_Import_Temeljnica`

Nalazi se u fajlu `procedura.txt`.

### Potpis funkcije:
```
FUNCTION Univerzalni_Import_Temeljnica (
    p_datum     IN  CLOB,   -- datumi knjiženja (pipe-delimited)
    p_pod       IN  CLOB,   -- poduzeće
    p_god       IN  CLOB,   -- godina
    p_org       IN  CLOB,   -- org. jedinica
    p_dok       IN  CLOB,   -- vrsta dokumenta
    p_br        IN  CLOB,   -- interni broj temeljnice (grupira stavke)
    p_opis      IN  CLOB,   -- opis
    p_konta     IN  CLOB,   -- konto (6 znakova)
    p_ana       IN  CLOB,   -- analitika (partner ID)
    p_mjtk      IN  CLOB,   -- mjesto troška (org. jedinica)
    p_iznosd    IN  CLOB,   -- iznos duguje
    p_iznosp    IN  CLOB,   -- iznos potražuje
    p_val       IN  CLOB,   -- valuta (ID)
    p_iznval    IN  CLOB,   -- iznos u valuti
    p_datdok    IN  CLOB,   -- datum dokumenta
    p_datdosp   IN  CLOB,   -- datum dospijeća
    p_tko       IN  VARCHAR2, -- korisnik (login)
    p_info      OUT VARCHAR2  -- output poruka
) RETURN NUMBER
```

### Return kodovi:
- `0` → uspjeh, `p_info` sadrži popis unesenih temeljnica
- `1` → godina zatvorena
- `2` → nepostojeći konto, `p_info` = `stavka|konto`
- `3` → već importirano, `p_info` = identifikator
- `-1` → nepoznata greška, `p_info` = SQLERRM

### Format CLOB parametara:
Svaki parametar je niz vrijednosti odvojenih `|` (pipe), jedna vrijednost po stavci.

Primjer za 3 stavke:
```
p_pod   = "1|1|1"
p_konta = "100000|200000|300000"
p_datum = "01.01.2025|01.01.2025|01.01.2025"
```

Datumi u formatu: `dd.mm.yyyy`

Iznosi kao decimalni brojevi s točkom: `1234.56`

---

## Excel format (ulazni fajl)

Stari program koristio semicolon-delimited txt file, novi će koristiti isti raspored kolona ali u `.xlsx` formatu.

### Kolone (semicolon redosljed iz starog programa, sada Excel kolone A-Q):

| Kolona | Naziv | Tip | Opis |
|--------|-------|-----|------|
| 1 (A) | pod | integer | Poduzeće |
| 2 (B) | god | integer | Godina |
| 3 (C) | org | integer | Org. jedinica |
| 4 (D) | dok | integer | Vrsta dokumenta |
| 5 (E) | br | integer | Broj (opcionalno - ako prazno, auto-inkrement) |
| 6 (F) | (rezervirano) | - | Nije u upotrebi (stara glava) |
| 7 (G) | opis | string | Opis stavke |
| 8 (H) | konto | string | Konto (6 znakova) |
| 9 (I) | analitika | integer | Analitika / partner ID (0 ako ne postoji) |
| 10 (J) | mjtk | integer | Mjesto troška (0 ako ne postoji) |
| 11 (K) | smjer | string | D = duguje, P = potražuje |
| 12 (L) | iznos | decimal | Iznos |
| 13 (M) | val | integer | Valuta ID |
| 14 (N) | iznval | decimal | Iznos u valuti |
| 15 (O) | datdosp | date | Datum dospijeća (dd.mm.yyyy) |
| 16 (P) | datdok | date | Datum dokumenta (dd.mm.yyyy) |
| 17 (Q) | datk | date | Datum knjiženja (dd.mm.yyyy) |

---

## Oracle konekcija

Connection podatke korisnik će dati kasnije. Čuvaju se u `.env` fajlu (nije u gitu).

Struktura `.env`:
```
ORACLE_USER=itifin
ORACLE_PASSWORD=...
ORACLE_HOST=...
ORACLE_PORT=1521
ORACLE_SERVICE=...
```

---

## Status projekta

- [x] Analiza starog programa
- [x] Razumijevanje Oracle procedure
- [ ] Kreiranje Node.js backend projekta
- [ ] Kreiranje React frontend projekta
- [ ] Excel upload i parsiranje
- [ ] Poziv Oracle procedure
- [ ] Prikaz rezultata korisniku

---

## Napomene

- Stari Delphi kod je u `stari_interface/` - samo za referencu, ne kopirati arhitekturu
- Aplikacijski server (`AS_Fis/`) je stari Delphi AppServer - novi Node.js ga zamjenjuje direktnom konekcijom na Oracle
- Za sada bez pretjeranih validacija - fokus na funkcionalnost
- `oracledb` npm paket zahtijeva Oracle Instant Client na sustavu
