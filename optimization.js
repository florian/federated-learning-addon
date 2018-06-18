let PREFS = [
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
]

let DEFAULT_PREF_VALUES = [
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

function svmLoss (urls, correct) {
  let frecencies = urls.map(calculateFrecencyByURL)
  let correctFrecency = frecencies[correct]

  let loss = 0

  for (let frecency of frecencies) {
    if (frecency > correctFrecency) {
      loss += frecency - correctFrecency
    }
  }

  return loss
}

class FrecencyOptimizer {
  constructor (lossFn, eps = 1) {
    this.lossFn = lossFn
    this.eps = eps
  }

  step (urls, selectedIndex) {
    let gradient = this.computeGradient(urls, selectedIndex)
    console.log(gradient)

    // Step in Telemetry
  }

  computeGradient (urls, selectedIndex) {
    let gradient = []

    for (let pref of PREFS) {
      let currentValue = Services.prefs.getIntPref(pref)

      Services.prefs.setIntPref(pref, currentValue - this.eps)
      let loss1 = this.lossFn(urls, selectedIndex)

      Services.prefs.setIntPref(pref, currentValue + this.eps)
      let loss2 = this.lossFn(urls, selectedIndex)

      let finiteDifference = (loss1 - loss2) / (2 * this.eps)
      gradient.push(finiteDifference)

      Services.prefs.setIntPref(pref, currentValue)
    }

    return gradient
  }

  reset () {
    for (let i = 0; i < PREFS.length; i++) {
      Services.prefs.setIntPref(PREFS[i], DEFAULT_PREF_VALUES[i])
    }
  }
}
