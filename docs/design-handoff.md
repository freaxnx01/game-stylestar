# Handoff: StyleStar – Ankleide-Puzzle (Browserspiel)

## Overview
StyleStar ist ein Anziehspiel/Ankleide-Puzzle für Mädchen ab ca. 11 Jahren im Stil bunter Poki-Casual-Games (Referenz: „Fashion Legends"). Die Spielerin stylt eine Figur über 6 Ebenen (Haare, Kleider, Oberteile, Unterteile, Schuhe, Extras) passend zu einem vorgegebenen Thema. Der Look wird mit Sternen und Likes bewertet; ab 2 Sternen wird das nächste von 8 Themen-Levels freigeschaltet. Fortschritt wird lokal gespeichert.

## About the Design Files
Die Dateien in diesem Paket sind **Design-Referenzen in HTML** — ein lauffähiger Prototyp, der Look und Verhalten zeigt, **kein Produktionscode zum direkten Übernehmen**. Aufgabe: Diese Designs in der Ziel-Codebasis mit deren etablierten Patterns und Libraries nachbauen (React, Vue, Svelte …). Existiert noch keine Codebasis, wähle das passendste Framework (empfohlen: React + Vite oder reines TypeScript/Canvas-freies DOM — das Spiel braucht keine Game-Engine) und implementiere die Designs dort.

- `StyleStar Anziehspiel.dc.html` — Prototyp (Template + Logikklasse). Das Template nutzt ein proprietäres Streaming-Format (`sc-if`/`sc-for`/`{{ holes }}`); Struktur und Inline-Styles sind aber 1:1 lesbar.
- `wardrobe.js` — **direkt wiederverwendbar**: komplette Daten- und Asset-Ebene (alle SVG-Grafiken als Data-URIs, Item-Katalog mit Tags, Themen-Liste). ES-Modul ohne Abhängigkeiten.

## Fidelity
**High-fidelity.** Farben, Typografie, Abstände, Radien, Schatten und Copy sind final und sollen pixelgenau nachgebaut werden. Alle Werte stehen unten und in den Quelldateien.

## Architektur-Kernidee (aus der Nutzer-Anforderung)
Die Figur besteht aus **gestapelten Ebenen** (Layern) mit identischem Koordinatensystem (SVG-viewBox `0 0 300 620`). Jedes Kleidungsstück ist eine transparente SVG-Grafik im selben Koordinatenraum; Anziehen = Layer einblenden. Stapelreihenfolge (unten → oben):
1. `hairBack` (Haar-Rückseite)
2. `doll` (Körperbasis, Hautton-abhängig, inkl. neutraler Unterwäsche)
3. `shoes`
4. `bottom` (Unterteil)
5. `top` (Oberteil)
6. `dress` (Kleid — schließt top+bottom gegenseitig aus)
7. `hairFront` (Pony/Vorderhaar)
8. `extra` (Accessoire, ganz oben)

Alle Layer sind absolut positionierte Elemente (`inset:0`) in einem Container mit `aspect-ratio:300/620`, Grafik als `background-image` mit `background-size:contain; background-position:center top`.

## Screens / Views

### 1. Start
- **Purpose**: Titel, Hautton-Wahl, Spielstart.
- **Layout**: Flex-Zentrierung, `flex-wrap`, Gap `12px 56px`, Padding `32px 24px`. Links Textspalte (max 460px), rechts Figuren-Vorschau (`height:min(62vh,520px)`, aspect-ratio 300/620, sanfte Float-Animation).
- **Components**:
  - Logo „StyleStar": Fredoka 700, `clamp(52px,8vw,88px)`, Weiß, `text-shadow: 0 4px 0 #E85FA8, 0 10px 28px rgba(214,67,127,.35)`, letter-spacing 2px.
  - Untertitel-Pill: „Dein Ankleide-Studio – style Outfits zum Thema!", `rgba(255,255,255,.8)`, radius 999px, Padding 8×22, Nunito 800 17px, Farbe `#8A4FB8`.
  - Hautton-Reihe: Label „Dein Hautton:" (Nunito 800 15px `#7A5A96`) + 3 Kreis-Buttons 40×40, Farben `#F8CEAA` / `#DCA478` / `#9C6B43`, Border 3px (`#F45FA2` aktiv, sonst Weiß).
  - CTA „Los geht's!": Fredoka 600 26px Weiß, Gradient `linear-gradient(120deg,#FF5FA8,#B45FF4)`, radius 999px, Padding 16×52, Schatten `0 8px 22px rgba(214,67,127,.4)`, Hover `scale(1.05)`.

### 2. Themenwahl (Level-Select)
- **Purpose**: Eines von 8 Themen wählen; gesperrte Themen zeigen Schloss.
- **Layout**: Spalte, zentriert, Gap 26px, Padding 36×24. Karten-Grid `repeat(auto-fit,minmax(170px,1fr))`, Gap 18px, Breite `min(920px,100%)`.
- **Components**:
  - Überschrift „Wähle dein Thema": Fredoka 600 `clamp(30px,4.5vw,44px)` Weiß, `text-shadow:0 3px 0 #B476E0, 0 8px 20px rgba(138,79,184,.3)`.
  - Themen-Karte: Weiß, radius 24px, Padding 16×12, Schatten `0 8px 22px rgba(138,79,184,.16)`; Inhalt: Signatur-Item-Grafik (Höhe 105px, contain), Name (Fredoka 600 17px `#3D2B4F`), 3 Sterne 20×20 (verdient `#FFC531`, leer `#E4DCEF`).
  - Lock-Overlay (gesperrt): `rgba(255,255,255,.75)` über ganzer Karte, Schloss-Icon (`#B7A8CC`) + „Meistere das Thema davor" (Nunito 800 12px `#8A79A3`).
  - „Zurück zum Start"-Button: `rgba(255,255,255,.7)`, radius 999px, Nunito 800 15px `#8A4FB8`.

### 3. Ankleiden (Hauptspiel)
- **Purpose**: Items pro Kategorie an-/ausziehen, dann bewerten lassen.
- **Layout**: `height:100dvh`, Spalte. Header-Zeile (Padding 14×20, Gap 10, wrap) + Hauptbereich `flex:1` als Zeile (Gap 16, wrap): links Bühne (`flex:1;min-width:250px`), rechts Panel (Breite 370px, max 100%).
- **Header**: Zurück-Kreisbutton 44×44 (Weiß 85 %, „‹" `#B45FF4` 26px); Themen-Pill „Thema: {Name}" (Fredoka 600 19px); 3 Hinweis-Chips (Gradient `#FFE1EF→#EFE1FF`, radius 999px, Nunito 800 13px `#B0489B`); rechts „Thema X / 8"-Pill.
- **Bühne**: radialer Weiß-Glow (`min(46vh,380px)` Kreis), Figuren-Container `height:min(100%,72vh)`, darunter ellipsenförmiger Boden-Schatten `rgba(138,79,184,.18)`.
- **Panel**: `rgba(255,255,255,.72)`, radius 28px, Padding 14px, Schatten `0 10px 30px rgba(138,79,184,.15)`, Spalte mit Gap 12:
  - Tab-Reihe (6 Tabs: Haare, Kleider, Oben, Unten, Schuhe, Extras): Pills, Fredoka 600 14px, Padding 8×14; aktiv Gradient Pink→Lila + Weiß + Schatten, inaktiv `#F3ECFB` / `#8A4FB8`.
  - Item-Grid: 3 Spalten, Gap 10, scrollbar (`overflow:auto`). Erste Zelle „Ohne" (3px gestrichelt `#D8C8EC`, Text `#9B85B8`) wenn in der Kategorie etwas getragen wird (nicht bei Haaren). Item-Karte: Weiß, radius 18px, Padding 8×6, Grafik 62px hoch, Name Nunito 800 11.5px `#5C4478`; ausgewählt: Border `3px solid #FF5FA8` + Schatten `0 4px 14px rgba(255,95,168,.4)`, sonst transparente 3px-Border + `0 3px 10px rgba(138,79,184,.12)`.
  - CTA „Fertig – zeig deinen Look!": wie Start-CTA, 23px, Padding 13×20.

### 4. Bewertung (Modal)
- **Purpose**: Sterne + Likes zeigen, weiter/nochmal.
- **Layout**: Fixed Overlay `rgba(61,43,79,.45)` + `backdrop-filter:blur(3px)`, zentrierte Karte `min(92vw,430px)`, Weiß, radius 32px, Padding 34×30, Pop-in-Animation (scale .5→1, .35s ease), Schatten `0 24px 60px rgba(61,43,79,.35)`.
- **Components**:
  - Titel (Fredoka 700 32px): 3★ „Mega! Perfekter Look!" / 2★ „Super Style!" / 1★ „Hmm, fast …".
  - 3 Sterne 52×52 (`#FFC531` / `#E4DCEF`).
  - Likes-Pill: Gradient `#FFE1EF→#EFE1FF`, Herz-Icon `#F4436B`, „{n} Likes" Fredoka 600 26px; Zahl zählt hoch (siehe Interactions). `white-space:nowrap` gegen Umbruch!
  - Tipp (nur unter Freischalt-Schwelle): „Tipp: Dein Look sollte so sein – {Hinweise}. Schau dir die Kleider genau an!" Nunito 700 14px `#8A79A3`.
  - Buttons: „Nochmal stylen" (`#F3ECFB` / `#B45FF4`), „Nächstes Thema" (Gradient-CTA, nur bei Freischaltung), „Alle Themen" (Text-Link, unterstrichen, `#8A79A3`).

## Interactions & Behavior
- **Anziehen**: Klick auf Item-Karte trägt das Item; erneuter Klick zieht es aus (Haare können nicht entfernt, nur getauscht werden). Kleid anziehen leert Oberteil+Unterteil; Ober-/Unterteil anziehen leert Kleid.
- **Bewertung** („Fertig"-Klick): Punkte = Outfit-Match. Jedes getragene Item mit passendem Themen-Tag zählt: Kleid 2 Punkte ODER Oberteil 1 + Unterteil 1; Schuhe 1; Extra 1 (max. 4). Sterne: ≥4 → 3★, ≥2 → 2★, sonst 1★. Likes = `40 + punkte*38 + zufall(0–19)`.
- **Freischaltung**: ab 2★ (Schwer-Modus: 3★) wird das nächste Thema freigeschaltet; beste Sternzahl pro Thema wird gespeichert.
- **Likes-Count-up**: von 0 in +3er-Schritten alle ~28 ms bis zum Endwert.
- **Animationen**: `floaty` (translateY 0→−16px, 6–10 s ease-in-out infinite) auf Deko-Kreisen und Start-Figur; `pop` (scale .5→1 + fade, .35 s) auf Modal; `spin` (0.9 s linear) auf Lade-Spinner. Button-Hover: `transform:scale(1.05)`, transition .15 s.
- **Responsive**: alles Flex/Grid mit `flex-wrap`; Panel rutscht auf Schmalbild unter die Bühne; Karten-Grid `auto-fit`. Touch-Ziele ≥ 44px.
- **Loading**: bis Daten geladen sind Spinner + „Kleider werden gebügelt …" (Fredoka 22px `#7A5A96`).

## State Management
- `screen`: `'start' | 'levels' | 'game'`
- `skin`: Index 0–2 (Hautton)
- `levelIdx`: aktueller Themen-Index (0–7)
- `tab`: aktive Kategorie (`hair|dress|top|bottom|shoes|extra`)
- `worn`: `{ hair, top, bottom, dress, shoes, extra }` (Item-IDs oder null); Startzustand: `{hair:'h1', top:'t2', bottom:'b2', shoes:'s2'}`
- `result`: `{ stars, likes } | null` (steuert Modal)
- `likesShown`: Count-up-Zwischenwert
- `progress`: `{ unlocked: number, stars: Record<themeId, number> }` — **persistiert in `localStorage`** (Key im Prototyp: `stylestar_v1`)
- Konfig-Flags (im Prototyp Tweaks/Props): `alleThemenOffen` (alle Level offen), `schwierig` (3★ zum Freischalten)

## Data Model (aus `wardrobe.js`, direkt übernehmbar)
- **Item**: `{ id, name, tags: ThemeId[], cat, img (Data-URI, viewBox 0 0 300 620), thumb (Data-URI, zugeschnittene viewBox) }`
- **Haar**: `{ id, name, backImg, frontImg, thumb }` — 6 Frisuren (h1–h6)
- **Katalog**: 9 Oberteile, 7 Unterteile, 4 Kleider, 6 Schuhe, 9 Extras
- **Themen** (Reihenfolge = Level-Reihenfolge): pyjama „Pyjama-Party", schule „Schulparty", strand „Strand & Sommer", sport „Sport & Streetwear", festival „Festival", winter „Winter-Style", kpop „K-Pop Star", ball „Prinzessinnen-Ball". Jedes Thema: `{ id, name, hints: [3 Wörter], sig: Signatur-Item-ID }`
- Matching: Item passt, wenn `item.tags.includes(theme.id)`; Items können mehreren Themen dienen (z. B. Sneaker: schule, festival, sport, kpop).

## Design Tokens
- **Fonts** (Google Fonts): Fredoka 400–700 (Headlines, Buttons), Nunito 400–800 (Fließtext, Labels)
- **Hintergrund**: `linear-gradient(165deg, #FFD9EE 0%, #E7D6FF 48%, #CDEDFF 100%)`
- **Primär-Gradient (CTAs/aktive Tabs)**: `linear-gradient(120deg, #FF5FA8, #B45FF4)`
- **Chip-Gradient**: `linear-gradient(120deg, #FFE1EF, #EFE1FF)`
- **Text**: `#3D2B4F` (dunkel), `#7A5A96` / `#8A79A3` (gedämpft), `#8A4FB8` (lila Akzent), `#B0489B` (Chip-Text), `#5C4478` (Item-Namen)
- **Akzente**: Pink `#F45FA2` / `#FF5FA8`, Lila `#B45FF4`, Sterne-Gold `#FFC531`, Stern-leer `#E4DCEF`, Herz `#F4436B`, Links `#D6437F` (hover `#A82C60`)
- **Hauttöne**: `#F8CEAA`, `#DCA478`, `#9C6B43`
- **Radien**: 999px (Pills/Buttons), 32px (Modal), 28px (Panel), 24px (Level-Karten), 18px (Item-Karten)
- **Schatten**: Karten `0 8px 22px rgba(138,79,184,.16)`; CTA `0 8px 22px rgba(214,67,127,.4)`; Modal `0 24px 60px rgba(61,43,79,.35)`; Panel `0 10px 30px rgba(138,79,184,.15)`
- **Schriftgrößen**: Logo clamp(52–88), H1 clamp(30–44), Modal-Titel 32, CTA 23–26, Pills 13–19, Item-Name 11.5

## Assets
Alle Grafiken sind **programmatisch erzeugte Inline-SVGs** in `wardrobe.js` (Data-URIs, keine externen Bild-Dateien): Figuren-Basis pro Hautton (`dollUri(farbe)`), 6 Frisuren (je Rück-/Vorderlayer), 35 Kleidungsstücke/Accessoires, jeweils mit Thumbnail-viewBox. Icons (Stern, Herz, Schloss) sind kleine Inline-SVG-Paths im Markup. Keine Lizenz-/Brand-Assets.

## Files
- `StyleStar Anziehspiel.dc.html` — Prototyp: komplettes UI-Markup mit allen Inline-Styles + Logikklasse (State, Scoring, Persistenz)
- `wardrobe.js` — Daten & SVG-Assets (wiederverwendbares ES-Modul)
