
import { axiosAPIInstance } from "./interceptor";

export const sendOtp = async (data: any) => {
    try {
      return await axiosAPIInstance
        .post(`/message/send/` , data)
        .then((res) => {
          return res?.data;
        });
    } catch (error) {
      return error;
    }
 };

export const generate2fa = async () => {
    try {
      return await axiosAPIInstance
        .post(`/users/generate2fa/`)
        .then((res) => {
          return res?.data;
        });
    } catch (error) {
      return error;
    }
 };

export const confirmOtp =  async (data: any) => {
    try {
      return await axiosAPIInstance
        .post(`/message/confirm/`, data)
        .then((res) => {
          return res?.data;
        });
    } catch (error) {
      return error;
    }
 };

