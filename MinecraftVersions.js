require('dotenv').config();

const mysql = require('mysql');

var db = mysql.createPool({
	connectionLimit : 100,
	host: process.env.DB_HOST,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	charset : 'utf8mb4_bin'
});

let GetGroupID = function( name ) {
	return new Promise(function(resolve, reject) {
		db.getConnection(function(err, connection){
			if(err) reject(err);
			var sqlcmd = `SELECT id FROM version_groups where name LIKE '%${name}%';`
			connection.query(sqlcmd, function(err, rows, fields) {
				if(err) reject(err);
				connection.release();
				resolve(rows);
			});
		})
	})
}

let GetAllGroupIDs = function() {
	return new Promise(function(resolve, reject) {
		db.getConnection(function(err, connection){
			if(err) reject(err);
			var sqlcmd = `SELECT id FROM version_groups;`
			connection.query(sqlcmd, function(err, rows, fields) {
				if(err) reject(err);
				connection.release();
				resolve(rows);
			});
		})
	})
}

let GetVersionsOfGroup = function( id ) {
	return new Promise(function(resolve, reject) {
		db.getConnection(function(err, connection){
			if(err) reject(err);
			var sqlcmd = `SELECT * FROM versions where group_id = '${id}';`
			connection.query(sqlcmd, function(err, rows, fields) {
				if(err) reject(err);
				connection.release();
				resolve(rows);
			});
		})
	})
}

let SortVersionsOfGroup = function( id ) {
	return new Promise(function(resolve, reject) {
		db.getConnection(function(err, connection){
			if(err) reject(err);
            var sqlcmd = `SELECT name FROM versions where group_id = '${id}';`
			connection.query(sqlcmd, function(err, rows, fields) {
				if(err) reject(err);
                connection.release();
                var altrows = rows
                rows.map(row => {
                    row.sort = row.name.split("Paper ").join("")
                });
                rows.sort( (a, b) => a.sort.replace(/\d+/g, n => +n+100000 )
                    .localeCompare(b.sort.replace(/\d+/g, n => +n+100000 )) );
                
                let Promises = [];
                for(i = 0; i <= rows.length-1; i++) {
                    Promises.push(connection.query(`UPDATE versions SET sort = '${rows.length-i}'  WHERE name = '${rows[i].name}';`));
                    
                };

                Promise.all(Promises).then((values) => {
                    resolve(`Done sorting ${id}`);
                }).catch(error => console.log(error));
            });
		});
	});
}

function SortVersions(SortAll){
    SortAll.map(element => {
        GetGroupID(element).then(function(id) {
            SortVersionsOfGroup(id[0].id).then(function(rows) {
                console.log(rows)
            }).catch(error => console.log(error));
        }).catch(error => console.log(error));
    })
}

function SortAllVersions(){
    GetAllGroupIDs().then(function(ids) {
        ids.map(id => {
            SortVersionsOfGroup(id.id).then(function(rows) {
                console.log(rows)
            }).catch(error => console.log(error));
        })
    }).catch(error => console.log(error));
}

//SortVersions(["Paper"]); //Write here all names you wanna sort from https://panel.ebg.pw/admin/version
SortAllVersions();