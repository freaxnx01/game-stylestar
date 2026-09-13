# Design: Test-Suite bei Push und Pull Request ausführen

**Issue:** [#4](https://github.com/freaxnx01/game-stylestar/issues/4)
**Datum:** 2026-09-13
**Status:** validiert (Quick-Mode — Entscheidungen als Assumptions dokumentiert)

## Ziel

Seit PR #3 liegt eine Test-Suite im Repo (`tests/wardrobe.test.mjs`,
`tests/progress.test.mjs`, 22 Tests, `npm test`). Kein Workflow führt sie aus —
in `.github/workflows/` liegt nur `agent.yml`, das ausschliesslich auf das Label
`ai-implement` reagiert. Die Suite gated damit nichts.

Dieses Design ergänzt einen Workflow, der `npm test` bei jedem Push auf `main`
und bei jedem Pull Request laufen lässt.

## Umfang

Eine neue Datei, `.github/workflows/test.yml`. Kein bestehender Workflow wird
angefasst; `agent.yml` bleibt unverändert.

```yaml
name: Tests
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: npm test
```

Kein `npm ci`, kein Dependency-Cache: `package.json` hat weder `dependencies`
noch `devDependencies` und es gibt keine Lockfile. `node --test` bringt den
Runner mit, es ist also nichts zu installieren.

## Assumptions

- **A1** [high] Node wird auf `'24'` gepinnt statt auf `lts/*`.
  Rejected: `lts/*`. Lokal läuft Node v24.14.1, und das Verhalten von
  `node --test` bei der Testsuche hat sich zwischen Node-Versionen verändert —
  genau daran ist `npm test` in PR #3 gescheitert (`node --test tests/` stirbt
  auf v24 mit `MODULE_NOT_FOUND`). Eine feste Version hält CI und Arbeitsplatz
  gleich; ein Floating-LTS könnte lokal grün und in CI rot sein.

- **A2** [high] Trigger sind `push` auf `main` und `pull_request` ohne
  Branch-Filter.
  Rejected: nur `pull_request`. Die agent-workflow-Pipeline pusht Feature-Branches
  und öffnet dann einen PR, aber sie merged auch direkt auf `main`, wenn ein
  Mensch squash-merged — ohne den Push-Trigger bliebe `main` selbst ungetestet.

- **A3** [med] Die Actions werden auf Major-Tags referenziert
  (`actions/checkout@v4`, `actions/setup-node@v4`), nicht auf Commit-SHAs.
  Rejected: SHA-Pinning. Beide sind GitHub-eigene Actions, und der Consumer-Stub
  `agent.yml` verwendet mit `@v1` bereits dieselbe Konvention. Der offene Punkt
  „unpinned actions" ist in `TODO.md` geparkt und betrifft beide Dateien
  gemeinsam — ihn hier einseitig zu lösen, würde die Datei vom Rest des Repos
  abkoppeln.

- **A4** [med] Der Workflow heisst `test.yml`, der Job `test`, der Anzeigename
  `Tests`. Rejected: `ci.yml`. Der Workflow tut genau eine Sache; ein
  generisches `ci` würde suggerieren, dass Lint oder Build dazugehören, die es
  hier nicht gibt.

- **A5** [low] Keine `concurrency`-Gruppe. Rejected: Läufe auf demselben Ref
  abbrechen. Die Suite läuft in Sekunden und das Repo hat kaum parallele Pushes;
  die Konfiguration wäre Aufwand ohne messbaren Nutzen.

## Consequences

- Der Workflow ist zunächst **rein informativ**: `main` ist unprotected
  (geprüft am 2026-09-13 via `gh api repos/…/branches/main/protection` → 404),
  es gibt also keinen Required Check. Ein roter Lauf verhindert keinen Merge,
  er ist nur sichtbar. Ihn verpflichtend zu machen, ist ein eigener Schritt und
  Teil keines Akzeptanzkriteriums hier.

- Draft-PRs der agent-workflow-Pipeline bekommen ab jetzt einen Check angezeigt.
  Der Auto-Review liest ihn nicht, aber ein Mensch sieht beim Mergen sofort, ob
  die Suite grün ist — genau die Lücke, die #4 ausgelöst hat.

- Jeder Push auf `main` und jeder PR verbraucht Actions-Minuten. Bei einem
  öffentlichen Repo ist das kostenfrei.

## Akzeptanzkriterien

- [ ] `.github/workflows/test.yml` existiert und löst bei `push` auf `main`
      sowie bei `pull_request` aus.
- [ ] Der Job läuft auf `ubuntu-latest`, checkt das Repo aus, richtet Node `24`
      ein und führt `npm test` aus.
- [ ] Kein Installationsschritt (`npm ci`/`npm install`) — das Projekt hat keine
      Dependencies.
- [ ] Der Lauf auf dem PR dieser Änderung ist grün und meldet 22 bestandene
      Tests.
- [ ] `agent.yml` ist unverändert (`git diff --name-only` nennt nur die neue
      Datei).

## Ausserhalb des Scopes

- Den Check als **Required** in den Branch-Protection-Regeln zu verankern.
- Lint, Formatierung, Build — gibt es in diesem Repo nicht.
- Das SHA-Pinning der Actions (siehe A3 und `TODO.md`).
