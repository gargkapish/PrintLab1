require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mount API Routes directly on root (or could be /api)
// The prompt requires: GET /products, POST /orders, GET /orders/:id
app.use('/', apiRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('PrintLab Backend is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
