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
                tryToAddDept()
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

                depts.push(obj.department_name.toLowerCase())
            })

            console.log(table.toString())

            connection.end()
        }
    )
}

function tryToAddDept () {
    updateDepts()
    inquirer.prompt([
        {
            message: 'What is the name of the new department?',
            name: 'dept'
        },{
            message: 'What are the over head costs?',
            name: 'overhead'
        }
    ]).then(function(answers){
        if(isNaN(answers.overhead)){
            console.log('Enter an actual number for the over head costs')
            tryToAddDept()
        }else if(depts.includes(answers.dept.toLowerCase().trim())){
            console.log('That department already exists!')
            connection.end()
        }else{
            addDept(answers.dept, answers.overhead)
        }
    })
}

function addDept (dept, overhead) {
    connection.query(
        'INSERT INTO departments SET ?',
        {
            department_name: dept,
            over_head_costs: overhead
        },
        function(err, res){
            if(err) throw err
            console.log("Added '" + dept + "' to departments")
            connection.end()
        }
    )
}

function updateDepts () {
    // reset the items array
    depts =[]
    connection.query('SELECT department_name FROM departments', function (err, res){
        if(err) throw err

        res.forEach(function(obj){
            depts.push(obj.department_name.toLowerCase())
        })

        console.log(depts)

    })

}

menu()