require("dotenv").config();


var password = require('./password').database.password,
    inquirer = require('inquirer'),
    mysql = require('mysql'),
    Table = require('cli-table'),
    colors = require('colors'),
    depts = []

var connection = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: password,
    database: 'bamazon'
})

function menu () {
    inquirer.prompt([
        {
            name: 'menu',
            type: 'list',
            message: 'Please choose a menu option',
            choices: ['View Product Sales by Department', 'Create New Department']
        }
    ]).then(function(answer){
        switch(answer.menu){
            case 'View Product Sales by Department':
                viewSales()
                break;
            case 'Create New Department':
                
                break;
        }
    })
}

function viewSales () {
    connection.query(
        "SELECT department_id, departments.department_name, over_head_costs, SUM(product_sales) AS product_sales, SUM(product_sales) - over_head_costs AS total_profit FROM departments INNER JOIN products ON departments.department_name = products.department_name GROUP BY department_id",
        function(err, res){
            if(err) throw err
            
            //put response into table format
            var table = new Table({
                head : ['Dept. ID', 'Department Name', 'Over Head Costs', 'Product Sales', 'Total Profit'],
                colWidths: [10, 30, 20, 20, 20]
            })

            res.forEach(function(obj){
                var deptInfo = [obj.department_id, obj.department_name, obj.over_head_costs, obj.product_sales, obj.total_profit]

                table.push(deptInfo)
            })

            console.log(table.toString())
        }
    )
}

menu()