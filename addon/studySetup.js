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
      weight: 0.6
    },
    {
      name: 'control',
      weight: 0.2
    },
    {
      name: 'control-no-decay',
      weight: 0.2
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
  studySetup.allowEnroll = true
  return studySetup
}
