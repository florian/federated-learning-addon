Cu.import("resource://gre/modules/PlacesUtils.jsm")

function getFrecencyByURL(url) {
  try {
  	let db = PlacesUtils.history.DBConnection

  	let stmt = db.createStatement("SELECT frecency FROM moz_places WHERE url_hash = hash(:url)");
  	stmt.bindByName("url", url)

  	stmt.executeStep()
  	return stmt.row.frecency
  } catch {
  	console.log("error", url)
  }
}

function getFrecencyByID(id) {
  try {
  	let db = PlacesUtils.history.DBConnection

  	let stmt = db.createStatement("SELECT frecency FROM moz_places WHERE id = :id")
  	stmt.bindByName("id", id)

  	stmt.executeStep()
  	return stmt.row.frecency
  } catch {
  	console.log("error", id)
  }
}

function createDBFunction(fn, name, num_arguments) {
  let db = PlacesUtils.history.DBConnection
  db.createFunction(name, num_arguments, fn)
}

function setFrecencyTrigger() {
  let db = PlacesUtils.history.DBConnection
  let stmt = db.createStatement(`
	CREATE TEMP TRIGGER frecency_trigger
	AFTER UPDATE OF frecency ON moz_places FOR EACH ROW
	BEGIN
	  UPDATE moz_places
	  SET frecency = 100
	  WHERE id = OLD.id;
	END
  `)
  stmt.executeStep()
}
// SET frecency = compute_frecency(100)

// createDBFunction((args) => computeFrecency(args.getDouble(0)), "compute_frecency", 1)
// setFrecencyTrigger()

(function() {
  let db = PlacesUtils.history.DBConnection;
  let stmt = db.createStatement("SELECT compute_frecency(100) AS myValue")
  stmt.executeStep()
  console.log(stmt.row.myValue)
})();

(function() {
  let db = PlacesUtils.history.DBConnection;
  let stmt = db.createStatement("DROP TRIGGER frecency_trigger")
  stmt.executeStep()
})();

