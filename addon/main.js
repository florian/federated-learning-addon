async function main () {
  const studySetup = await getStudySetup()
  const studyInfo = await browser.study.setup(studySetup)

  const synchronizer = new ModelSynchronization(studyInfo)
  const optimizer = new FrecencyOptimizer(synchronizer, svmLoss)

  browser.experiments.awesomeBar.onHistorySearch.addListener(optimizer.step.bind(optimizer))
}

main()
