import { axiosAPIInstance } from "./interceptor";

export const getBanksList = async () => {
    try {
      return await axiosAPIInstance
        .get(`/settings/bank-lists`)
        .then((res) => {
          return res?.data;
        });
    } catch (error) {
      return error;
    }
 };

export const verifyAccount = async (data: any) => {
    try {
      return await axiosAPIInstance
        .post(`/settings/bank-lists`, data)
        .then((res) => {
          return res?.data;
        });
    } catch (error) {
      return error;
    }
 };