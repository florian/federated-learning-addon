ChromeUtils.import('resource://gre/modules/PlacesUtils.jsm')

function calculateFrecencyByURL (url) {
  let db = PlacesUtils.history.DBConnection
  let stmt = db.createStatement('SELECT CALCULATE_FRECENCY(id) as frecency FROM moz_places WHERE url_hash = hash(:url)')
  stmt.bindByName('url', url)
  stmt.executeStep()
  return stmt.row.frecency
}

function updateAllFrecencies () {
  let db = PlacesUtils.history.DBConnection
  let stmt = db.createStatement('UPDATE moz_places SET frecency = CALCULATE_FRECENCY(id)')
  stmt.executeStep()
}
