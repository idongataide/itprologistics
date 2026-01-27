import { requestClient } from '@/api/baseRequest';

export interface Outsider {
  landmark?: string;
  vehicle_model?: string;
  vehicle_colour?: string;
  vehicle_type?: string;
  number_plate?: string;
  vehicle_registration?: string;
  reason_for_towing?: string;
  vehicle_loading_status?: string;
  attachments?: any[];
  [key: string]: any;
}


export const getOutsider = async (q?: string) => {
  // Don't make the API call if q is empty
  if (!q) return null;
  
  try {
    return await requestClient
      .get(`/outsiders/?q=${q}`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};