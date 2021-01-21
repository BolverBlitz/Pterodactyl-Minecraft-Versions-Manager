require('dotenv').config();

const mysql = require('mysql');
const fs = require('fs');

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

let GetAllVersionsOfGroup = function( id ) {
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

let ClearAllVersionsOfGroup = function( id ) {
	return new Promise(function(resolve, reject) {
		db.getConnection(function(err, connection){
			if(err) reject(err);
			var sqlcmd = `DELETE FROM versions where group_id = '${id}';`
			connection.query(sqlcmd, function(err, rows, fields) {
				if(err) reject(err);
				connection.release();
				resolve(rows);
			});
		})
	})
}

let ClearAllVersionsOfGroupByID = function( id ) {
	return new Promise(function(resolve, reject) {
		db.getConnection(function(err, connection){
			if(err) reject(err);
			var sqlcmd = `DELETE FROM versions where group_id = '${id}';`
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

let InsertVersionsByGroupID = function( ID, Game, Type, Filename ) {
	return new Promise(function(resolve, reject) {
        if(fs.existsSync(`./Minecraft_Versions.json`)){
            var Versions = JSON.parse(fs.readFileSync(`./Minecraft_Versions.json`));
            if(Object.keys(Versions).includes(Game)){
                if(Object.keys(Versions[Game]).includes(Type)){
                    db.getConnection(function(err, connection){
                        if(err) reject(err);
                        let Sort = 1;
                        let Promises = [];
                        Versions[Game][Type].map(v => {
                            let sqlcmd = `INSERT INTO versions (group_id, name, download_url, filename, action, sort) VALUES ?`;
                            let values = [[ID, `${Type} ${v.Version}`, v.Download_URL, Filename, 1, Sort]];
                            Promises.push(connection.query(sqlcmd, [values]));
                            Sort++;
                        });
                        
                        Promise.all(Promises).then((values) => {
                            resolve(`Done adding ${Sort-1} versions of ${Game} ${Type}`);
                        }).catch(error => console.log(error));
                        
                    })
                }else{
                    reject(new Error (`${Type} isn´t a supported type! Supported are ${Object.keys(Versions[Game])}`))
                }
            }else{
                reject(new Error (`${Game} isn´t a supported game! Supported are ${Object.keys(Versions)}`))
            }
        }else{
            reject(new Error ("Minecraft_Versions.json File not found!"))
        }
	})
}

module.exports = {
	GetGroupID,
	GetAllGroupIDs,
	GetAllVersionsOfGroup,
	ClearAllVersionsOfGroup,
    ClearAllVersionsOfGroupByID,
    SortVersionsOfGroup,
    InsertVersionsByGroupID
};