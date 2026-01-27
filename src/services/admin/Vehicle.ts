// vehicleService.ts

const API_URL = 'http://localhost:5000/api';

// Vehicle type definition
export interface VehicleData {
  _id?: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  vehicleType: string;
  status: 'available' | 'assigned' | 'maintenance' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VehicleResponse {
  success: boolean;
  message: string;
  vehicle?: VehicleData;
  vehicles?: VehicleData[];
}

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Create vehicle
export const createVehicle = async (vehicleData: {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  vehicleType: string;
}): Promise<VehicleResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/vehicles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(vehicleData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create vehicle');
    }

    return data;
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    throw new Error(error.message || 'Failed to create vehicle');
  }
};

// Get all vehicles
export const getVehicles = async (): Promise<VehicleResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/vehicles`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch vehicles');
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching vehicles:', error);
    throw new Error(error.message || 'Failed to fetch vehicles');
  }
};

// Get single vehicle by ID
export const getVehicleById = async (id: string): Promise<VehicleResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/vehicles/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch vehicle');
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching vehicle:', error);
    throw new Error(error.message || 'Failed to fetch vehicle');
  }
};

// Update vehicle
export const updateVehicle = async (id: string, vehicleData: Partial<VehicleData>): Promise<VehicleResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/vehicles/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(vehicleData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update vehicle');
    }

    return data;
  } catch (error: any) {
    console.error('Error updating vehicle:', error);
    throw new Error(error.message || 'Failed to update vehicle');
  }
};

// Delete vehicle
export const deleteVehicle = async (id: string): Promise<VehicleResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/vehicles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete vehicle');
    }

    return data;
  } catch (error: any) {
    console.error('Error deleting vehicle:', error);
    throw new Error(error.message || 'Failed to delete vehicle');
  }
};