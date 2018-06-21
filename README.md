# Federated Learning – Firefox addon

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

This is the first draft of the Firefox addon that implements the client-side part of a federated learning system.

## Installing the addon

1. Go to `about:config` and set `extensions.legacy.enabled` to `true`
2. Go to `about:debugging`, click *Load Temporary Add-on* and select `manifest.json`

## Components

### Experiment APIs

- `frecency`: For interacting with the `moz_places` table and recalculating / changing frecency scores
- `awesomeBar`: For observing interactions with the awesome bar. The required information for history / bookmark searches is retrieved (number of typed characters, selected suggestion, features of other suggestions)
- `prefs`: For reading and writing preferences. This is just used to update the weights

### Core components

- `synchronization`: Everything related to the federated learning protocol. Currently that means sending weight updates back using Telemetry and reading the current model from S3
- `optimization`: For computing model updates
- `main.js` connects everything.

## Other links

- [Blog post](https://florian.github.io/federated-learning/) explaining the concepts behind federated learning
- [Bugzilla](https://bugzilla.mozilla.org/show_bug.cgi?id=1462102)
- [frecency documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Tech/Places/Frecency_algorithm) (a bit outdated)
