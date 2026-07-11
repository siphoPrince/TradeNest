/**
 * server.js — Cylo Marketplace Entry Point
 *
 * Required environment variables:
 *   TRADESAFE_API_URL        (default: https://api.tradesafe.co.za/graphql)
 *   TRADESAFE_CLIENT_ID
 *   TRADESAFE_CLIENT_SECRET
 *   TRADESAFE_API_KEY
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const paymentRoutes = require('./paymentRoutes');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api', paymentRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Cylo API running on port ${PORT}`));
