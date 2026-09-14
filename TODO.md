# TODO

Geparkte Punkte, die bewusst nicht in einem laufenden Issue stecken.

## Infrastruktur

- [ ] **CI-Checks auf Pipeline-PRs stehen auf `action_required`.** Aufgefallen am
  2026-09-13 bei PR #8: der Lauf von `test.yml` wurde angelegt, aber nicht
  gestartet — GitHub hält Workflows auf PRs von `app/github-actions` zurück, bis
  ein Mensch sie freigibt. Der Auto-Review hat den PR trotzdem auf *ready*
  promotet, ohne dass je ein Test lief. Freigeben liess sich der Lauf per
  `gh api -X POST repos/<repo>/actions/runs/<id>/approve` (danach grün, 24/24).
  Betrifft **jeden** künftigen Pipeline-PR — also genau die, bei denen der Check
  am meisten zählt. Zu klären: passende Actions-Einstellung im Repo, oder ein
  Freigabeschritt in der Pipeline.

- [ ] **`agent.yml` referenziert `@v1` statt eines SHA.** Aufgefallen am
  2026-09-12 durch den automatischen Security-Review. Kein Fremd-Repo, also kein
  Supply-Chain-Risiko durch Dritte — aber `v1` ist verschiebbar. Die Datei kommt
  1:1 aus `onboard-consumer.sh`, der Fix gehört deshalb in den Generator im Repo
  `agent-workflow`, nicht in diesen Stub.
