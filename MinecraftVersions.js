require('dotenv').config();

const SQL = require('./lib/SQL')
const request = require('request');
const fs = require('fs');

const Git_URI = "https://raw.githubusercontent.com/BolverBlitz/Pterodactyl-Minecraft-Versions-Manager/main/Minecraft_Versions.json"

let UpdateVersionsFromGit = function(URI) {
	return new Promise(function(resolve, reject) {
		request(URI, { json: true }, (err, res, body) => {
			if (err) { reject(err); }
			var myJSON = JSON.stringify(body); 
				fs.writeFile(`./Minecraft_Versions.json`, myJSON, (err) => {
					if (err) resolve(err);
					resolve(body)
				});
		});
	});
}

function SortVersions(SortAll){
    SortAll.map(element => {
        SQL.GetGroupID(element).then(function(id) {
            SQL.SortVersionsOfGroup(id[0].id).then(function(rows) {
                console.log(rows)
            }).catch(error => console.log(error));
        }).catch(error => console.log(error));
    })
}

function SortAllVersions(){
    SQL.GetAllGroupIDs().then(function(ids) {
        ids.map(id => {
            SQL.SortVersionsOfGroup(id.id).then(function(rows) {
                console.log(rows)
            }).catch(error => console.log(error));
        })
    }).catch(error => console.log(error));
}

function CleanAllVersionsOfGroupName(CleanAll){
    CleanAll.map(element => {
        SQL.GetGroupID(element).then(function(id) {
            SQL.ClearAllVersionsOfGroup(id[0].id).then(function(rows) {
                console.log(rows)
            }).catch(error => console.log(error));
        }).catch(error => console.log(error));
    })
}

function CleanAllVersionsOfGroupID(ID){
    SQL.ClearAllVersionsOfGroupByID(ID).then(function(rows) {
        console.log(rows)
    }).catch(error => console.log(error));
}

function CreateVersionsForGroupID(ID, Game ,Type, Filename){
    SQL.InsertVersionsByGroupID(ID, Game, Type, Filename).then(function(rows) {
        console.log(rows)
    }).catch(error => console.log(error));
}
//SortVersions(["Paper"]); //Write here all names you wanna sort from https://panel.ebg.pw/admin/version
//SortAllVersions();

//CleanAllVersionsOfGroupName(["Paper"]); //Write here all names you wanna delete all versions from https://panel.ebg.pw/admin/version
//CleanAllVersionsOfGroupID(3);

/*
UpdateVersionsFromGit(Git_URI).then(function(rows) {
	console.log(rows)
}).catch(error => console.log(error));
*/

CreateVersionsForGroupID(2, "Minecraft", "Paper", "server.jar")