function logAllFrecencies() {
  let wrong = {}

  let db = PlacesUtils.history.DBConnection;
  let stmt = db.createStatement("SELECT id, url, frecency FROM moz_places ORDER BY frecency DESC")

  while(stmt.executeStep()) {
 	frec1 = computeFrecency(stmt.row.id)
 	frec2 = computeFrecency2(stmt.row.id)

    a = Math.max(frec1, frec2)
    b = Math.min(frec1, frec2)

 	if (a / b < 0.9 && frec1 > 500) {
 	  console.log(stmt.row.id, stmt.row.url, stmt.row.frecency, frec1, frec2)

      var key = frec1 + "/" + frec2
      if (!(key in wrong)) wrong[key] = 0
      wrong[key] += 1
 	}
  }

  return wrong
 }

function logFrecencies() {
 	 let db = PlacesUtils.history.DBConnection;
 	 let stmt = db.createStatement("SELECT CALCULATE_FRECENCY(id) as frecency FROM moz_places DESC LIMIT 100")
	 let frecencies = []

 	 while(stmt.executeStep()) {
 	 	 //console.log(stmt.row.id, stmt.row.url, stmt.row.frecency, computeFrecency(stmt.row.id), computeFrecency2(stmt.row.id))
		 frecencies.push(stmt.row.frecency)
 	 }
	 
	 return frecencies
 }

(function () {
 	 let db = PlacesUtils.history.DBConnection;
 	 let stmt = db.createStatement("SELECT id, url, frecency FROM moz_places DESC LIMIT 100")

      var same = 0
      var diff = 0

 	 while(stmt.executeStep()) {
 	   if (computeFrecency(stmt.row.id) == computeFrecency2(stmt.row.id)) {
 	     same += 1
 	  } else {
 	    diff += 1
 	  }
 	 }

  console.log(same / (same + diff))
})()

function logHistory() {
 	 let db = PlacesUtils.history.DBConnection;
 	 let stmt = db.createStatement("SELECT place_id FROM moz_historyvisits")

 	 while(stmt.executeStep()) {
 	 	 console.log(stmt.row.url, stmt.row.place_id)
 	 }
 }

/*
(function(){
let db = PlacesUtils.history.DBConnection;
let stmt = db.createStatement(`
  SELECT id, url, frecency, CALCULATE_FRECENCY(id) as computedFrecency
  FROM moz_places
  LIMIT 100
`)

while(stmt.executeStep()) {
   console.log(stmt.row.id, stmt.row.url, stmt.row.frecency, stmt.row.computedFrecency)
}
})()
*/
