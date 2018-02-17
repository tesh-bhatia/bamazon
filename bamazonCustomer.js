require("dotenv").config();


var password = require('./password').database.password,
    inquirer = require('inquirer'),
    mysql = require('mysql'),
    Table = require('cli-table'),
    colors = require('colors')

var connection = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: password,
    database: 'bamazon'
})

connection.connect(function(err){
    if(err) throw err;
    console.log('Connected! ID #' + connection.threadId)
    readItems()
})

function readItems () {
    connection.query("SELECT * FROM products", function(err, res){
        if(err) throw err;
        console.log(res)
        var table = new Table({
            head : ['Item ID', 'Product Name', 'Department Name', 'Price', 'Stock'],
            colWidths: [10, 40, 30, 10, 10]
        })
        res.forEach(function(obj){
            var itemInfo = [obj.item_id, obj.product_name, obj.department_name, obj.price, obj.stock_quantity]

            table.push(itemInfo)
        })

        console.log(table.toString())
    })
}
