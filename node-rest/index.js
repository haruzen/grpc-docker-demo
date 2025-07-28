//require('dotenv').config();
const fs = require('fs');
let envFile = ".env.local";
if (process.env.NODE_ENV === "production") {
  envFile = ".env.production";
}
if (fs.existsSync(envFile)) {
  require("dotenv").config({ path: envFile });
}


const express = require('express');
const path = require('path');
const { router } = require('./auth');
const tasksRouter = require('./routes/tasks');
const adminRouter = require('./routes/admin');  

const app = express();
app.use(express.json());

// Serve static frontend files from the main frontend folder (one level up)
app.use('/frontend', express.static(path.join(__dirname, '..', 'frontend')));

// Mount authentication API under /api/auth
app.use('/api/auth', router);

app.use('/api/tasks', tasksRouter);         // All endpoints inside tasksRouter are now under /api/tasks
app.use('/api/admin/tasks', adminRouter); // All endpoints inside adminRouter are now under /api/admin/tasks

// Health check (optional)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Redirect root to frontend app (handled by NGINX in prod, but useful in dev)
app.get('/', (req, res) => {
  res.redirect('/frontend/index.html');
});

///////////////////////////////////////


// (Optional) Global error handler for JWT
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    console.error('JWT ERROR:', err);
    return res.status(401).json({ error: err.message, details: err });
  }
  next(err);
});

//////////////////////////////////////

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`node-rest API server listening on port ${PORT}`);
});


// This is the core logic. 
// The Express server handles HTTP requests, 
// and the gRPC client sends those to the Python backend.
// require('dotenv').config();
// const express = require('express');
// const app = express();
// const jwtCheck = require("./auth");
// const connectDB = require("./db");
// const taskRoutes = require("./routes/tasks");

// app.use(express.json());
// connectDB();
// app.use("/tasks", jwtCheck, taskRoutes);

// const grpc = require('@grpc/grpc-js');
// const protoLoader = require('@grpc/proto-loader');




// // Load .proto file and package definition
// const PROTO_PATH = './proto/product.proto';
// const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
//   keepCase: true,
//   longs: String,
//   enums: String,
//   defaults: true,
//   oneofs: true,
// });
// // Loads the gRPC package namespace (in this case, product) from the proto definition.
// // Now you can call gRPC methods defined in that package.
// const productProto = grpc.loadPackageDefinition(packageDefinition).product;

// // Create gRPC client connected to the gRPC server service (by Docker name)
// const client = new productProto.ProductService('python-grpc:50051', grpc.credentials.createInsecure());

// // REST endpoint: Add a product (forwards to gRPC)
// app.post('/products', (req, res) => {
//   client.AddProduct(req.body, (err, response) => {
//     if (err) return res.status(500).send(err);
//     res.json(response);
//   });
// });

// // REST endpoint: List all products
// app.get('/products', (req, res) => {
//   client.ListProducts({}, (err, response) => {
//     if (err) return res.status(500).send(err);
//     res.json(response.products);
//   });
// });

// // Starts the Express app and listens on port 3000.
// // Logs a confirmation message to the console.
// //app.listen(3000, () => console.log("🚀 Node.js REST API running on port 3000"));

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log("Node.js REST API  running on port ${PORT}"));