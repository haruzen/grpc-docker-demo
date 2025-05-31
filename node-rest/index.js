// This is the core logic. 
// The Express server handles HTTP requests, 
// and the gRPC client sends those to the Python backend.
const express = require('express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const app = express();
app.use(express.json());

// Load .proto file and package definition
const PROTO_PATH = './proto/product.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
// Loads the gRPC package namespace (in this case, product) from the proto definition.
// Now you can call gRPC methods defined in that package.
const productProto = grpc.loadPackageDefinition(packageDefinition).product;

// Create gRPC client connected to the gRPC server service (by Docker name)
const client = new productProto.ProductService('python-grpc:50051', grpc.credentials.createInsecure());

// REST endpoint: Add a product (forwards to gRPC)
app.post('/products', (req, res) => {
  client.AddProduct(req.body, (err, response) => {
    if (err) return res.status(500).send(err);
    res.json(response);
  });
});

// REST endpoint: List all products
app.get('/products', (req, res) => {
  client.ListProducts({}, (err, response) => {
    if (err) return res.status(500).send(err);
    res.json(response.products);
  });
});

// Starts the Express app and listens on port 3000.
// Logs a confirmation message to the console.
app.listen(3000, () => console.log("🚀 Node.js REST API running on port 3000"));