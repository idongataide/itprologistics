import { API_URL } from "./config/api";


export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender?: 'male' | 'female' | 'other';
}

// Get current user's profile
export const getUserProfile = async (): Promise<{ success: boolean; data?: UserProfile; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to fetch profile' };
  }
};

// Update current user's profile
export const updateUserProfile = async (
  values: Partial<UserProfile>
): Promise<{ success: boolean; data?: UserProfile; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update profile' };
  }
};


// services/userService.ts
export const changePassword = async (data: {
  old_password: string;  // Changed from currentPassword
  new_password: string;  // Changed from newPassword
}) => {
  try {
    const response = await fetch(`${API_URL}/user/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  changePassword,
};
