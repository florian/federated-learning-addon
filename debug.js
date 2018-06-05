function logAllFrecencies() {
 	 let db = PlacesUtils.history.DBConnection;
 	 let stmt = db.createStatement("SELECT id, url, frecency FROM moz_places")

 	 while(stmt.executeStep()) {
 	 	 console.log(stmt.row.id, stmt.row.url, stmt.row.frecency)
 	 }
 }

function logHistory() {
 	 let db = PlacesUtils.history.DBConnection;
 	 let stmt = db.createStatement("SELECT place_id FROM moz_historyvisits")

 	 while(stmt.executeStep()) {
 	 	 console.log(stmt.row.url, stmt.row.place_id)
 	 }
 }
