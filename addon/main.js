console.log('Addon starting')

const synchronizer = new ModelSynchronization()
const optimizer = new FrecencyOptimizer(synchronizer, svmLoss)

browser.experiments.awesomeBar.onHistorySearch.addListener(optimizer.step.bind(optimizer))
// let controller = new HistorySearchController(optimizer)
