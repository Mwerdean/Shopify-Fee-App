const axios = require('axios')
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const sql = require('mssql')

const app = express()
app.use(cors())
app.use(bodyParser.json())
require('dotenv').config()

const config = {
    user: `${process.env.DATAUSER}`,
    password: `${process.env.DATAPASS}`,
    server: `${process.env.SERVER}`,
    database: `${process.env.DATABASE}`,
    dialect: `mssql`,
}


app.get('/database', (req, res) => {
    let arr = []
    sql.connect(config, function(err) {
      if(err) console.log(err)
      callMe()
    })
    async function callMe() {
      const customer = await sql.query`select * from customers`
      arr.push(customer)
      const products = await sql.query`select * from products`
      arr.push(products)
      sql.close()
      res.send(arr)
      console.log(err)
    }
  })

const port = process.env.PORT || 5001
app.listen(port, function() {
    console.log(`Listening on port ${port}`)
})