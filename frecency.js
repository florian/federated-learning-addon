function computeFrecency(id) {
  let db = PlacesUtils.history.DBConnection
  let stmt = db.createStatement("SELECT CALCULATE_FRECENCY(:id, 1) AS frecency")
  stmt.bindByName("id", id)
  stmt.executeStep()
  return stmt.row.frecency
}

function updatePref(prefName, prefValue) {
  Services.prefs.setIntPref(prefName, prefValue)
}

prefs = [
	"places.frecency.firstBucketWeight",
	"places.frecency.secondBucketWeight",
	"places.frecency.thirdBucketWeight",
	"places.frecency.fourthBucketWeight",
	"places.frecency.defaultBucketWeight",
	"places.frecency.embedVisitBonus",
	"places.frecency.framedLinkVisitBonus",
	"places.frecency.linkVisitBonus",
	"places.frecency.typedVisitBonus",
	"places.frecency.bookmarkVisitBonus",
	"places.frecency.downloadVisitBonus",
	"places.frecency.permRedirectVisitBonus",
	"places.frecency.tempRedirectVisitBonus",
	"places.frecency.redirectSourceVisitBonus",
	"places.frecency.defaultVisitBonus",
	"places.frecency.unvisitedBookmarkBonus",
	"places.frecency.unvisitedTypedBonus",
	"places.frecency.reloadVisitBonus"
]

function calculateFrecencyById(id) {
	let db = PlacesUtils.history.DBConnection
	let stmt = db.createStatement("SELECT CALCULATE_FRECENCY(id) as frecency FROM moz_places WHERE id = :id")
	stmt.bindByName("id", id)
	stmt.executeStep()
	return stmt.row.frecency
}

function svmLoss(ids, correct) {
	let frecencies = ids.map(calculateFrecencyById)
	let correctFrecency = frecencies[correct]

	let loss = 0

	for (frecency of frecencies) {
		if (frecency > correctFrecency) {
			// loss += Math.pow(frecency - correctFrecency), 2)
			loss += frecency - correctFrecency
		}
	}

	return loss
}

function computeUpdate(ids, correct) {
	let eps = 1
	let gradient = []

	for (pref of prefs) {
		let currentValue = Services.prefs.getIntPref(pref)

		Services.prefs.setIntPref(pref, currentValue - eps) 
		let loss1 = svmLoss(ids, correct)

		Services.prefs.setIntPref(pref, currentValue + eps) 
		let loss2 = svmLoss(ids, correct)

		let finiteDifference = (loss1 - loss2) / (2 * eps)
		gradient.push(finiteDifference)

		Services.prefs.setIntPref(pref, currentValue) 
	}

	return gradient
}

computeUpdate([22, 23, 24, 25], 0)

(function() {
  let db = PlacesUtils.history.DBConnection
  let stmt = db.createStatement(`SELECT *
  FROM moz_historyvisits a, moz_historyvisits b
  WHERE a.id = b.from_visit AND b.place_id = 12
  `)
  stmt.executeStep()
  console.log(stmt.row)
})();
