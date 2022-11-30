const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express()

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ekuronr.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
      const catagoryCollection = client.db('secondHandCar').collection('catagories');
      const userCollection = client.db('secondHandCar').collection('usersdatabase');
      const productsCollection = client.db('secondHandCar').collection('categoryproducts');
      const bookCollection = client.db('secondHandCar').collection('bookeddatabase');
    
      app.get('/catagory', async(req, res) =>{
        const query = {};
        const catagoryitem = await catagoryCollection.find(query).toArray();
        res.send(catagoryitem);
      });


      app.get('/jwt', async(req, res)=>{
        const email = req.query.email;
        const query = {email: email};
        const user = await userCollection.findOne(query);
        if(user){
          const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1h'})
          return res.send({tokenForAccess: token});
        }
        res.status(403).send({tokenForAccess: 'congratulation you have got ghorar egg'})
      })

      //uploading user information
      app.post('/users', async(req, res)=>{
        const userInformation = req.body;
        console.log(userInformation);
        const result = await userCollection.insertOne(userInformation);
        res.send(result);
      });


      //modal data sending
      app.post('/bookdata', async(req, res)=>{
        const book = req.body;
        console.log(book);
        const result = await bookCollection.insertOne(book);
        res.send(result);
      });


      app.post('/products', async(req, res)=>{
        const product = req.body;
        console.log(product);
        const result = await productsCollection.insertOne(product);
        res.send(result);
      });

      //product load based on category
      app.get('/products', async(req,res) =>{
        console.log(req.query)
        let query ={};
        if(req.query.product_category ){
          query = {
            product_category: req.query.product_category
           
          }
        }
        
        const cursor = productsCollection.find(query);
        const myreview = await cursor.toArray();
        res.send(myreview);
      });

      //seller product load
      app.get('/product', async(req,res) =>{
        console.log(req.query)
        let query ={};
        if(req.query.seller_email ){
          query = {
            seller_email: req.query.seller_email
           
          }
        }
        
        const cursor = productsCollection.find(query);
        const myreview = await cursor.toArray();
        res.send(myreview);
      });



      //seller can delete their product now
      app.delete('/delproduct/:id', async(req, res)=>{
        const id = req.params.id;
        console.log(id)
        const query = {_id: ObjectId(id)};
        const result = await productsCollection.deleteOne(query);
        res.send(result);
      })

      //all user route
      app.get('/user', async(req, res) =>{
        const query = {role: 'Seller'};
        const catagoryitem = await userCollection.find(query).toArray();
        res.send(catagoryitem);
      });

      //admin can delete user /deluser/${id}
      app.delete('/deluser/:id', async(req, res)=>{
        const id = req.params.id;
        console.log(id)
        const query = {_id: ObjectId(id)};
        const result = await userCollection.deleteOne(query);
        res.send(result);
      })

    }
    finally{
  
    }
  }
  
  run().catch(error=> console.error(error))



app.get('/', async(req, res) =>{
    res.send('second hand product server is running')
})

app.listen(port, () => console.log(`second hand server is running ${port}`))