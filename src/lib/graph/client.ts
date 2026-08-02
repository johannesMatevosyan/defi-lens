// src/lib/graph/client.ts
import { Client, cacheExchange, fetchExchange } from 'urql';

// Points at OUR OWN Route Handler, not The Graph directly —
// keeps the API key server-side.
export const graphClient = new Client({
    url: '/api/graph/swaps',
    exchanges: [cacheExchange, fetchExchange],
});
