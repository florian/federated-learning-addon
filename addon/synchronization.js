const URL_ENDPOINT = 'https://s3-us-west-2.amazonaws.com/telemetry-test-bucket/frecency/latest.json'
const MINUTES_PER_ITERATION = 1 // Should be a dividor of 60
const TELEMETRY_TOPIC = 'frecency_update'

class ModelSynchronization {
  constructor () {
    this.iteration = -1
    this.fetchModel()
  }

  msUntilNextIteration () {
    // Begin a new iteration every MINUTES_PER_ITERATION, starting from a full hour
    const now = new Date()
    const m = now.getMinutes()
    const s = now.getSeconds()
    const ms = now.getMilliseconds()

    // Seconds and milliseconds until the next full minute starts
    // -1 because everything is 0-based
    const msUntilNextMinute = (60 - s - 1) * 1000 + (1000 - ms - 1)

    // Remaining minutes until the next iteration begins
    const minutesSinceLastIteration = m % MINUTES_PER_ITERATION
    const minutesMissing = MINUTES_PER_ITERATION - minutesSinceLastIteration - 1

    // Combining both
    return msUntilNextMinute + minutesMissing * 60 * 1000
  }

  fetchModel () {
    fetch(URL_ENDPOINT)
      .then((response) => response.json())
      .then(this.applyModelUpdate.bind(this))

    this.setTimer()
  }

  setTimer () {
    setTimeout(this.fetchModel.bind(this), this.msUntilNextIteration())
  }

  applyModelUpdate ({ iteration, model }) {
    this.iteration = iteration

    for (let i = 0; i < PREFS.length; i++) {
      browser.experiments.prefs.setIntPref(PREFS[i], model[i])
    }
  }

  pushModelUpdate (weights) {
    let payload = {
      iteration: this.iteration,
      weights
    }

    let options = {
      addClientId: true
    }

    console.log(payload)

    // TelemetryController.submitExternalPing(TELEMETRY_TOPIC, payload, options)
  }
}
