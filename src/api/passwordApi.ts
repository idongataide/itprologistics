const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const updatePassword = async ({ old_password, new_password }: { old_password: string; new_password: string }) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/user/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ old_password, new_password }),
    });
    const data = await response.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update password' };
  }
};

export default {
  updatePassword,
};
