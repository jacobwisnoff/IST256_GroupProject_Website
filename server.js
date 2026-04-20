const express = require('express');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
app.use(bodyParser.json());

const port = 3001;
const ipAddress = '130.203.136.203';

const options = {
  key: fs.readFileSync('/data/ist256-2026.key'),
  cert: fs.readFileSync('/data/ist256-2026.cert')
};

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const uri = 'mongodb://team1:team1@localhost:27017';
const client = new MongoClient(uri);

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToMongoDB();

app.use('/assets', express.static('public/assets'));

app.get('/', (req, res) => {
  res.status(200).send('Secure HTTPS');
  console.log('Sending a response');
});

app.get('/hello', (req, res) => {
  res.send('Secure HTTPS');
});

app.post('/api/order', async (req, res) => {
  const orderData = req.body;
  console.log('Received order data:', JSON.stringify(orderData, null, 2));

  try {
    const database = client.db('team1DB');
    const collection = database.collection('orders');

    const result = await collection.insertOne(orderData);
    console.log('Order saved to MongoDB with ID:', result.insertedId);

    res.status(200).json({
      message: 'Order received and saved to MongoDB',
      orderId: result.insertedId
    });
  } catch (error) {
    console.error('Error saving order to MongoDB:', error);
    res.status(500).json({ message: 'Failed to save order to MongoDB' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const database = client.db('team1DB');
    const collection = database.collection('orders');

    const orders = await collection.find().toArray();

    console.log('Orders fetched from MongoDB:', orders);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const database = client.db('team1DB');
    const collection = database.collection('products');

    const products = await collection.find().toArray();

    console.log('Products fetched from MongoDB:', products);
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  const productData = req.body;
  console.log('Received product data:', JSON.stringify(productData, null, 2));

  try {
    const database = client.db('team1DB');
    const collection = database.collection('products');

    const result = await collection.insertOne(productData);
    console.log('Product saved to MongoDB with ID:', result.insertedId);

    res.status(200).json({
      message: 'Product saved to MongoDB',
      productId: result.insertedId
    });
  } catch (error) {
    console.error('Error saving product to MongoDB:', error);
    res.status(500).json({ message: 'Failed to save product to MongoDB' });
  }
});

app.post('/api/shopper', async (req, res) => {
  const shopperData = req.body;
  console.log('Received shopper data:', JSON.stringify(shopperData, null, 2));

  try {
    const database = client.db('team1DB');
    const collection = database.collection('shoppers');

    const result = await collection.insertOne(shopperData);
    console.log('Shopper data saved to MongoDB with ID:', result.insertedId);

    res.status(200).json({
      message: 'Shopper registered and saved to MongoDB',
      shopperId: result.insertedId
    });
  } catch (error) {
    console.error('Error saving shopper to MongoDB:', error);
    res.status(500).json({ message: 'Failed to save shopper to MongoDB' });
  }
});

app.post('/api/cart', async (req, res) => {
  const cartData = req.body;
  console.log('Received shopping cart data:', JSON.stringify(cartData, null, 2));

  try {
    const database = client.db('team1DB');
    const collection = database.collection('shoppingCart');

    const result = await collection.insertOne(cartData);
    console.log('Shopping cart saved to MongoDB with ID:', result.insertedId);

    res.status(200).json({
      message: 'Shopping cart saved to MongoDB',
      cartId: result.insertedId
    });
  } catch (error) {
    console.error('Error saving shopping cart to MongoDB:', error);
    res.status(500).json({ message: 'Failed to save shopping cart to MongoDB' });
  }
});

app.post('/api/return', async (req, res) => {
  const returnData = req.body;
  console.log('Received return order data:', JSON.stringify(returnData, null, 2));

  try {
    const database = client.db('team1DB');
    const returnsCollection = database.collection('returns');
    const ordersCollection = database.collection('orders');

    const result = await returnsCollection.insertOne(returnData);
    console.log('Return order saved to MongoDB with ID:', result.insertedId);

    if (returnData.orderDbId && returnData.itemId !== undefined && returnData.itemId !== null) {
      const { ObjectId } = require('mongodb');
      const orderObjectId = new ObjectId(returnData.orderDbId);

      const orderUpdateResult = await ordersCollection.updateOne(
        { _id: orderObjectId },
        { $pull: { items: { id: returnData.itemId } } }
      );

      if (orderUpdateResult.matchedCount > 0) {
        const updatedOrder = await ordersCollection.findOne({ _id: orderObjectId });
        if (updatedOrder && Array.isArray(updatedOrder.items) && updatedOrder.items.length === 0) {
          await ordersCollection.deleteOne({ _id: orderObjectId });
          console.log('Removed empty order document after return');
        } else {
          console.log('Removed returned item from order document');
        }
      }
    }

    res.status(200).json({
      message: 'Return order received and saved to MongoDB',
      returnId: result.insertedId
    });
  } catch (error) {
    console.error('Error saving return order to MongoDB:', error);
    res.status(500).json({ message: 'Failed to save return order to MongoDB' });
  }
});

const server = https.createServer(options, app);

try {
  server.listen(port, () => {
    console.log(`Secure server is running on ${ipAddress}:${port}`);
  });
} catch (error) {
  console.error('Error starting server:', error);
}
