const express = require('express');
const router = express.Router();
const tradeSafe = require('./tradeSafeService');

const testSuffix = Math.floor(Math.random() * 10000);

// ─── MOCK DATABASE ───
const mockUsers = {
  "user_1": {
    id: "user_1",
    firstName: "John",
    lastName: "Buyer",
    email: `buyer_${testSuffix}@cylo.co.za`,
    mobile: "+27821112222",
    tradeSafeId: null 
  },
  "user_2": {
    id: "user_2",
    firstName: "Sarah",
    lastName: "Seller",
    email: `seller_${testSuffix}@cylo.co.za`,
    mobile: "+27823334444",
    tradeSafeId: null
  }
};

const mockTransactions = [];

// ─── UPDATED HELPERS ───
async function findUserById(userId) {
  return mockUsers[userId] || null;
}

async function updateUserTradeSafeId(userId, tradeSafeId) {
  if (mockUsers[userId]) {
    mockUsers[userId].tradeSafeId = tradeSafeId;
    console.log(`[MOCK DB] User ${userId} updated with TradeSafeID: ${tradeSafeId}`);
  }
}

async function saveTransaction(txData) {
  mockTransactions.push(txData);
  console.log(`[MOCK DB] Transaction saved:`, txData);
}

// ─── 1. User Onboarding ───
router.post('/onboard-user', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await findUserById(userId);

    if (!user) return res.status(404).json({ error: 'User not found in Mock DB' });
    if (user.tradeSafeId) return res.json({ tradeSafeId: user.tradeSafeId, status: 'already_onboarded' });

    console.log(`Onboarding ${user.firstName} to TradeSafe...`);
    const tradeSafeId = await tradeSafe.createUserToken(user);
    
    await updateUserTradeSafeId(userId, tradeSafeId);
    res.json({ tradeSafeId, user: mockUsers[userId] });
  } catch (error) {
    res.status(502).json({ error: error.message });
  }
});



// ─── 2. Transaction Initiation ───
router.post('/create-payment', async (req, res) => {
  try {
    const { buyerId, sellerId, amount, itemDescription } = req.body;

    const buyer = await findUserById(buyerId);
    const seller = await findUserById(sellerId);

    if (!buyer?.tradeSafeId || !seller?.tradeSafeId) {
      return res.status(400).json({ error: 'Ensure both users are onboarded first!' });
    }

    const result = await tradeSafe.createTransaction({
      buyerTokenId: buyer.tradeSafeId,
      sellerTokenId: seller.tradeSafeId,
      amount,
      itemDescription,
    });

    await saveTransaction({ ...result, buyerId, sellerId, amount });
    res.json(result);
  } catch (error) {
    res.status(502).json({ error: error.message });
  }
});

module.exports = router;