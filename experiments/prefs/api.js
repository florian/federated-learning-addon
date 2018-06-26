'use strict'

ChromeUtils.import('resource://gre/modules/Services.jsm')

/* https://firefox-source-docs.mozilla.org/toolkit/components/extensions/webextensions/functions.html */
var prefs = class extends ExtensionAPI {
  getAPI (context) {
    return {
      experiments: {
        prefs: Services.prefs
      }
    }
  }
}
