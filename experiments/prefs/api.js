"use strict";

/* global ExtensionAPI */

ChromeUtils.import("resource://gre/modules/Services.jsm");

/* https://firefox-source-docs.mozilla.org/toolkit/components/extensions/webextensions/functions.html */
var prefs = class extends ExtensionAPI {
  getAPI(context) {
    return {
      // eslint-disable-next-line no-undef
      prefs: Services.prefs,
    };
  }
};
