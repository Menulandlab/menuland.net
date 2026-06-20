import axios from 'axios';
import { cookies } from 'next/headers';

const BASE_URL = 'https://api.service.menuland.net';

/**
 * Sadece Server Component veya Server Action'larda güvenli bir şekilde
 * private API çağrısı yapabilmek için helper.
 */
export async function getWebPrivateClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;

  const client = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  return client;
}
