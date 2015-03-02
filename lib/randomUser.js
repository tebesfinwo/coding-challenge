'use strict';


var request = require('request');

var randomUser = function(options){
	var uri = "http://api.randomuser.me/";
	this.results = 100;
	this.seeds = "tebesfinwo"
	//change it into dynamic in the future.
	this.uri = uri + "?results=" + this.results + "&seed=" + this.seeds;
};

randomUser.prototype.getUsers = function(cb) {
	request({
		method: "GET", 
		uri: this.uri, 
		json: true
	}, function(error, response, body){
		return cb(error, body.results);
	});
};

module.exports = randomUser;
