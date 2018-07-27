'use strict'

ChromeUtils.import('resource://gre/modules/PlacesUtils.jsm')

const CHUNK_SIZE = 1000

async function removeFrecencyTrigger () {
  return await PlacesUtils.withConnectionWrapper("federated-learning", async db => {
    db.execute('DROP TRIGGER IF EXISTS moz_places_afterupdate_frecency_trigger')
  })
}

async function restoreFrecencyTrigger () {
  // Query from https://dxr.mozilla.org/mozilla-central/source/toolkit/components/places/nsPlacesTriggers.h#176
  return await PlacesUtils.withConnectionWrapper("federated-learning", async db => {
    db.execute(`
CREATE TEMP TRIGGER moz_places_afterupdate_frecency_trigger AFTER UPDATE OF frecency ON moz_places FOR EACH ROW WHEN NOT is_frecency_decaying() BEGIN INSERT INTO moz_updateoriginsupdate_temp (prefix, host, frecency_delta) VALUES (get_prefix(NEW.url), get_host_and_port(NEW.url), MAX(NEW.frecency, 0) - MAX(OLD.frecency, 0)) ON CONFLICT(prefix, host) DO UPDATE SET frecency_delta = frecency_delta + EXCLUDED.frecency_delta; END
    `)
  })
}

async function getMozPlacesCount () {
  let res = await PlacesUtils.withConnectionWrapper('federated-learning', async db => db.execute('SELECT COUNT(*) as count FROM moz_places'))
  return res[0].getResultByName('count')
}


const PREFS = [
  'places.frecency.firstBucketCutoff',
  'places.frecency.secondBucketCutoff',
  'places.frecency.thirdBucketCutoff',
  'places.frecency.fourthBucketCutoff',
  'places.frecency.firstBucketWeight',
  'places.frecency.secondBucketWeight',
  'places.frecency.thirdBucketWeight',
  'places.frecency.fourthBucketWeight',
  'places.frecency.defaultBucketWeight',
  'places.frecency.embedVisitBonus',
  'places.frecency.framedLinkVisitBonus',
  'places.frecency.linkVisitBonus',
  'places.frecency.typedVisitBonus',
  'places.frecency.bookmarkVisitBonus',
  'places.frecency.downloadVisitBonus',
  'places.frecency.permRedirectVisitBonus',
  'places.frecency.tempRedirectVisitBonus',
  'places.frecency.redirectSourceVisitBonus',
  'places.frecency.defaultVisitBonus',
  'places.frecency.unvisitedBookmarkBonus',
  'places.frecency.unvisitedTypedBonus',
  'places.frecency.reloadVisitBonus'
];

ChromeUtils.import('resource://gre/modules/Services.jsm');

function cleanupPrefs () {
  for (let i = 0; i < PREFS.length; i++) {
    Services.prefs.clearUserPref(PREFS[i]);
  }
}

var frecency = class extends ExtensionAPI {
  async onShutdown (shutdownReason) {
    if (
      shutdownReason === "ADDON_UNINSTALL" ||
      shutdownReason === "ADDON_DISABLE"
    ) {
      cleanupPrefs()
    }
  }

  getAPI () {
    return {
      experiments: {
        frecency: {
          async calculateByURL (url) {
            let res = await PlacesUtils.withConnectionWrapper("federated-learning", async db => db.execute(
              "SELECT CALCULATE_FRECENCY(id) as frecency FROM moz_places WHERE url_hash = hash(?)", [url])
            )
            if (res.length >= 1) {
              return res[0].getResultByName('frecency')
            } else {
              return -1
            }
          },

          async updateAllFrecencies () {
            await removeFrecencyTrigger()

            let count = await getMozPlacesCount()
            let promises = []

            for (let i = 0; i < count; i += CHUNK_SIZE) {
              await PlacesUtils.withConnectionWrapper('frecency-update', async (db) => {
                await db.execute(`UPDATE moz_places SET frecency = CALCULATE_FRECENCY(id) WHERE id in (
                SELECT id FROM moz_places ORDER BY id LIMIT ? OFFSET ?
              )`, [CHUNK_SIZE, i])
              })

              // In the last iteration we want to check if new rows were added
              if (i + CHUNK_SIZE >= count) {
                count = await getMozPlacesCount()
              }
            }

            return await restoreFrecencyTrigger()
          }
        }
      }
    }
  }
}
