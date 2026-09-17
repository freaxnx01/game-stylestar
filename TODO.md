# TODO

Geparkte Punkte, die bewusst nicht in einem laufenden Issue stecken.

Aktuell keine.

Das `action_required`-Gate auf Pipeline-PRs ist kein Punkt dieses Repos: es
hängt am Token, mit dem `agent-implement.yml` den PR eröffnet, und ist als
[agent-workflow#364](https://github.com/freaxnx01/agent-workflow/issues/364)
offen. Bis das zu ist, muss ein Lauf auf einem Pipeline-PR hier von Hand
freigegeben werden (`gh api -X POST repos/<repo>/actions/runs/<id>/approve`) —
sonst steht ein grüner Review vor einem PR, auf dem nie ein Test lief.
