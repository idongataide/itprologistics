
import { axiosAPIInstance } from "./interceptor";

export const getCustomers = async () => {
    try {
      return await axiosAPIInstance
        .get(`/users/`)
        .then((res) => {
          return res?.data;
        });
    } catch (error) {
      return error;
    }
  };

  
export const getCustomersDetails =  async (userId: string) => {
  try {
    return await axiosAPIInstance
      .get(`/users/?auth_id=${userId}`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const getCustomerCount = async () => {
    try {
        return await axiosAPIInstance
          .get(`/users?component=count-status`)
          .then((res) => {
            return res?.data;
          });
      } catch (error) {
        return error;
      }
};