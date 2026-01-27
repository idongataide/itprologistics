import axios from 'axios';
import { paymentAPIInstance } from './baseRequest';


const authTokens = localStorage.getItem("adminToken")
  ? JSON.parse(localStorage.getItem("adminToken")!)
  : null;

const walletAPIInstance = axios.create({
  baseURL: import.meta.env.VITE_WALLET_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(authTokens?.access && { 'Authorization': `Bearer ${authTokens.access}` }),
  },
});

export const TransactionList = async () => {
    try {
      return await walletAPIInstance
        .get(`/payments/get-transactions`)
        .then((res) => {
          return res?.data;
        });
    } catch (error) {
      return error;
    }
};



export const getTransactionCount = async (operatorCount: string) => {
  try {
    return await walletAPIInstance
      .get(`/payments/get-transactions?component=${operatorCount}`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};



export interface CompletePaymentPayload {
  towing_id: number | string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
}


export const startPayment = async (payload: CompletePaymentPayload) => {
  try {
    return await paymentAPIInstance
      .post(`/lastma/tow-payment`, payload)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const completePayment = async (transaction_id: string) => {
  try {
    return await paymentAPIInstance
      .put(`/lastma/tow-payment`, { transaction_id }) // Send as object in body
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};