require("dotenv").config();


var password = require('./password').database.password,
    inquirer = require('inquirer'),
    mysql = require('mysql'),
    Table = require('cli-table'),
    colors = require('colors'),
    items = []

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
    
})

function showMenu () {
    inquirer.prompt([
        {
            message: 'Please select a menu option',
            name: 'menu',
            type: 'list',
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product']
        }
    ]).then(function(answer){
        
        switch(answer.menu){
            case 'View Products for Sale' :
                readItems()
                break;
            case 'View Low Inventory' :
                readLowInventory()
                break;
            case 'Add to Inventory' :
                break;
            case 'Add New Product' :
                break;
        }
    })
}

function readItems () {
    connection.query("SELECT * FROM products", function(err, res){
        if(err) throw err;

        var table = new Table({
            head : ['Item ID', 'Product Name', 'Department Name', 'Price', 'Stock'],
            colWidths: [10, 40, 30, 10, 10]
        })
        //put each item's info into table
        res.forEach(function(obj){
            var itemInfo = [obj.item_id, obj.product_name, obj.department_name, obj.price, obj.stock_quantity]

            //put items into global array
            items.push(obj.product_name)
            
            table.push(itemInfo)
        })

        console.log(table.toString())
    })
}

function readLowInventory () {
    connection.query("SELECT * FROM products WHERE stock_quantity < 6", function(err, res){
        if(err) throw err;

        var table = new Table({
            head : ['Item ID', 'Product Name', 'Department Name', 'Price', 'Stock'],
            colWidths: [10, 40, 30, 10, 10]
        })

        if(res.length > 0){
            res.forEach(function(obj){
                var itemInfo = [obj.item_id, obj.product_name, obj.department_name, obj.price, obj.stock_quantity]
    
                //put items into global array
                items.push(obj.product_name)
                
                table.push(itemInfo)
            })
    
            console.log(table.toString())
        }else{
            console.log('No items are low in stock!')
        }

    })
}

showMenu()