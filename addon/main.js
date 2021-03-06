async function main () {
  const studySetup = await getStudySetup()
  const studyInfo = await browser.study.setup(studySetup)
  await setStudyVariation(studyInfo)

  const synchronizer = new ModelSynchronization(studyInfo)
  const optimizer = new FrecencyOptimizer(synchronizer, svmLoss)

  browser.experiments.awesomeBar.onHistorySearch.addListener(optimizer.step.bind(optimizer))
  browser.study.onEndStudy.addListener(() => {
    browser.management.uninstallSelf()
  })
}

main()
