const axios = require('axios')
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const sql = require('mssql')
const nodemailer = require('nodemailer')

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


app.post('/sendStudents', (req, res) => {
    let students = []
    let allFees = []
    getStudents()
    async function getStudents() {
        for(let item in req.body.customers) {
            const customer = req.body.customers
            await axios.get(`https://${sk}:${ss}@basis-ed.myshopify.com/admin/customers/${customer[item].id}/metafields.json`).then(res => {
                let fees = {}
                for(let item in res.data.metafields) {
                    const i = res.data.metafields[item]
                    let j = i.key.split('_')[0]
                    if(i.namespace === 'children_names') {
                        students.push({owner_id: i.owner_id, child_name: i.value, child_key: j})
                    }

                    if(i.namespace === 'fee') {
                        if(fees[j]) {
                            fees[j] = fees[j] + 1
                        } else {
                            fees['owner_id'] = i.owner_id
                            fees[j] = 1
                        }
                    }
                }
                if(Object.keys(fees).length > 0) {allFees.push(fees)}
            }).catch(error => console.log('get customer error', error))
        }
        for(let i=0; i<students.length; i++) {
            for(let j=0; j<allFees.length; j++) {
                if(students[i].owner_id === allFees[j].owner_id) {
                    for(let item in allFees[j]) {
                        if(item === students[i].child_key) {
                            students[i]['fees'] = allFees[j][item]
                        }
                    }
                }
            }
        }
        
        console.log('Students Sent', students)
        res.send(students)
    }
})

app.post('/submitFee', (req, res) => {
    console.log('Submit Fee Data:', req.body)
    attachFee()
    async function attachFee() {
        for(let item in req.body.shipped) {
            const shipped = req.body.shipped[item]

            let fee = 0
            if(shipped.fees) {
                fee = shipped.fees
            }
            const key = shipped.child_key + "_fee" + (fee + 1)

            obj = 
            {
                "customer": {
                    "id": shipped.owner_id,
                    "metafields": [
                        {
                            "key": key,
                            "value": req.body.product[0].variant_id,
                            "value_type": "string",
                            "namespace": "fee",
                        }
                    ]
                }
            }
            await axios.put(`https://${sk}:${ss}@basis-ed.myshopify.com/admin/customers/${shipped.owner_id}.json`, obj).then(res => {
                console.log('Attached')
            }).catch(error => console.log('Add metafield error', error))
        }
        sendEmail()
    }
    
    async function sendEmail() {
        let transporter = nodemailer.createTransport({
            pool: true,
            rateDelta: 1000,
            rateLimit: 2,
            host: process.env.EMAIL_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }

        })
        for(let item in req.body.shipped) {
            const product = req.body.product[0]
            const student = req.body.shipped[item]
            let email = null
            
            for(let i=0; i<req.body.customers.length; i++) {
                if(parseInt(req.body.customers[i].id, 10) === student.owner_id) {
                    email = req.body.customers[i].email
                }
            }
            console.log("email", email)

            const output = `
                <p>A new fee was added to your account</p>
                <h3>Details</h3>
                <p>Fee: ${product.title}</p>
                <p>Price: ${product.price}</p>
                <p>Student: ${student.child_name}</p>
                <p>Please log in at shop.basised.com and check your cart to pay this fee before the end of the month. If you have any questions or there was an error, please contact your school.</p>
                `
                
                
                // <p>Note: Kindergarten Tuition will now automatically be added on the 4th of each month.</p>
    
            let mailOptions = {
                from: '"BASIS Payments" <matthew.werdean@basised.com',
                to: email,
                subject: 'Message From BASIS Payment System',
                text: 'Message from BASIS. A new fee was added to your account.',
                html: output
            }
    
           await  transporter.sendMail(mailOptions, (error, info) => {
                if(error) {
                    return console.log(error);
                }
                console.log('Message send: %s', info.messageId)
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
    
            })
        }
        res.sendStatus(200)
    }
})

app.post('/searchMeta', (req, res) => {
    console.log(req.body)
    let data
    func()
    async function func() {
        await axios.get(`https://${sk}:${ss}@basis-ed.myshopify.com/admin/customers/${req.body.id}/metafields.json`).then(res => {
            console.log(res.data)
            data = res.data
        })
        res.send(data)

    }
})

app.post('/removeMeta', (req, res) => {
    console.log(req.body)
    rem()
    async function rem() {
        await axios.delete(`https://${sk}:${ss}@basis-ed.myshopify.com/admin/metafields/${req.body.id}.json`).then(res => {
            console.log(res.data)
        })
        res.sendStatus(200)
    }
})


const port = process.env.PORT || 5001
app.listen(port, function() {
    console.log(`Listening on port ${port}`)
})