const baseStudySetup = {
  // used for activeExperiments tagging (telemetryEnvironment.setActiveExperiment)
  activeExperimentName: browser.runtime.id,

  // uses shield sampling and telemetry semantics.  Future: will support "pioneer"
  studyType: 'shield',

  // telemetry
  telemetry: {
    // default false. Actually send pings.
    send: true,
    // Marks pings with testing=true.  Set flag to `true` before final release
    removeTestingFlag: true
  },

  // endings with urls
  endings: {
  },

  // Study branches and sample weights, overweighing feature branches
  weightedVariations: [
    {
      name: 'treatment',
      weight: 1 / 3
    },
    {
      name: 'control',
      weight: 1 / 3
    },
    {
      name: 'control-no-decay',
      weight: 1 / 3
    }
  ],

  // maximum time that the study should run, from the first run
  expire: {
    days: 14
  }
}

const VARIATION_PREF_NAME = "federated-learning.frecency.variation"
const { prefs } = browser.experiments

async function setStudyVariation(studyInfo) {
  if (await prefs.getStringPref(VARIATION_PREF_NAME, "") === "") {
    await prefs.setStringPref(VARIATION_PREF_NAME, studyInfo.variation.name)
  } else {
    const variation = await prefs.getStringPref(VARIATION_PREF_NAME, "")
    studyInfo.variation.name = variation
  }
}

async function cachingFirstRunShouldAllowEnroll () {
  // Cached answer.  Used on 2nd run
  let allowed = await browser.storage.local.get('allowEnroll')
  if (allowed) return true

  /*
  First run, we must calculate the answer.
  If false, the study will endStudy with 'ineligible' during `setup`
  */

  // could have other reasons to be eligible, such add-ons, prefs
  allowed = true

  // cache the answer
  await browser.storage.local.set({ allowEnroll: allowed })
  return allowed
}

/**
 * Augment declarative studySetup with any necessary async values
 *
 * @return {object} studySetup A complete study setup object
 */
async function getStudySetup () {
  /*
   * const id = browser.runtime.id;
   * const prefs = {
   *   variationName: `shield.${id}.variationName`,
   *   };
   */

  // shallow copy
  const studySetup = Object.assign({}, baseStudySetup)

  studySetup.allowEnroll = await cachingFirstRunShouldAllowEnroll()
  studySetup.testing = {
    /* Example: override testing keys various ways, such as by prefs. (TODO) */
    variationName: null, // await browser.prefs.getStringPref(prefs.variationName);
    firstRunTimestamp: null,
    expired: null
  }
  return studySetup
}
