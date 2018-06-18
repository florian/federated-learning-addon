let prefs = [
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

let defaultPrefValues = [
	100,
	70,
	50,
	30,
	10,
	0,
	0,
	100,
	2000,
	75,
	0,
	0,
	0,
	25,
	0,
	140,
	200,
	0
]

function svmLoss(urls, correct) {
	let frecencies = urls.map(calculateFrecencyByURL)
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

class FrecencyOptimizer {
	constructor (lossFn, prefs, defaultPrefValues, eps = 1) {
		this.lossFn = lossFn
		this.prefs = prefs
		this.defaultPrefValues = defaultPrefValues
		this.eps = eps
	}

	step (urls, selected_index) {
		let gradient = this.computeGradient(urls, selected_index)
		console.log(gradient)

		// Step in Telemetry
	}

	computeGradient (urls, selected_index) {
		let gradient = []

		for (let pref of this.prefs) {
			let currentValue = Services.prefs.getIntPref(pref)

			Services.prefs.setIntPref(pref, currentValue - this.eps) 
			let loss1 = this.lossFn(urls, selected_index)

			Services.prefs.setIntPref(pref, currentValue + this.eps) 
			let loss2 = this.lossFn(urls, selected_index)

			let finiteDifference = (loss1 - loss2) / (2 * this.eps)
			gradient.push(finiteDifference)

			Services.prefs.setIntPref(pref, currentValue) 
		}

		return gradient
	}
	
	reset() {
		for(let i = 0; i < this.prefs.length; i++) {
			Services.prefs.setIntPref(this.prefs[i], this.defaultPrefValues[i])
		}
	}
}

let optimizer = new FrecencyOptimizer(svmLoss, prefs, defaultPrefValues)
