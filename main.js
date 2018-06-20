"use strict";

console.log("WebExtension starting")

browser.experiments.awesomeBar.addObserver((a) => console.log(a), 'autocomplete-will-enter-text', false)
