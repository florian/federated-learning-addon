'use strict'

/* global Components, ExtensionAPI */

ChromeUtils.import('resource://gre/modules/PlacesUtils.jsm')

const CHUNK_SIZE = 400

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
            let res = await PlacesUtils.withConnectionWrapper("federated-learning", async db => db.execute("SELECT COUNT(*) as count FROM moz_places"))
            let count = res[0].getResultByName("count")

            for (let i = 0; i < count; i += CHUNK_SIZE) {
              await PlacesUtils.withConnectionWrapper('frecency-update', async (db) => {
                db.execute(`UPDATE moz_places SET frecency = CALCULATE_FRECENCY(id) WHERE id in (
                SELECT id FROM moz_places LIMIT ? OFFSET ?
              )`, [CHUNK_SIZE, i])//.then(() => console.log("Done with", i))
              })
              console.log(i)
            }
          }
        }
      }
    }
  }
}
