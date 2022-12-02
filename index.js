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


function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
      return res.status(401).send('you are not authorized for this access');
  }
  const token = authHeader.split(' ')[1];
  console.log(token)
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
        return res.status(403).send({ message:'access is forbiden' })
    }
    req.decoded = decoded;
    next();
  })

}

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
          const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '10d'})
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
      app.get('/product',verifyJWT, async(req,res) =>{
        console.log(req.query)
        const email = req.query.email;
        const decodedEmail = req.decoded.seller_email;

        if(email !== decodedEmail){
          return res.status(403).send({message: 'access is forbiden'})
        }

        // const query ={seller_email: seller_email};
        if (req.query.seller_email ){
          query = {
            seller_email: req.query.seller_email
           
          }
        }
        
        const cursor = productsCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      });



      //seller can delete their product now
      app.delete('/delproduct/:id', async(req, res)=>{
        const id = req.params.id;
        console.log(id)
        const query = {_id: ObjectId(id)};
        const result = await productsCollection.deleteOne(query);
        res.send(result);
      })

      //all seller route
      app.get('/seller', async(req, res) =>{
        const query = {role: 'Seller'};
        const sellerdetails = await userCollection.find(query).toArray();
        res.send(sellerdetails);
      });

      //admin can delete seller /delseller/${id}
      app.delete('/delseller/:id', async(req, res)=>{
        const id = req.params.id;
        console.log(id)
        const query = {_id: ObjectId(id)};
        const result = await userCollection.deleteOne(query);
        res.send(result);
      })

      //all buyer route
      app.get('/buyer', async(req, res) =>{
        const query = {role: 'Buyer'};
        const buyerdetails = await userCollection.find(query).toArray();
        res.send(buyerdetails);
      });


      




      //admin can delete buyer /delbuyer/${id}
      app.delete('/delbuyer/:id', async(req, res)=>{
        const id = req.params.id;
        console.log(id)
        const query = {_id: ObjectId(id)};
        const result = await userCollection.deleteOne(query);
        res.send(result);
      })


      //admin route checking
      app.get('/admin/:email', async(req, res) =>{
        const email = req.params.email;
        console.log(email)
        const query = {email}
        const user = await userCollection.findOne(query);
        res.send( { isAdmin: user?.role === 'Admin' } )

      })

      //seller route checking
      app.get('/seller/:email', async(req, res) =>{
        const email = req.params.email;
        console.log(email)
        const query = {email}
        const user = await userCollection.findOne(query);
        res.send( { isSeller: user?.role === 'Seller' } )

      })




      //buyer myorder data

      app.get('/myorder', async(req,res) =>{
        
        if (req.query.email ){
          query = {
            email: req.query.email
           
          }
        }
        
        const cursor = bookCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      });


      //buyer route checking
      app.get('/buyer/:email', async(req, res) =>{
        const email = req.params.email;
        console.log(email)
        const query = {email}
        const user = await userCollection.findOne(query);
        res.send( { isBuyer: user?.role === 'Buyer' } )

      })



      //seller verify
      app.put('/update/:id',async(req, res) => {
        const id = req.params.id;
        const filter = {_id: ObjectId(id)}
        const options = { upsert: true};
        const updateDoc = {
          $set: {
            verification: 'Verified'
          }
        }
        const result = await userCollection.updateOne(filter, updateDoc, options)
        res.send(result);
      })


      //product advertise
      app.put('/newrole/:id',async(req, res) => {
        const id = req.params.id;
        console.log( 'id',id)
        const filter = {_id: ObjectId(id)}
        const options = { upsert: true};
        const updateDoc = {
          $set: {
            role: 'Advertise'
          }
        }
        const uprole = await productsCollection.updateOne(filter, updateDoc, options)
        res.send(uprole);
      })


      app.get('/advertised', async(req, res) =>{
        const query = {role: 'Advertise'};
        const sellerdetails = await productsCollection.find(query).toArray();
        res.send(sellerdetails);
      });



      



      app.get('/verifyseller', async(req,res) =>{
        
        if (req.query.seller_email ){
          query = {
            email: req.query.seller_email
           
          }
        }
        
        const cursor = userCollection.find(query);
        const verify = await cursor.toArray();
        res.send(verify);
      });


      





    }
    finally{
  
    }
  }
  
  run().catch(error=> console.error(error))



app.get('/', async(req, res) =>{
    res.send('second hand product server is running')
})

app.listen(port, () => console.log(`second hand server is running ${port}`))