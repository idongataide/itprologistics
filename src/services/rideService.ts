// services/rideService.ts

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface RideRequest {
  pickupLocation: string;
  pickupLat: number;
  pickupLng: number;
  destination: string;
  destLat: number;
  destLng: number;
  rideType: 'bicycle' | 'motorcycle' | 'car';
  instructions?: string;
  paymentMethod: 'cash' | 'online';
  phoneNumber: string;
  riderPreference?: 'any' | 'male' | 'female';
}

export interface RideEstimate {
  distance: number;
  duration: number;
  minDuration: number;
  maxDuration: number;
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  serviceFee: number;
  totalFare: number;
  currency: string;
  rideType: 'bicycle' | 'motorcycle' | 'car';
  perKmRate: number;
  baseRate: number;
}

export interface Ride {
  notes: any;
  duration: number;
  _id: string;
  userId: string | { fullname: string; phone: string };
  driverId?: string;
  status: 'pending' | 'searching' | 'awaiting_driver_confirmation' | 'accepted' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  pickupLocation: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  destination: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  rideType: 'bicycle' | 'motorcycle' | 'car';
  distance: number;
  estimatedDuration: number;
  baseFare: number;
  distanceFare: number;
  serviceFee: number;
  totalFare: number;
  paymentMethod: 'cash' | 'online';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  instructions?: string;
  riderRating?: number;
  driverRating?: number;
  feedback?: {
    rider?: string;
    driver?: string;
  };
  acceptedAt?: Date;
  arrivedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  driver?: {
    _id: string;
    name: string;
    phone: string;
    vehicle: {
      make: string;
      model: string;
      licensePlate: string;
      color: string;
    };
    rating: number;
    totalTrips: number;
  };
}

export interface RideResponse {
  success: boolean;
  message: string;
  ride?: Ride;
  rides?: Ride[];
  estimate?: RideEstimate;
}

