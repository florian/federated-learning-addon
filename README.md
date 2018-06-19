# Federated Learning – Firefox addon

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

This is the first draft of the Firefox addon that implements the client-side part of a federated learning system.

## Components

- `sql.js`: For interacting with the `moz_places` table and recalculating / changing frecency scores
- `synchronization.js`: Everything related to the federated learning protocol. Currently that means sending weight updates back using Telemetry and reading the current model from S3
- `optimization.js`: For computing model updates
- `ui-controller.js`: Observes what the user is doing in the awesome bar and retrieves the required information for history / bookmark searches (number of typed characters, selected suggestion, features of other suggestions)

`main.js` connects everything.

## Other links

- [Blog post](https://florian.github.io/federated-learning/) explaining the concepts behind federated learning
- [Bugzilla](https://bugzilla.mozilla.org/show_bug.cgi?id=1462102)
- [frecency documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Tech/Places/Frecency_algorithm) (a bit outdated)
