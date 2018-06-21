URL_ENDPOINT = 'https://s3-us-west-2.amazonaws.com/telemetry-test-bucket/frecency/latest.json'
TIME_INTERVAL = 1 * 60 * 1000
// TIME_INTERVAL = 30 * 60 * 1000
EXTRA_DELAY = 5 * 1000
// EXTRA_DELAY = 30 * 1000
TELEMETRY_TOPIC = 'frecency_update'

class ModelSynchronization {
  constructor () {
    this.iteration = -1
    this.fetchModel()
    this.bindEvents()
  }

  bindEvents () {
    let now = new Date()
    let firstDelay = TIME_INTERVAL - now.getSeconds() * 1000
    firstDelay += EXTRA_DELAY
    setTimeout(this.fetchModel.bind(this), firstDelay)
  }

  fetchModel () {
    fetch(URL_ENDPOINT)
      .then((response) => response.json())
      .then(this.applyModelUpdate.bind(this))

    setTimeout(this.fetchModel.bind(this), TIME_INTERVAL + EXTRA_DELAY)
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

    //TelemetryController.submitExternalPing(TELEMETRY_TOPIC, payload, options)
  }
}
