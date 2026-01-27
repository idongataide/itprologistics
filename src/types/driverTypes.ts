export interface UserInfo {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
  }
  
  export interface VehicleInfo {
    _id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string;
    vehicleType: string;
    capacity: number;
    status: string;
    registrationNumber?: string;
    insuranceNumber?: string;
    insuranceExpiry?: string;
    fuelType?: string;
  }
  
  export interface DriverDetail {
    _id: string;
    userId: UserInfo;
    licenseNumber: string;
    licenseExpiry: string;
    licenseType: string;
    dateOfBirth: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
    vehicleId?: VehicleInfo;
    totalTrips: number;
    totalEarnings: number;
    driverRating: number;
    isVerified: boolean;
    verifiedAt?: string;
    verificationNotes?: string;
    status: 'pending' | 'active' | 'suspended' | 'inactive';
    documents?: {
      licenseFront: string;
      licenseBack: string;
      insurance: string;
      registration: string;
    };
    createdAt: string;
    updatedAt: string;
  }
  
  export interface DriverSummaryStats {
    totalDrivers: number;
    activeDrivers: number;
    pendingDrivers: number;
    verifiedDrivers: number;
    driversWithVehicles: number;
  }
  
  export interface CreateDriverData {
    fullname: string;
    email: string;
    phone: string;
    password: string;
    role: 'rider' | 'driver';
    licenseNumber: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  }
  
  export interface CreateVehicleData {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string;
    vehicleType: string;
    registrationNumber: string;
    capacity?: number;
  }
  
  export interface DriverInfoFormData {
    licenseNumber: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }