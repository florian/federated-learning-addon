'use strict'

/* global Components, ExtensionAPI */

ChromeUtils.import('resource://gre/modules/TelemetryController.jsm')
ChromeUtils.import('resource://gre/modules/Services.jsm')

const TELEMETRY_PING_TOPIC = 'frecency-update'
const TELEMETRY_EVENT_CATEGORY = 'frecency_optimization'
const TELEMETRY_EVENT_METHOD = 'suggestion_selected'
const TELEMETRY_EVENT_OBJECT = 'awesome_bar'
const TELEMETRY_EVENT_EXTRA_KEYS = ['iteration', 'loss', 'weights', 'numSuggestions', 'rankSelected', 'numCharsTyped', 'frecencies']

/* eslint no-unused-vars: ['error', { 'varsIgnorePattern': 'crash' }] */
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
          },

          recordEvent (payload2) {
            console.log("[in] recording event")

            let payload = {}

            for (let key of TELEMETRY_EVENT_EXTRA_KEYS) {
              console.log(key)
              payload[key] = JSON.stringify(payload2[key])
              console.log(key, payload[key].length)
            }

            console.log(payload)

            Services.telemetry.recordEvent(TELEMETRY_EVENT_CATEGORY, TELEMETRY_EVENT_METHOD, TELEMETRY_EVENT_OBJECT, null, payload)
            console.log("[in] recorded event")
          }
        }
      }
    }
  }
}
