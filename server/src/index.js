require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running healthy' });
});

// routes
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/cart', require('./routes/cart'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});