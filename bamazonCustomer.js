require("dotenv").config();

var password = require('./password').database.password,
    inquirer = require('inquirer'),
    mysql = require('mysql');

