if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const cors = require('cors');
const errorHandler = require('./errors/errorHandler');
const { redisClient } = require('./infrastructure/redis');
const { mongooseClient } = require('./infrastructure/mongo');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

app.post(
    '/api/v1/payments/stripe/webhook',
    express.raw({ type: 'application/json' }),
    require('./controllers/paymentController').stripeWebhook
);

app.use(express.json());

// Health check route
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running healthy' });
});

// routes
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/auth', require('./routes/auth'));

app.use('/api/v1/categories', require('./routes/category'));
app.use('/api/v1/cart', require('./routes/cart'));
app.use('/api/v1/products', require('./routes/products'));

app.use('/api/v1/orders', require('./routes/orders'));
app.use('/api/v1/payments', require('./routes/payment'));

app.use('/api/v1/refunds', require('./routes/refunds'));

app.use('/api/v1/stats', require('./routes/stats'));


// Middleware JSON thông thường cho các route khác



app.use(errorHandler);

(async () => {
    await redisClient();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})();
