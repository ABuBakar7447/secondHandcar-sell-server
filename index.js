const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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
    
      app.get('/catagory', async(req, res) =>{
        const query = {};
        const catagoryitem = await catagoryCollection.find(query).toArray();
        res.send(catagoryitem);
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