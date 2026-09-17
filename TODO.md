# TODO

Geparkte Punkte, die bewusst nicht in einem laufenden Issue stecken.

## Infrastruktur

- [ ] **CI-Checks auf Pipeline-PRs stehen auf `action_required`.** Aufgefallen am
  2026-09-13 bei PR #8: der Lauf von `test.yml` wurde angelegt, aber nicht
  gestartet — GitHub hält Workflows auf PRs von `app/github-actions` zurück, bis
  ein Mensch sie freigibt. Der Auto-Review hat den PR trotzdem auf *ready*
  promotet, ohne dass je ein Test lief. Freigeben liess sich der Lauf per
  `gh api -X POST repos/<repo>/actions/runs/<id>/approve` (danach grün, 24/24).

  Der Punkt wird **in der Pipeline** gelöst, nicht hier: er hängt am Token, mit
  dem `agent-implement.yml` den PR eröffnet, und ist dort als
  [agent-workflow#364](https://github.com/freaxnx01/agent-workflow/issues/364)
  offen. Bleibt als Notiz stehen, weil er jeden künftigen Pipeline-PR in diesem
  Repo betrifft — bis #364 zu ist, muss der Lauf hier von Hand freigegeben
  werden, sonst steht ein grüner Review vor einem PR, auf dem nie ein Test lief.
