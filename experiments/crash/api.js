"use strict";

/* global Components, ExtensionAPI */
const Cc = Components.classes;
const Ci = Components.interfaces;

const DEBUG_CONTRACTID = "@mozilla.org/xpcom/debug;1";

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "crash" }] */
var crash = class extends ExtensionAPI {
  getAPI() {
    return {
      experiments: {
        crash: {
          abort() {
            console.log("yo")
            return 2
          },
        },
      },
    };
  }
};
