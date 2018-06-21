"use strict";

/* global ExtensionAPI */

ChromeUtils.import("resource://gre/modules/Services.jsm");

/* https://firefox-source-docs.mozilla.org/toolkit/components/extensions/webextensions/functions.html */
var awesomeBar = class extends ExtensionAPI {
  getAPI(context) {
    return {
      experiments: {
        // eslint-disable-next-line no-undef
        awesomeBar: {
          onHistorySearch: new EventManager({
            context,
            name: "awesomeBar.onHistorySearch",
            register: fire => {
              fire(1)
            }
          }).api()
        }
      }
    }
  }
}
