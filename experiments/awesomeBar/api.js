'use strict'

ChromeUtils.import('resource://gre/modules/Services.jsm')

const { ExtensionCommon } = ChromeUtils.import(
  'resource://gre/modules/ExtensionCommon.jsm'
)

const { EventManager } = ExtensionCommon

const EVENT = 'autocomplete-will-enter-text'
// Bookmarks are not included for now because we also want to take them into account
const NON_HISTORY_STYLES = ['switchtab', 'remotetab', 'searchengine', 'visiturl', 'extension', 'suggestion', 'keyword']

var awesomeBar = class extends ExtensionAPI {
  getAPI (context) {
    return {
      experiments: {
        awesomeBar: {
          onHistorySearch: new EventManager({
            context,
            name: 'awesomeBar.onHistorySearch',
            register: fire => {
              Services.obs.addObserver(el => processAwesomeBarSearch(el, fire.async), 'autocomplete-will-enter-text', false)
            }
          }).api()
        }
      }
    }
  }
}

function processAwesomeBarSearch (el, callback) {
  let popup = el.popup
  let controller = popup.view.QueryInterface(Ci.nsIAutoCompleteController)

  let selectedIndex = popup.selectedIndex
  let selectedStyle = controller.getStyleAt(selectedIndex)
  let searchQuery = controller.searchString

  if (isHistoryStyle(selectedStyle) && searchQuery !== '') {
    let numberOfSuggestions = controller.matchCount
    let historySuggestions = []

    for (var i = 0; i < numberOfSuggestions; i++) {
      let url = controller.getFinalCompleteValueAt(i)
      let isHistory = isHistoryStyle(controller.getStyleAt(i))

      if (isHistory) {
        historySuggestions.push(url)
      }
    }

    let selectedHistoryIndex = historySuggestions.indexOf(controller.getFinalCompleteValueAt(selectedIndex))
    callback(historySuggestions, selectedHistoryIndex, searchQuery.length)
  }
}

function isHistoryStyle (styleString) {
  let styles = new Set(styleString.split(/\s+/))
  let isNonHistoryStyle = NON_HISTORY_STYLES.some(s => styles.has(s))
  return !isNonHistoryStyle
}
