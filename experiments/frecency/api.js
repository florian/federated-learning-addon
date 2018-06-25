'use strict'

/* global Components, ExtensionAPI */

ChromeUtils.import('resource://gre/modules/PlacesUtils.jsm')

const CHUNK_SIZE = 400

function removeFrecencyTrigger () {
  let db = PlacesUtils.history.DBConnection
  let stmt = db.createStatement('DROP TRIGGER IF EXISTS moz_places_afterupdate_frecency_trigger')
  stmt.executeStep()
}

function restoreFrecencyTrigger () {
  let db = PlacesUtils.history.DBConnection
  let stmt = db.createStatement(`
  CREATE TEMP TRIGGER moz_places_afterupdate_frecency_trigger
  AFTER UPDATE OF frecency ON moz_places FOR EACH ROW
  WHEN NEW.frecency >= 0 AND NOT is_frecency_decaying()
  BEGIN
    UPDATE moz_origins
    SET frecency (
    SELECT IFNULL(MAX(frecency), 0)
      FROM moz_places
      WHERE moz_places.origin_id = moz_origins.id
    )
    WHERE id = NEW.origin_id;
    UPDATE_FRECENCY_STATS_AFTER_UPDATE
  END`)
  stmt.executeStep()
}

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
            removeFrecencyTrigger()

            let res = await PlacesUtils.withConnectionWrapper("federated-learning", async db => db.execute("SELECT COUNT(*) as count FROM moz_places"))
            let count = res[0].getResultByName("count")

            let promises = []

            for (let i = 0; i < count; i += CHUNK_SIZE) {
              console.log(i)
              PlacesUtils.withConnectionWrapper('frecency-update', async (db) => {
                promises.push(db.execute(`UPDATE moz_places SET frecency = 5 WHERE id in (
                SELECT id FROM moz_places ORDER BY id LIMIT ? OFFSET ?
              )`, [CHUNK_SIZE, i]))
              })
            }

            Promise.all(promises).then(restoreFrecencyTrigger)
          }
        }
      }
    }
  }
}
