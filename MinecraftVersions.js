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
		if(element !== "Fix"){
			SQL.GetGroupID(element).then(function(id) {
				if(id.length !== 0){
					SQL.SortVersionsOfGroup(id[0].id).then(function(rows) {
						console.log(`${rows} (${element})`)
					}).catch(error => console.log(error));
				}else{
					console.log(`${element} is no versions group`)
				}
			}).catch(error => console.log(error));
		}
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
		if(element !== "Fix"){
			SQL.GetGroupID(element).then(function(id) {
				if(id.length !== 0){
					SQL.ClearAllVersionsOfGroup(id[0].id).then(function(rows) {
						console.log(`Deleted ${rows.affectedRows} Versions from ${element}`)
					}).catch(error => console.log(error));
				}else{
					console.log(`${element} is no versions group`)
				}
			}).catch(error => console.log(error));
		}
    })
}

function CleanAllVersionsOfGroupID(ID){
	console.log("s")
    SQL.ClearAllVersionsOfGroupByID(ID).then(function(rows) {
        console.log(`Deleted ${rows.affectedRows} Versions from ${ID}`)
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

//CreateVersionsForGroupID(2, "Minecraft", "Paper", "server.jar")

process.argv.forEach(function (val, index, array) {
	if(val === "-update" || val === "-u"){
		UpdateVersionsFromGit(Git_URI).then(function(rows) {
			console.log("Updated Versions from git")
		}).catch(error => console.log(error));
	}
	if(val === "-help" || val === "-h"){
		console.log("-u | -update: Will update Versions from git\n")
		console.log("-h | -help: Will show this help\n")
		console.log("-s | -sort <all|Name of Group>: Will sort the parameter in pterodactyl Example: node MinecraftVersions.js -s Paper, Vanilla\n")
		console.log("-c | -clean <ID|Name of Group>: Will delete all versions of that group Example: node MinecraftVersions.js -c 2\n")
		console.log("-C | -Create <ID> <Game> <Type> <Filename>: Will inport all latest versions of that game Example: node MinecraftVersions.js -C 2 Minecraft Paper server.jar\n")
	}
	if(val === "-sort" || val === "-s"){
		if(process.argv[index+1] === "all" || process.argv[index+1] === "a"){
			SortAllVersions();
		}else{
			let Temp = `Fix,${process.argv[index+1]}`
			let arr = Temp.split(",")
			SortVersions(arr);
		}
	}
	if(val === "-clean" || val === "-c"){
		if(!isNaN(process.argv[index+1])){
			CleanAllVersionsOfGroupID(process.argv[index+1])
		}else{
			let Temp = `Fix,${process.argv[index+1]}`
			let arr = Temp.split(",")
			CleanAllVersionsOfGroupName(arr);
		}
	}
	if(val === "-Create" || val === "-C"){
		CreateVersionsForGroupID(process.argv[index+1], process.argv[index+2], process.argv[index+3], process.argv[index+4])
	}
  });