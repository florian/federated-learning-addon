'use strict'

ChromeUtils.import('resource://gre/modules/TelemetryController.jsm')
ChromeUtils.import('resource://gre/modules/Services.jsm')

const TELEMETRY_PING_TOPIC = 'frecency-update'

var telemetry = class extends ExtensionAPI {
  getAPI () {
    return {
      experiments: {
        telemetry: {
          submitPing (payload) {
            let options = {
              addClientId: true
            }

            TelemetryController.submitExternalPing(TELEMETRY_PING_TOPIC, payload, options)
          }
        }
      }
    }
  }
}
