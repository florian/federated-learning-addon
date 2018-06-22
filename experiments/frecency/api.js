'use strict'

/* global Components, ExtensionAPI */

ChromeUtils.import('resource://gre/modules/PlacesUtils.jsm')

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "crash" }] */
var frecency = class extends ExtensionAPI {
  getAPI () {
    return {
      experiments: {
        frecency: {
          calculateByURL (url) {
            let db = PlacesUtils.history.DBConnection
            let stmt = db.createStatement('SELECT CALCULATE_FRECENCY(id) as frecency FROM moz_places WHERE url_hash = hash(:url)')
            stmt.bindByName('url', url)
            stmt.executeStep()
            return stmt.row.frecency
          },

          async updateAllFrecencies () {
            await PlacesUtils.withConnectionWrapper('frecency-update', async (db) => {
              db.execute('UPDATE moz_places SET frecency = CALCULATE_FRECENCY(id)')
            })
          }
        }
      }
    }
  }
}
