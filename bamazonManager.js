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
    // console.log('Connected! ID #' + connection.threadId)
    
})

function showMenu () {
    updateItems()
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
                selectItem()
                break;
            case 'Add New Product' :
                tryToAddItem()
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
            items.push(obj.product_name.toLowerCase().trim())
            
            table.push(itemInfo)
        })

        console.log(table.toString())

        connection.end()
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
                
                table.push(itemInfo)
            })
    
            console.log(table.toString())
        }else{
            console.log('No items are low in stock!')

        }

        connection.end()

    })
}

function selectItem () {
    inquirer.prompt([
        {
            message: "Which product's inventory should change?",
            name: 'product'
        },{
            message: "What is the new inventory?",
            name: 'stock'
        }
    ]).then(function(answer){
        var item = answer.product.toLowerCase().trim()
        if(isNaN(answer.stock)){
            console.log('Enter an actual number')
            selectItem()
        }
        else if(items.includes(item)){
            addInventory(item, answer.stock)
        }else{
            console.log('Please select a valid item')
            selectItem()
        }
    })
}

function addInventory (item, stock) {
    connection.query(
        'UPDATE products SET ? WHERE ?',
        [
            {
                stock_quantity: stock
            },
            {
                product_name: item
            }
        ],
        function(err, res){
            if(err) throw err
            console.log(item + ' inventory changed to ' + stock)
            connection.end()
        })
}

function tryToAddItem () {
    inquirer.prompt([
        {
            name: 'item',
            message: 'What item would you like to add?'
        },
        {
            name: 'stock',
            message: 'What is the quantity of this item?'
        },
        {
            name: 'dept',
            message: 'What is the name of the department for this item?'
        },
        {
            name: 'price',
            message: 'How much does this item cost?'
        }
    ]).then(function(answers){
        
        if(isNaN(answers.price) || isNaN(answers.stock)){
            console.log('Enter an actual number')
            tryToAddItem()
        }
        //item already exists
        else if(items.includes(answers.item.toLowerCase().trim())){
            console.log('The item already exists!')
            connection.end()
        }else{
            addItem(answers)
        }   
    })
}

function addItem (iteminfo){
    var item = {
        product_name: iteminfo.item,
        department_name: iteminfo.dept,
        price: iteminfo.price,
        stock_quantity: iteminfo.stock
    }
    connection.query(
        'INSERT INTO products SET ?',
        item,
        function(err, res){
            if(err) throw err
            console.log(iteminfo.item + ' added!')
            connection.end()
        }
    )
}

//grab all item names from DB, push them to array for reference
function updateItems () {
    // reset the items array
    items =[]
    connection.query('SELECT product_name FROM products', function (err, res){
        if(err) throw err

        res.forEach(function(obj){
            items.push(obj.product_name.toLowerCase())
        })

    })

}

showMenu()
