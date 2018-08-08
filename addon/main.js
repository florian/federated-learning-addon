async function main () {
  const studySetup = await getStudySetup()
  const studyInfo = await browser.study.setup(studySetup)
  await setStudyVariation(studyInfo)

  // set the expiration
  const { delayInMinutes } = studyInfo;
  if (delayInMinutes !== undefined) {
    const alarmName = `${browser.runtime.id}:studyExpiration`;
    const alarmListener = async alarm => {
      if (alarm.name === alarmName) {
        browser.alarms.onAlarm.removeListener(alarmListener);
        await browser.study.endStudy("expired");
      }
    };
    browser.alarms.onAlarm.addListener(alarmListener);
    browser.alarms.create(alarmName, {
      delayInMinutes,
    });
  }

  const synchronizer = new ModelSynchronization(studyInfo)
  const optimizer = new FrecencyOptimizer(synchronizer, svmLoss)

  browser.experiments.awesomeBar.onHistorySearch.addListener(optimizer.step.bind(optimizer))
  browser.study.onEndStudy.addListener(() => {
    browser.management.uninstallSelf()
  })
}

main()
