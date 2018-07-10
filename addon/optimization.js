async function svmLoss (urls, correct) {
  let frecencies = await urlsToFrecencies(urls)
  let correctFrecency = frecencies[correct]

  let loss = 0

  for (let frecency of frecencies) {
    if (frecency > correctFrecency) {
      loss += frecency - correctFrecency
    }
  }

  return loss
}

async function urlsToFrecencies (urls) {
  return Promise.all(urls.map(url => browser.experiments.frecency.calculateByURL(url)))
}

class FrecencyOptimizer {
  constructor (synchronizer, lossFn, eps = 1) {
    this.synchronizer = synchronizer
    this.lossFn = lossFn
    this.eps = eps
  }

  async step (urls, selectedIndex, numTypedChars) {
    let gradient = await this.computeGradient(urls, selectedIndex)
    let frecencies = await urlsToFrecencies(urls)
    await this.synchronizer.pushModelUpdate(gradient, await svmLoss(urls, selectedIndex), urls.length, selectedIndex, numTypedChars, frecencies)
  }

  async computeGradient (urls, selectedIndex) {
    let gradient = []

    for (let pref of PREFS) {
      let currentValue = await browser.experiments.prefs.getIntPref(pref)

      await browser.experiments.prefs.setIntPref(pref, currentValue - this.eps)
      let loss1 = await this.lossFn(urls, selectedIndex)

      await browser.experiments.prefs.setIntPref(pref, currentValue + this.eps)
      let loss2 = await this.lossFn(urls, selectedIndex)

      let finiteDifference = (loss1 - loss2) / (2 * this.eps)
      gradient.push(finiteDifference)

      await browser.experiments.prefs.setIntPref(pref, currentValue)
    }

    return gradient
  }

  reset () {
    for (let i = 0; i < PREFS.length; i++) {
      browser.experiments.prefs.setIntPref(PREFS[i], DEFAULT_PREF_VALUES[i])
    }
  }
}
