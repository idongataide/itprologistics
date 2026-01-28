// src/services/admin/userService.ts

import { API_URL } from "../config/api";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'rider' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  profileImage?: string | null;
}

export interface UserResponse {
  success: boolean;
  users: User[];
  count: number;
  message?: string;
}

export interface SingleUserResponse {
  success: boolean;
  user: User;
  message?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'rider' | 'admin';
  status?: 'active' | 'inactive' | 'suspended';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'user' | 'rider' | 'admin';
  status?: 'active' | 'inactive' | 'suspended';
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token ? 'Exists' : 'Missing');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Get all users
const getUsers = async (): Promise<UserResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Session expired. Please login again');
      }
      if (response.status === 403) {
        throw new Error('Access denied. Admin only');
      }
      throw new Error(data.message || 'Failed to fetch users');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error fetching users:', error);
    throw new Error(error.message || 'Failed to fetch users');
  }
};

// Get single user by ID
const getUserById = async (id: string): Promise<SingleUserResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error fetching user:', error);
    throw new Error(error.message || 'Failed to fetch user');
  }
};

// Create new user
const createUser = async (userData: CreateUserData): Promise<SingleUserResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        fullname: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        role: userData.role,
        isActive: userData.status === 'active'
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create user');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error creating user:', error);
    throw new Error(error.message || 'Failed to create user');
  }
};

// Update user
const updateUser = async (id: string, userData: UpdateUserData): Promise<SingleUserResponse> => {
  try {
    console.log('Updating user:', id, userData);
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    console.log('Update response status:', response.status);
    
    const data = await response.json();
    console.log('Update response data:', data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error updating user:', error);
    throw new Error(error.message || 'Failed to update user');
  }
};

// Delete user
const deleteUser = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete user');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error deleting user:', error);
    throw new Error(error.message || 'Failed to delete user');
  }
};

// Update user status
const updateUserStatus = async (id: string, status: 'active' | 'inactive'): Promise<SingleUserResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user status');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error updating user status:', error);
    throw new Error(error.message || 'Failed to update user status');
  }
};

// Export all functions
const userService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
};

export default userService;