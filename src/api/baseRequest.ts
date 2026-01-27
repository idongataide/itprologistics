import axios from "axios";
// const URL = import.meta.env.VITE_APP_ENDPOINT;

export const requestClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/admins',
});

export const paymentAPIInstance = axios.create({
  baseURL: import.meta.env.VITE_WALLET_API_BASE_URL,
});


export const withAuthHeadersHOC =
  <T>(
    fn: (
      config: { headers: { Authorization: string } },
      ...args: unknown[]
    ) => Promise<T>,
  ) =>
  (accessToken: string, ...args: unknown[]): Promise<T> =>
    fn({ headers: { Authorization: `Bearer ${accessToken}` } }, ...args);