// Pricing configuration in Naira (₦)
const PRICING_CONFIG = {
  bicycle: {
    baseFare: 200,       // ₦200 base fare
    perKm: 50,           // ₦50 per km
    perMinute: 10,       // ₦10 per minute
    serviceFeePercent: 5,
    capacity: 1,
    icon: '🚲',
    name: 'Bicycle',
    color: '#22C55E',
    estimatedWait: '1-3 min'
  },
  motorcycle: {
    baseFare: 300,       // ₦300 base fare
    perKm: 100,          // ₦100 per km
    perMinute: 15,       // ₦15 per minute
    serviceFeePercent: 8,
    capacity: 2,
    icon: '🏍️',
    name: 'Motorcycle',
    color: '#F97316',
    estimatedWait: '2-4 min'
  },
  car: {
    baseFare: 500,       // ₦500 base fare
    perKm: 150,          // ₦150 per km
    perMinute: 20,       // ₦20 per minute
    serviceFeePercent: 10,
    capacity: 4,
    icon: '🚗',
    name: 'Car',
    color: '#3B82F6',
    estimatedWait: '3-5 min'
  }
};

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Get ride estimate
export const getRideEstimate = async (rideData: {
  pickupLat: number;
  pickupLng: number;
  destLat: number;
  destLng: number;
  rideType: 'bicycle' | 'motorcycle' | 'car';
}): Promise<RideResponse> => {
  try {
    const response = await fetch(`${API_URL}/rides/estimate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(rideData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get ride estimate');
    }

    return data;
  } catch (error: any) {
    console.error('Error getting ride estimate:', error);
    throw new Error(error.message || 'Failed to get ride estimate');
  }
};

// Create a new ride
export const createRide = async (rideData: RideRequest): Promise<RideResponse> => {
  try {
    const response = await fetch(`${API_URL}/rides/order`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(rideData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create ride');
    }

    return data;
  } catch (error: any) {
    console.error('Error creating ride:', error);
    throw new Error(error.message || 'Failed to create ride');
  }
};

// Get user's rides
export const getUserRides = async (): Promise<RideResponse> => {
  try {
    const response = await fetch(`${API_URL}/rides/my-rides`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch rides');
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching rides:', error);
    throw new Error(error.message || 'Failed to fetch rides');
  }
};

// Get ride by ID
export const getRideById = async (id: string): Promise<RideResponse> => {
  try {
    const response = await fetch(`${API_URL}/rides/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch ride');
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching ride:', error);
    throw new Error(error.message || 'Failed to fetch ride');
  }
};

// Get driver's assigned rides
export const getDriverRides = async (): Promise<RideResponse> => {
  try {
    const response = await fetch(`${API_URL}/rides/driver/my-rides`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch driver rides');
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching driver rides:', error);
    throw new Error(error.message || 'Failed to fetch driver rides');
  }
};

// Cancel a ride
export const cancelRide = async (id: string): Promise<RideResponse> => {
  try {
    const response = await fetch(`${API_URL}/rides/${id}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to cancel ride');
    }

    return data;
  } catch (error: any) {
    console.error('Error cancelling ride:', error);
    throw new Error(error.message || 'Failed to cancel ride');
  }
};

// Rate a ride
export const rateRide = async (id: string, rating: number, feedback?: string): Promise<RideResponse> => {
  try {
    const response = await fetch(`${API_URL}/rides/${id}/rate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating, feedback }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to rate ride');
    }

    return data;
  } catch (error: any) {
    console.error('Error rating ride:', error);
    throw new Error(error.message || 'Failed to rate ride');
  }
};

// Get active ride
export const getActiveRide = async (): Promise<RideResponse> => {
  try {
    const response = await fetch(`${API_URL}/rides/active`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch active ride');
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching active ride:', error);
    throw new Error(error.message || 'Failed to fetch active ride');
  }
};

// Accept a ride (driver)
export const acceptRide = async (rideId: string): Promise<RideResponse> => {
  try {
    const response = await fetch(`${API_URL}/rides/${rideId}/accept`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to accept ride');
    }

    return data;
  } catch (error: any) {
    console.error('Error accepting ride:', error);
    throw new Error(error.message || 'Failed to accept ride');
  }
};

// Decline a ride (driver)
export const declineRide = async (rideId: string): Promise<RideResponse> => {
  try {
    const response = await fetch(`${API_URL}/rides/${rideId}/decline`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to decline ride');
    }

    return data;
  } catch (error: any) {
    console.error('Error declining ride:', error);
    throw new Error(error.message || 'Failed to decline ride');
  }
};

// Get available drivers for a ride
export const getAvailableDrivers = async (rideId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/rides/${rideId}/available-drivers`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch available drivers');
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching available drivers:', error);
    throw new Error(error.message || 'Failed to fetch available drivers');
  }
};

// Update ride status
export const updateRideStatus = async (rideId: string, status: string): Promise<RideResponse> => {
  try {
    const response = await fetch(`${API_URL}/rides/${rideId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update ride status');
    }

    return data;
  } catch (error: any) {
    console.error('Error updating ride status:', error);
    throw new Error(error.message || 'Failed to update ride status');
  }
};

// Ride options with pricing in Naira
export const RIDE_OPTIONS = [
  { 
    type: 'bicycle', 
    name: 'Bicycle', 
    pricePerKm: PRICING_CONFIG.bicycle.perKm,
    baseFare: PRICING_CONFIG.bicycle.baseFare,
    icon: PRICING_CONFIG.bicycle.icon,
    description: 'Eco-friendly and quick for short distances',
    capacity: PRICING_CONFIG.bicycle.capacity,
    color: PRICING_CONFIG.bicycle.color,
    estimatedWait: PRICING_CONFIG.bicycle.estimatedWait,
    features: ['No fuel', 'Exercise', 'Good for short trips']
  },
  { 
    type: 'motorcycle', 
    name: 'Motorcycle', 
    pricePerKm: PRICING_CONFIG.motorcycle.perKm,
    baseFare: PRICING_CONFIG.motorcycle.baseFare,
    icon: PRICING_CONFIG.motorcycle.icon,
    description: 'Fast and efficient for urban travel',
    capacity: PRICING_CONFIG.motorcycle.capacity,
    color: PRICING_CONFIG.motorcycle.color,
    estimatedWait: PRICING_CONFIG.motorcycle.estimatedWait,
    features: ['Quick navigation', 'Economical', 'Agile in traffic']
  },
  { 
    type: 'car', 
    name: 'Car', 
    pricePerKm: PRICING_CONFIG.car.perKm,
    baseFare: PRICING_CONFIG.car.baseFare,
    icon: PRICING_CONFIG.car.icon,
    description: 'Comfortable and spacious for longer journeys',
    capacity: PRICING_CONFIG.car.capacity,
    color: PRICING_CONFIG.car.color,
    estimatedWait: PRICING_CONFIG.car.estimatedWait,
    features: ['Air conditioning', 'GPS tracking', 'Comfortable seating']
  }
];

// Format currency in Naira
export const formatCurrency = (amount: number): string => {
  return `₦${amount.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
};

// Calculate estimate locally (fallback)
export const calculateLocalEstimate = (
  distance: number,
  duration: number,
  rideType: 'bicycle' | 'motorcycle' | 'car'
): RideEstimate => {
  const config = PRICING_CONFIG[rideType];
  
  const baseFare = config.baseFare;
  const distanceFare = distance * config.perKm;
  const timeFare = duration * config.perMinute;
  
  const subtotal = baseFare + distanceFare + timeFare;
  const serviceFee = subtotal * (config.serviceFeePercent / 100);
  const totalFare = subtotal + serviceFee;

  return {
    distance,
    duration,
    minDuration: Math.max(5, duration - 5),
    maxDuration: duration + 5,
    baseFare: Math.round(baseFare),
    distanceFare: Math.round(distanceFare),
    timeFare: Math.round(timeFare),
    serviceFee: Math.round(serviceFee),
    totalFare: Math.round(totalFare),
    currency: 'NGN',
    rideType,
    perKmRate: config.perKm,
    baseRate: config.baseFare
  };
};

export default {
  getRideEstimate,
  createRide,
  getUserRides,
  getDriverRides,
  getRideById,
  cancelRide,
  rateRide,
  getActiveRide,
  getAvailableDrivers,
  updateRideStatus,
  calculateLocalEstimate,
  RIDE_OPTIONS,
  formatCurrency,
  PRICING_CONFIG
};