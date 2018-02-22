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
    readItems()
})

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
            items.push(obj.product_name.toLowerCase())
            
            table.push(itemInfo)
        })

        console.log(table.toString())

        selectItem()
    })
}

function selectItem () {
    inquirer.prompt([
        {
            message: 'Which item would you like to buy?',
            name: 'item',
        },{
            message: 'How many would you like to buy?',
            name: 'number',
        }
    ]).then(function(answer){
        var item = answer.item.toLowerCase()

        if(isNaN(answer.number)){
            console.log('Enter an actual number')
        }else if(items.includes(item)){
            checkInventory(item, answer.number)
        }else{
            console.log('Please select a valid item')
            selectItem()
        }
    })
}

function checkInventory (item, number) {
    connection.query("SELECT stock_quantity, price FROM products WHERE ?", 
    {product_name: item}, 
    function(err, res){
        if(err) throw err;
        var stock = res[0].stock_quantity
        var price = res[0].price
        if(number <= stock){
            buyItem(item, number, stock, price)
        }else{
            console.log('Not enough stock to complete purchase')
            connection.end()
        }
    })
}

function buyItem (item, number, stock, price) {
    connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: stock - number
            },{
                product_name: item
            }
        ],
        function(err, res){
            if(err) throw err

            updateSales(price, number, item)
        }
    )
}

function updateSales (price, number, item) {
    connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                product_sales: price*number
            },{
                product_name: item
            }
        ],
        function(err, res){
            if(err) throw err
            console.log('Your account has been charged $' + price*number)

            connection.end()
        }
    )
}
