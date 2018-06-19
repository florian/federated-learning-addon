let synchronizer = new ModelSynchronization()
let optimizer = new FrecencyOptimizer(synchronizer, svmLoss)
let controller = new HistorySearchController(optimizer)
