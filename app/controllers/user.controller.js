'use strict';

var randomUser = require('../../lib/randomUser'),
	user = new randomUser(),
    moment = require('moment'),
      _ = require('lodash'),
    states = {
        "AL": "Alabama",
        "AK": "Alaska",
        "AS": "American Samoa",
        "AZ": "Arizona",
        "AR": "Arkansas",
        "CA": "California",
        "CO": "Colorado",
        "CT": "Connecticut",
        "DE": "Delaware",
        "DC": "District Of Columbia",
        "FM": "Federated States Of Micronesia",
        "FL": "Florida",
        "GA": "Georgia",
        "GU": "Guam",
        "HI": "Hawaii",
        "ID": "Idaho",
        "IL": "Illinois",
        "IN": "Indiana",
        "IA": "Iowa",
        "KS": "Kansas",
        "KY": "Kentucky",
        "LA": "Louisiana",
        "ME": "Maine",
        "MH": "Marshall Islands",
        "MD": "Maryland",
        "MA": "Massachusetts",
        "MI": "Michigan",
        "MN": "Minnesota",
        "MS": "Mississippi",
        "MO": "Missouri",
        "MT": "Montana",
        "NE": "Nebraska",
        "NV": "Nevada",
        "NH": "New Hampshire",
        "NJ": "New Jersey",
        "NM": "New Mexico",
        "NY": "New York",
        "NC": "North Carolina",
        "ND": "North Dakota",
        "MP": "Northern Mariana Islands",
        "OH": "Ohio",
        "OK": "Oklahoma",
        "OR": "Oregon",
        "PW": "Palau",
        "PA": "Pennsylvania",
        "PR": "Puerto Rico",
        "RI": "Rhode Island",
        "SC": "South Carolina",
        "SD": "South Dakota",
        "TN": "Tennessee",
        "TX": "Texas",
        "UT": "Utah",
        "VT": "Vermont",
        "VI": "Virgin Islands",
        "VA": "Virginia",
        "WA": "Washington",
        "WV": "West Virginia",
        "WI": "Wisconsin",
        "WY": "Wyoming"
    };



exports.getUsersOver21 = function(req, res){
  user.getUsers(function(err, data){
    var usersOver21 = _.filter(data, function(result){
      var user = result.user; 
      return (moment().year() - moment.unix(user.dob).years()) > 21;
    });
    res.render('index', { results : usersOver21});
  });
};


exports.getRandomUsers = function(req, res){
  user.getUsers(function(err, data){

    _.map(data, function(result){
      var user = result.user; 
      user.age = moment().year() - moment.unix(user.dob).years();
      user.dob = moment.unix(user.dob).format("MMMM Do YYYY");
      return user;
    });

    res.format({
      html: function(){
        res.render('users', { results : data, states : states });
      }, 
      json: function(){
        res.send({ results : data });
      }
    });

  });
};


exports.filterUsers = function(req, res){
  var inputs = req.body;

  user.getUsers(function(err, data){

    _.map(data, function(result){
      var user = result.user; 
      user.age = moment().year() - moment.unix(user.dob).years();
      user.dob = moment.unix(user.dob).format("MMMM Do YYYY");
      return user;
    });

    for(var key in inputs){
      switch(key) {
        case "from":
          var fromValue = inputs['from'], 
              toValue  = inputs['to'];

          //if one of the field is filled
          if ( fromValue || toValue ){

            fromValue = parseInt(fromValue);
            toValue = parseInt(toValue);

            if ( _.isNaN(fromValue) || _.isNaN(toValue) ) {
              res.jsonp({ error : "Something is wrong with your value"});
              return;
            } else if (fromValue > toValue ){
              res.jsonp({ error : "Something is wrong with your value. Should be like this 12 - 75."});
              return; 
            } else {
              data = _.filter(data, function(result){
                return result.user.age >= fromValue && result.user.age <= toValue;   
              });
            }

          }
          break; 
        case "gender":
          if ( ! _.isString( inputs.gender ) ){
            res.jsonp({ error : "Something is wrong with your value[Gender]"});
            return;
          }
          data = _.filter(data, function(result){
            return result.user.gender.toLowerCase() === inputs.gender.toLowerCase();
          });
          break; 
        case "state":
          if ( ! _.isString( inputs.state ) ){
            res.jsonp({ error : "Something is wrong with your value[State]"});
            return;
          }
          data = _.filter(data, function(result){
            return result.user.location.state.toLowerCase() === inputs.state.toLowerCase();
          });
          break;
      }
    }

    res.jsonp({ results : data });

  });
};


exports.saveUser = function(req, res){
	var inputs = req.body, 
	respond = {}; 
    

    if ( ! inputs.name ) {
      respond.error = "Your name is missing.";
    } 

    if ( ! inputs.email ){
      respond.error = "Your email is missing."
    } else {
      if ( ! validateEmail(inputs.email) ) {
        respond.error = "Your email addres is invalid."
      }
    }

    if ( ! inputs.phone ){
      respond.error = "Your phone number is missing.";
    } else {
      if ( ! inputs.phone.match(/\d/g).length === 10 ) {
        respond.error = "Your phone number is invalid."
      }
    }
    
    if ( ! respond.error ) {
      //insert into DB .........
      respond.success = "Success"
    }

    res.jsonp(respond);
};



function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}; 