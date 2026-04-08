const axios = require('axios');

// UPDATED: Using the SIT/Developer URL from the FAQ for the API
const TRADESAFE_AUTH_URL = 'https://auth.tradesafe.co.za/oauth/token';
const TRADESAFE_API_URL = 'https://api-developer.tradesafe.dev/graphql';

let cachedToken = null;

/**
 * Handles OAuth2 Authentication using Basic Auth (Base64)
 * This is the most robust way to avoid "Method Not Allowed" or "502" errors.
 */
async function getAccessToken() {
    if (cachedToken) return cachedToken;

    try {
        console.log('🎟️ Fetching TradeSafe Access Token (Base64 Auth)...');

        // Encode credentials
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
        console.log('✅ Access Token Secured.');
        return cachedToken;
    } catch (error) {
        console.error('❌ TradeSafe Auth Failed:', error.response?.data || error.message);
        throw new Error('Authentication with TradeSafe failed.');
    }
}

/**
 * Executes GraphQL queries with the required Bearer token and JSON structure.
 */
async function graphqlRequest(query, variables = {}) {
    const token = await getAccessToken();

    try {
        const response = await axios({
            method: 'post',
            url: TRADESAFE_API_URL,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            // The structure below fixes the "Query/QueryId" missing parameter error
            data: {
                query: query,
                variables: variables
            }
        });

        if (response.data.errors) {
            console.error('❌ TradeSafe GraphQL Error:');
            console.dir(response.data.errors, { depth: null });
            throw new Error(response.data.errors[0].message);
        }

        return response.data.data;
    } catch (error) {
        // If the token expired mid-session, clear and retry once
        if (error.response?.status === 401) {
            console.log('🔄 Token expired. Retrying...');
            cachedToken = null;
            return graphqlRequest(query, variables);
        }
        console.error('❌ GraphQL Connection Failed:', error.message);
        throw error;
    }
}

/**
 * Creates a User Token (Onboarding)
 */
async function createUserToken(user) {
    const mutation = `
        mutation tokenCreate($input: TokenInput!) {
            tokenCreate(input: $input) {
                id
                name
            }
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

/**
 * Creates an Escrow Transaction
 */
async function createTransaction({ buyerTokenId, sellerTokenId, amount, itemDescription, successUrl, cancelUrl }) {
    const mutation = `
        mutation transactionCreate($input: CreateTransactionInput!) {
            transactionCreate(input: $input) {
                id
                title
            }
        }
    `;

    const variables = {
        input: {
            title: itemDescription,
            description: "Cylo Marketplace Transaction",
            industry: "GENERAL_GOODS_SERVICES",
            currency: "ZAR",
            feeAllocation: "BUYER",
            // ADD THESE REDIRECTS HERE
            settings: {
                redirectUrl: successUrl || "http://localhost:3000/payment-success",
                backUrl: cancelUrl || "http://localhost:3000/"
            },
            allocations: {
                create: [
                    {
                        title: itemDescription,
                        description: "Item Purchase",
                        value: parseFloat(amount),
                        daysToDeliver: 7,
                        daysToInspect: 3
                    }
                ]
            },
            parties: {
                create: [
                    {
                        token: buyerTokenId,
                        role: "BUYER"
                    },
                    {
                        token: sellerTokenId,
                        role: "SELLER"
                    }
                ]
            }
        }
    };

    const data = await graphqlRequest(mutation, variables);

    return {
        transactionId: data.transactionCreate.id,
        // This ensures the user goes to the CHECKOUT flow, not the FICA flow
        paymentUrl: `${process.env.TRADESAFE_CHECKOUT_BASE_URL}/${data.transactionCreate.id}`
    };
}

module.exports = { 
    createUserToken, 
    createTransaction 
};