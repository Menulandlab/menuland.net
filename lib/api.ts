import axios from 'axios';

const DIRECT_BASE_URL = 'https://api.service.menuland.net';

// Sunucu tarafında doğrudan API'ye git (CORS yok)
// Tarayıcı tarafında Next.js proxy üzerinden git (CORS sorunu olmaz)
const CLIENT_BASE_URL = typeof window !== 'undefined' ? '/api-proxy' : DIRECT_BASE_URL;

/**
 * Halka açık (Public) API istekleri için Axios Client
 * - Sunucu bileşenlerinde: doğrudan API
 * - İstemci bileşenlerinde: /api-proxy üzerinden (CORS koruması)
 */
export const webPublicClient = axios.create({
  baseURL: CLIENT_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Sunucu tarafı için her zaman doğrudan API
 */
export const getWebPrivateClient = (token?: string) => axios.create({
  baseURL: DIRECT_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
});
