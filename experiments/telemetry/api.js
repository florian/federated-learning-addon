'use strict'

ChromeUtils.import('resource://gre/modules/TelemetryController.jsm')
ChromeUtils.import('resource://gre/modules/Services.jsm')

const TELEMETRY_PING_TOPIC = 'frecency-update'

var telemetry = class extends ExtensionAPI {
  getAPI () {
    return {
      experiments: {
        telemetry: {
          registerEvents () {
            Services.telemetry.registerEvents(TELEMETRY_EVENT_CATEGORY, {
              suggestion_selected: {
                methods: [TELEMETRY_EVENT_METHOD],
                objects: [TELEMETRY_EVENT_OBJECT],
                extra_keys: TELEMETRY_EVENT_EXTRA_KEYS
              }
            })
          },

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
