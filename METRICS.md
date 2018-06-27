# Data we are collecting

No direct information about search queries or the user's history is collected.
The idea behind federated learning is that sensitive data does not leave the user's computer.
Instead, clients send back abstract model improvements.
These updates are derived from local data but are much harder to interpret.

Additionally to the updates, we are also collecting meta information about search queries, e.g. how many suggestions were displayed and which rank the selected one had.
This information is used to evaluate the quality of the model.

## `frecency-update` ping ([schema](https://github.com/mozilla-services/mozilla-pipeline-schemas/tree/dev/templates/telemetry/frecency-update))

This ping is sent every time an enrolled user performs a history / bookmark search in the awesome bar.
The following data is sent with this ping:

| name                        | type              | description                                                                                         |
|-----------------------------|-------------------|-----------------------------------------------------------------------------------------------------|
| `model_version`             | integer           | the version of the model that all the other data is based on                                        |
| `study_variation`           | string            | in what variation is the user enrolled in (e.g. treatment, control)                                 |
| `update`                    | array of floats   | the model improvement that the user is proposing                                                    |
| `loss`                      | float             | a number quantifying how well the model worked                                                      |
| `num_suggestions_displayed` | integer           | how many history / bookmark suggestions were displayed?                                             |
| `rank_selected`             | integer           | what was the position of the selected suggestion? (should be minimized by the optimization process) |
| `num_chars_typed`           | integer           | how many characters did the user type? (should be minimized by the optimization process)            |
| `frecency_scores`           | array of integers | what scores did the model assign to the suggestions?                                                |

### Example ping

```json
{
    "frecency_scores": [
      38223,
      3933.4,
      304933.3,
      21
    ],
    "loss": 291989.21,
    "model_version": 3,
    "num_chars_typed": 5,
    "num_suggestions_displayed": 5,
    "rank_selected": 2,
    "study_variation": "treatment",
    "update": [
      1.2,
      3.2,
      -3.1,
      4.4,
      0.5,
      0.234,
      -0.98,
      0.33,
      0.34,
      0.28,
      0.302,
      0.4,
      -0.8,
      0.25,
      0.9,
      -0.8,
      0.29,
      0.42,
      0.89,
      0.39,
      0.54,
      0.78
    ]
}
```

## References

- [Bugzilla bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1462109) detailing the data review request
- [ping schema](https://bugzilla.mozilla.org/show_bug.cgi?id=1462109)
