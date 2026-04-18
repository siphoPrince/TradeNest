const axios = require('axios');

const TRADESAFE_AUTH_URL = 'https://auth.tradesafe.co.za/oauth/token';
const TRADESAFE_API_URL = 'https://api-developer.tradesafe.dev/graphql';

let cachedToken = null;
let tokenExpiry = null;

async function getAccessToken() {
    // Check if token exists and isn't about to expire (buffer of 60 seconds)
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    try {
        console.log('🎟️ Fetching Fresh TradeSafe Access Token...');
        const credentials = Buffer.from(
            `${process.env.TRADESAFE_CLIENT_ID}:${process.env.TRADESAFE_CLIENT_SECRET}`
        ).toString('base64');

        const response = await axios({
            method: 'post',
            url: TRADESAFE_AUTH_URL,
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: 'grant_type=client_credentials'
        });

        cachedToken = response.data.access_token;
        // Set expiry (convert expires_in seconds to absolute time)
        tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;
        
        console.log('✅ New Access Token Secured.');
        return cachedToken;
    } catch (error) {
        console.error('❌ TradeSafe Auth Failed:', error.response?.data || error.message);
        throw new Error('Authentication with TradeSafe failed.');
    }
}

async function graphqlRequest(query, variables = {}) {
    const token = await getAccessToken();
    try {
        const response = await axios({
            method: 'post',
            url: TRADESAFE_API_URL,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: { query, variables }
        });

        if (response.data.errors) {
            throw new Error(response.data.errors[0].message);
        }
        return response.data.data;
    } catch (error) {
        if (error.response?.status === 401) {
            cachedToken = null; // Clear if rejected
            return graphqlRequest(query, variables);
        }
        throw error;
    }
}

async function createUserToken(user) {
    const mutation = `
        mutation tokenCreate($input: TokenInput!) {
            tokenCreate(input: $input) { id name }
        }
    `;
    const variables = {
        input: {
            user: {
                givenName: user.firstName,
                familyName: user.lastName,
                email: user.email,
                mobile: user.mobile
            }
        }
    };
    const data = await graphqlRequest(mutation, variables);
    return data.tokenCreate.id;
}

async function createTransaction({ buyerTokenId, sellerTokenId, amount, itemDescription }) {
    const mutation = `
        mutation transactionCreate($input: CreateTransactionInput!) {
            transactionCreate(input: $input) { id title }
        }
    `;

    const variables = {
        input: {
            title: itemDescription,
            industry: "GENERAL_GOODS_SERVICES",
            currency: "ZAR",
            feeAllocation: "BUYER",
            settings: {
                // For Cylo, we ensure the user comes back to the app/web
                redirectUrl: process.env.CYLO_SUCCESS_URL || "http://localhost:3000/success",
                backUrl: process.env.CYLO_CANCEL_URL || "http://localhost:3000/marketplace"
            },
            allocations: {
                create: [{
                    title: itemDescription,
                    value: parseFloat(amount),
                    daysToDeliver: 7,
                    daysToInspect: 3
                }]
            },
            parties: {
                create: [
                    { token: buyerTokenId, role: "BUYER" },
                    { token: sellerTokenId, role: "SELLER" }
                ]
            }
        }
    };

    const data = await graphqlRequest(mutation, variables);
    
    // Constructing the redirect URL for the buyer to pay
    return {
        transactionId: data.transactionCreate.id,
        paymentUrl: `https://checkout.tradesafe.dev/checkout/${data.transactionCreate.id}`
    };
}

module.exports = { createUserToken, createTransaction };