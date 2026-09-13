# CI-Test-Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Einen GitHub-Actions-Workflow ergänzen, der die bestehende Test-Suite bei jedem Push auf `main` und bei jedem Pull Request ausführt.

**Architecture:** Eine einzige neue Datei, `.github/workflows/test.yml`. Checkout, Node 24, `npm test`. Kein Installationsschritt, weil das Projekt keine Dependencies hat und `node --test` in Node enthalten ist. Bestehende Workflows bleiben unangetastet.

**Tech Stack:** GitHub Actions, `actions/checkout@v4`, `actions/setup-node@v4`, Node 24, `node --test`.

**Spec:** [`docs/ai-notes/specs/2026-09-13-ci-test-workflow-design.md`](../specs/2026-09-13-ci-test-workflow-design.md)

## Global Constraints

- **Nur eine Datei anfassen.** `.github/workflows/agent.yml` bleibt byte-identisch. Am Ende darf `git diff --name-only origin/main` ausschliesslich `.github/workflows/test.yml` nennen.
- **Kein `npm ci` und kein `npm install`.** `package.json` hat weder `dependencies` noch `devDependencies`, und es gibt keine `package-lock.json`. Ein Installationsschritt würde fehlschlagen oder sinnlos Zeit kosten.
- **Node-Version exakt `'24'`**, als String in Anführungszeichen — YAML würde `24` sonst als Zahl lesen, was `setup-node` zwar toleriert, aber bei `20.1`-artigen Werten zu stillen Fehlern führt. Die Konvention ist hier durchzuhalten.
- **Actions auf Major-Tags** (`@v4`), nicht auf SHAs — konsistent mit `agent.yml`, das `@v1` verwendet.
- **Keine Tests für diese Änderung.** Der Deliverable ist selbst die Testausführung; ein Test, der einen Workflow testet, existiert in diesem Repo nicht und soll nicht erfunden werden. Die Verifikation ist der grüne Lauf auf dem PR.

---

## File Structure

| Datei | Verantwortung |
| --- | --- |
| `.github/workflows/test.yml` | *(neu)* Führt `npm test` bei Push auf `main` und bei jedem Pull Request aus |

---

### Task 1: Workflow anlegen und grün sehen

**Files:**
- Create: `.github/workflows/test.yml`

**Interfaces:**
- Consumes: das `test`-Script aus `package.json` (`node --test`), das seit `8fdd538` funktioniert
- Produces: einen Check namens `Tests / test` auf jedem Pull Request

- [ ] **Step 1: Ausgangslage belegen**

Vor der Änderung festhalten, dass die Suite lokal grün ist und kein Workflow sie ausführt:

```bash
npm test 2>&1 | tail -5
ls .github/workflows/
grep -rl "npm test" .github/workflows/ || echo "kein Workflow führt npm test aus"
```

Expected: `pass 22` / `fail 0`; `.github/workflows/` enthält nur `agent.yml`; die letzte Zeile meldet, dass kein Workflow `npm test` ausführt.

- [ ] **Step 2: Den Workflow schreiben**

`.github/workflows/test.yml`:

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

      # Kein npm ci: das Projekt hat keine Dependencies und keine Lockfile.
      # node --test ist in Node enthalten.
      - run: npm test
```

- [ ] **Step 3: Die YAML-Syntax lokal prüfen, bevor sie auf den Runner geht**

Ein Tippfehler kostet sonst einen kompletten Push-Zyklus:

```bash
python3 -c "
import yaml, sys
d = yaml.safe_load(open('.github/workflows/test.yml'))
assert d['name'] == 'Tests'
assert d[True]['push']['branches'] == ['main']      # YAML liest 'on' als True
assert 'pull_request' in d[True]
steps = d['jobs']['test']['steps']
assert steps[-1]['run'] == 'npm test'
assert steps[1]['with']['node-version'] == '24', 'node-version muss ein String sein'
print('workflow ok')"
```

Expected: `workflow ok`.

Falls `python3 -c "import yaml"` fehlschlägt, weil PyYAML nicht installiert ist, ersatzweise prüfen, ob GitHub die Datei akzeptiert — der Push in Step 5 zeigt es dann, und ein `startup_failure` statt eines Laufs ist das Signal.

- [ ] **Step 4: Belegen, dass nur die eine Datei angefasst wurde**

```bash
git status --porcelain
```

Expected: genau eine Zeile, `?? .github/workflows/test.yml`.

- [ ] **Step 5: Commit und Push**

```bash
git add .github/workflows/test.yml
git commit -m "ci: run the test suite on push and pull request

The suite added in #3 was never executed by any workflow, so a regression
to the wardrobe data or migrate() could land on main unnoticed."
git push
```

- [ ] **Step 6: Den Lauf auf dem PR abwarten und das Ergebnis belegen**

```bash
gh pr checks --watch
gh run list --workflow=test.yml --limit 1 --json status,conclusion,displayTitle
```

Expected: der Check `Tests / test` ist `success`. Das Job-Log muss `pass 22` und `fail 0` zeigen:

```bash
gh run view --workflow=test.yml --log | grep -E "ℹ (tests|pass|fail)"
```

Falls der Lauf rot ist, ist das ein echtes Ergebnis und kein Workflow-Problem — dann die Fehlermeldung in die PR-Beschreibung übernehmen und **nicht** den Workflow abschwächen, um ihn grün zu bekommen.

---

## Self-Review

**Spec-Abdeckung**

| Spec-Abschnitt | Task |
| --- | --- |
| Umfang / Workflow-Inhalt | Task 1, Step 2 |
| A1 Node `'24'` als String | Task 1, Steps 2–3 (Assertion) |
| A2 Trigger push+pull_request | Task 1, Steps 2–3 (Assertion) |
| A3 Major-Tags | Task 1, Step 2 |
| A4 Dateiname/Jobname | File Structure, Task 1 Step 2 |
| A5 kein `concurrency` | implizit — im Workflow nicht vorhanden |
| AC „kein Installationsschritt" | Global Constraints, Task 1 Step 2 |
| AC „`agent.yml` unverändert" | Task 1, Step 4 |
| AC „Lauf grün, 22 Tests" | Task 1, Step 6 |

**Placeholder-Scan** — keine TBDs; jeder Schritt enthält den auszuführenden Befehl oder den zu schreibenden Inhalt.

**Typkonsistenz** — nicht anwendbar, es entstehen keine Funktionen oder Signaturen. Der einzige Vertrag ist das `test`-Script in `package.json`, das der Workflow per `npm test` aufruft und das seit `8fdd538` `node --test` lautet.

**Bewusst kein TDD** — der Deliverable ist die Testausführung selbst. Die Ersatz-Evidenz ist der Vorher/Nachher-Beleg aus Step 1 und Step 6.
