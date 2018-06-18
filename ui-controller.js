EVENT = "autocomplete-will-enter-text"
NON_HISTORY_STYLES = ["switchtab", "remotetab", "searchengine", "visiturl", "extension", "suggestion", "keyword"] // bookmark

class HistorySearchController {
	constructor (optimizer) {
		this.bindEvents()
		this.optimizer = optimizer
	}

	bindEvents () {
		Services.obs.addObserver(this.onSearch.bind(this), EVENT, false)
	}

	onSearch (el) {
		let popup = el.popup;
		let controller = popup.view.QueryInterface(Ci.nsIAutoCompleteController)

		let selectedIndex = popup.selectedIndex
		let selectedStyle = controller.getStyleAt(selectedIndex)
		let searchQuery = controller.searchString

		if (this.isHistoryStyle(selectedStyle) && searchQuery != "") {
			let numberOfSuggestions = controller.matchCount
			let historySuggestions = []

			for (var i = 0; i < numberOfSuggestions; i++) {
				let url = controller.getFinalCompleteValueAt(i)
				let isHistory = this.isHistoryStyle(controller.getStyleAt(i))

				if (isHistory) {
					historySuggestions.push(url)
				}
			}

			let selectedHistoryIndex = historySuggestions.indexOf(controller.getFinalCompleteValueAt(selectedIndex))

			this.optimizer.step(historySuggestions, selectedHistoryIndex)

			console.log("The user selected the", selectedHistoryIndex , "th history entry")

			for (var url of historySuggestions) {
				console.log(url, calculateFrecencyByURL(url))
			}
		} else {
			console.log("non-history search")
		}
	}

	isHistoryStyle (styleString) {
		let styles = new Set(styleString.split(/\s+/))
		let isNonHistoryStyle = NON_HISTORY_STYLES.some(s => styles.has(s))
		return !isNonHistoryStyle
	}

}
