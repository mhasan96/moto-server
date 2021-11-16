const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//DB Connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tztyd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// console.log(uri);
app.get("/", (req, res) => {
  res.send("Hello from Moto World!");
});

async function run() {
  try {
    await client.connect();
    // console.log("connected to DB");
    const database = client.db("moto_portal");
    const servicesCollection = database.collection("services");
    // const ordersCollection = database.collection("orders");
    const ordersCollection = database.collection("order");
    const reviewsCollection = database.collection("reviews");
    const usersCollection = database.collection("users");
    //Get All Data
    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });
    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    app.get("/order", async (req, res) => {
      // const query = req.query;
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });

    //Get single Service
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.json(service);
    });
    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await ordersCollection.findOne(query);
      res.json(service);
    });

    app.post("/services", async (req, res) => {
      const service = req.body;
      // service.createdAt = new Date();
      console.log("hit the post api", service);
      const result = await servicesCollection.insertOne(service);
      console.log(result);
      res.json(result);
    });
    app.post("/reviews", async (req, res) => {
      const reviews = req.body;
      // service.createdAt = new Date();
      console.log("hit the post api", reviews);
      const result = await reviewsCollection.insertOne(reviews);
      console.log(result);
      res.json(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const option = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, option);
      res.json(result);
    });
    app.put("/users/admin", async (req, res) => {
      const user = req.body;

      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    // app.put("/order/:id", async (req, res) => {
    //   const user = req.body;

    //   const filter = { email: user.email };
    //   const updateDoc = { $set: { status: "Shipped" } };
    //   const result = await orderCollection.updateOne(filter, updateDoc);
    //   res.json(result);
    // });

    // get Orders API
    app.get("/order", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = ordersCollection.find(query);
      const orders = await cursor.toArray();
      res.json(orders);
    });

    //Get all the users orders

    app.post("/order", async (req, res) => {
      const order = req.body;
      // order.createdAt = new Date();
      const result = await ordersCollection.insertOne(order);
      res.json(result);
    });

    // Delete Api

    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);
      res.json(result);
    });
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // await client.close()
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Car Moto is Running");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
