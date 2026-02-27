// src/services/charterVehicleService.ts

import { API_URL } from "./config/api";

export interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  vehicleType: string;
  capacity: number;
  thumbnail?: string;
  status: string;
  features?: string[];
  fuelType?: string;
}

export interface VehicleResponse {
  success: boolean;
  message: string;
  availableVehicles?: Vehicle[];
  vehicle?: Vehicle;
  vehicles?: Vehicle[];
}

export interface AvailabilityResponse {
  success: boolean;
  message: string;
  available: boolean;
}

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Get all available charter vehicles
export const getAvailableCharterVehicles = async (): Promise<VehicleResponse> => {
  try {
    const response = await fetch(`${API_URL}/charter/vehicles/available`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data: VehicleResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch available vehicles');
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching available charter vehicles:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch available vehicles',
      availableVehicles: [],
    };
  }
};

// Get charter vehicles filtered by type
export const getCharterVehiclesByType = async (vehicleType: string): Promise<VehicleResponse> => {
  try {
    const response = await fetch(`${API_URL}/charter/vehicles/type/${vehicleType}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data: VehicleResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Failed to fetch ${vehicleType} vehicles`);
    }

    return data;
  } catch (error: any) {
    console.error(`Error fetching ${vehicleType} vehicles:`, error);
    return {
      success: false,
      message: error.message || `Failed to fetch ${vehicleType} vehicles`,
      vehicles: [],
    };
  }
};

// Get charter vehicles filtered by capacity
export const getCharterVehiclesByCapacity = async (capacity: number): Promise<VehicleResponse> => {
  try {
    const response = await fetch(`${API_URL}/charter/vehicles/capacity/${capacity}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data: VehicleResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch vehicles');
    }

    return data;
  } catch (error: any) {
    console.error(`Error fetching vehicles with capacity ${capacity}:`, error);
    return {
      success: false,
      message: error.message || 'Failed to fetch vehicles',
      vehicles: [],
    };
  }
};

// Get a specific charter vehicle by ID
export const getCharterVehicleById = async (vehicleId: string): Promise<VehicleResponse> => {
  try {
    const response = await fetch(`${API_URL}/charter/vehicles/${vehicleId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data: VehicleResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch vehicle');
    }

    return data;
  } catch (error: any) {
    console.error(`Error fetching vehicle ${vehicleId}:`, error);
    return {
      success: false,
      message: error.message || 'Failed to fetch vehicle',
    };
  }
};

// Check vehicle availability for a specific date and time
export const checkVehicleAvailability = async (
  vehicleId: string,
  date: string,
  time: string
): Promise<AvailabilityResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/charter/vehicles/${vehicleId}/availability?date=${date}&time=${time}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const data: AvailabilityResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to check availability');
    }

    return data;
  } catch (error: any) {
    console.error('Error checking vehicle availability:', error);
    return {
      success: false,
      available: false,
      message: error.message || 'Failed to check availability',
    };
  }
};

// Get vehicles with specific features
export const getCharterVehiclesByFeatures = async (features: string[]): Promise<VehicleResponse> => {
  try {
    const response = await fetch(`${API_URL}/charter/vehicles/filter`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ features }),
    });

    const data: VehicleResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch vehicles');
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching vehicles by features:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch vehicles',
      vehicles: [],
    };
  }
};

const charterVehicleService = {
  getAvailableCharterVehicles,
  getCharterVehiclesByType,
  getCharterVehiclesByCapacity,
  getCharterVehicleById,
  checkVehicleAvailability,
  getCharterVehiclesByFeatures,
};

export default charterVehicleService;
