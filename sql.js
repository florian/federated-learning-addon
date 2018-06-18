Cu.import("resource://gre/modules/PlacesUtils.jsm")

function calculateFrecencyByURL(url) {
	let db = PlacesUtils.history.DBConnection
	let stmt = db.createStatement("SELECT CALCULATE_FRECENCY(id) as frecency FROM moz_places WHERE url_hash = hash(:url)")
	stmt.bindByName("url", url)
	stmt.executeStep()
	return stmt.row.frecency
}

function updateAllFrecencies() {
	let db = PlacesUtils.history.DBConnection
	let stmt = db.createStatement("UPDATE moz_places SET frecency = CALCULATE_FRECENCY(id)")
	stmt.executeStep()
}

function updateFrecencyByURL(id) {
	let db = PlacesUtils.history.DBConnection
	let stmt = db.createStatement("UPDATE moz_places SET frecency = CALCULATE_FRECENCY(id) WHERE url_hash = hash(:url)")
	stmt.bindByName("id", id)
	stmt.executeStep()
}

let frecencyObserver = {
	onFrecencyChanged(uri, newFrecency) {
		console.log(newFrecency)
		let url = uri.spec
		updateFrecencyByURL(url)
		console.log(calculateFrecencyByURL)
	}
}

PlacesUtils.history.addObserver(frecencyObserver)
