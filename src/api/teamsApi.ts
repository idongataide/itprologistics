
import { axiosAPIInstance } from "./interceptor";

export const getTeams = async () => {
    try {
      return await axiosAPIInstance
        .get(`/accounts/admin-user`)
        .then((res) => {
          return res?.data;
        });
    } catch (error) {
      return error;
    }
 };


 export const addTeams = async (data: any) => {
    try {
      return await axiosAPIInstance
        .post(`/accounts/admin-user`, data)
        .then((res) => {
          return res?.data;
        });
    } catch (error) {
      return error;
    }
 };

 
 export const getTeamsCount = async (countStatus: string) => {
  try {
    return await axiosAPIInstance
      .get(`/accounts/admin-user?component=${countStatus}`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const deleteTeams = async (id: string) => {
  try {
    return await axiosAPIInstance
      .delete(`/accounts/admin-user/${id}`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};