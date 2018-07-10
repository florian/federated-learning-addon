# Federated Learning – Firefox addon

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

This is the first draft of the Firefox addon that implements the client-side part of a federated learning system.
Everytime users perform searches in the awesome bar, the model's predictions are compared to the actual user behaviour and weight updates are computed.
These updates are collected using Telemetry.

## Installing the addon

1. Go to `about:config` and set `extensions.legacy.enabled` to `true`
2. Go to `about:debugging`, click *Load Temporary Add-on* and select `manifest.json`

The addon was built for a beta version of Firefox.

## Study variations

- `treatment`: The full optimization process is performed, weights change after every iteration and the ranking is recomputed
- `control`: Search works exactly the same way it currently does in Firefox, we only collect additional statistics
- `control-no-decay`: In the current algorithm, frecency scores are decayed over time. `treatment` loses this effect since scores are recomputed all the time. To see if the decaying is useful and to make a fairer comparison, this variation only removes the decaying effect

After the study was installed, the variation can be changed by updating the `federated-learning.frecency.variation` pref in `about:config`.
The new value needs to be one of the three values listed above.
After the pref was changed, the browser has to be restarted so that the change is taken into account.

## Components

### Experiment APIs

- `frecency`: For interacting with the `moz_places` table and recalculating / changing frecency scores
- `awesomeBar`: For observing interactions with the awesome bar. The required information for history / bookmark searches is retrieved (number of typed characters, selected suggestion, features of other suggestions)
- `prefs`: For reading and writing preferences. This is just used to update the weights
- `telemetry`: For sending back updates and meta information
- `study` from [`shield-studies-addon-utils`](https://github.com/mozilla/shield-studies-addon-utils) for study related helpers

### Core components

- `synchronization`: Everything related to the federated learning protocol. Currently that means sending weight updates back using Telemetry and reading the current model from S3
- `optimization`: For computing model updates
- `studySetup` is adapted from [`shield-studies-addon-utils`](https://github.com/mozilla/shield-studies-addon-utils) and configures the study
- `main.js` connects everything.

## Building the addon

```
$ npm run build
```

Depending on what should be done with the build, it still needs to be signed by someone else.

## References

- [Blog post](https://florian.github.io/federated-learning/) explaining the concepts behind federated learning
- [Bugzilla](https://bugzilla.mozilla.org/show_bug.cgi?id=1462102)
- [Federated learning simulations](https://github.com/florian/federated-learning)
- Documentation about
   - [frecency](https://developer.mozilla.org/en-US/docs/Mozilla/Tech/Places/Frecency_algorithm) (a bit outdated)
   - [metrics sent to Mozilla](METRICS.md)
