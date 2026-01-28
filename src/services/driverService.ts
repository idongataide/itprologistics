import { API_URL } from "./config/api";

export interface DriverProfile {
  _id: string;
  fullname: string;
  email: string;
  phone: string;
  driverId: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  isVerified: boolean;
  createdAt: string;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string;
  };
}

// Get current driver's profile
export const getDriverProfile = async (): Promise<{ success: boolean; data?: DriverProfile; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/driver/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to fetch driver profile' };
  }
};


export default {
  getDriverProfile,
};
