const axios = require('axios')
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const sql = require('mssql')

const app = express()
app.use(cors())
app.use(bodyParser.json())
require('dotenv').config()

const sk = process.env.SHOPIFY_API_KEY
const ss = process.env.SHOPIFY_API_SECRET

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


app.post('/sendFee', (req, res) => {
    let students = []
    getStudents()
    async function getStudents() {
        for(let item in req.body.customers) {
            const customer = req.body.customers
            await axios.get(`https://${sk}:${ss}@basis-ed.myshopify.com/admin/customers/${customer[item].id}/metafields.json`).then(res => {
                for(let item in res.data.metafields) {
                    if(res.data.metafields[item].namespace === 'children_names') {
                        students.push({owner_id: res.data.metafields[item].owner_id, child_name: res.data.metafields[item].value})
                    }
                }
            }).catch(error => console.log('get customer error', error))
        }
        console.log('Students', students)
        res.send(students)
    }
})

const port = process.env.PORT || 5001
app.listen(port, function() {
    console.log(`Listening on port ${port}`)
})