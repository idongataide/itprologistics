export interface BookingRequest {
  id: string;
  bookingId: string;
  customer: string;
  vehicleModel: string;
  status: string;
  amount: string;
  dateTime: string;
  action?: string;
  towingOperator: string;
}

export const pendingRequests: BookingRequest[] = [
  {
    id: '1',
    bookingId: '45678mob142#',
    customer: 'Temi Crayton',
    vehicleModel: 'Rav4 2018',
    status: 'Pending',
    amount: '₦32,500',
    dateTime: 'Wed, 14-04-25 6:30pm',
    towingOperator: 'Pending Assignment'
  },
  {
    id: '2',
    bookingId: '45678mob142#',
    customer: 'Feranmi Akinwale',
    vehicleModel: 'Camry 2002',
    status: 'Pending',
    amount: '₦32,500',
    dateTime: 'Wed, 14-04-25 6:30pm',
    towingOperator: 'Pending Assignment'
  }
];

export const acceptedRequests: BookingRequest[] = [
  {
    id: '1',
    bookingId: '45678mob142#',
    customer: 'Kelechi Brass',
    vehicleModel: 'Mercedez GLE S',
    status: 'Accepted',
    amount: '₦37,500',
    dateTime: 'Wed, 14-04-25 6:30pm',
    towingOperator: 'Move360'
  },
  {
    id: '2',
    bookingId: '45678mob142#',
    customer: 'Kyrian Osondu',
    vehicleModel: 'Suzuki 2012',
    status: 'Accepted',
    amount: '₦27,500',
    dateTime: 'Wed, 14-04-25 6:30pm',
    towingOperator: 'Beba Adugbo Towing & Co'
  }
];

export const ongoingRequests: BookingRequest[] = [
  {
    id: '1',
    bookingId: '45678mob142#',
    customer: 'Temi Crayton',
    vehicleModel: 'Rav4 2018',
    status: 'Ongoing',
    amount: '₦32,500',
    dateTime: 'Wed, 14-04-25 6:30pm',
    towingOperator: 'Beba Adugbo Towing & Co'
  },
  {
    id: '2',
    bookingId: '45678mob142#',
    customer: 'Feranmi Akinwale',
    vehicleModel: 'Camry 2002',
    status: 'Ongoing',
    amount: '₦32,500',
    dateTime: 'Wed, 14-04-25 6:30pm',
    towingOperator: 'Uptown towing limited'
  }
];

export const completedRequests: BookingRequest[] = [
  {
    id: '1',
    bookingId: '45678mob142#',
    customer: 'Temi Crayton',
    vehicleModel: 'Rav4 2018',
    status: 'Completed',
    amount: '₦32,500',
    dateTime: 'Wed, 14-04-25 6:30pm',
    towingOperator: 'Move360'
  },
  {
    id: '2',
    bookingId: '45678mob142#',
    customer: 'Feranmi Akinwale',
    vehicleModel: 'Camry 2002',
    status: 'Completed',
    amount: '₦32,500',
    dateTime: 'Wed, 14-04-25 6:30pm',
    towingOperator: 'Uptown towing limited'
  }
];

export const rejectedRequests: BookingRequest[] = [
  {
    id: '1',
    bookingId: '45678mob142#',
    customer: 'Kelechi Brass',
    vehicleModel: 'Mercedez GLE S',
    status: 'Rejected',
    amount: '₦37,500',
    dateTime: 'Wed, 14-04-25 6:30pm',
    towingOperator: 'N/A'
  },
  {
    id: '2',
    bookingId: '45678mob142#',
    customer: 'Kyrian Osondu',
    vehicleModel: 'Suzuki 2012',
    status: 'Rejected',
    amount: '₦27,500',
    dateTime: 'Wed, 14-04-25 6:30pm',
    towingOperator: 'N/A'
  }
];

export type BookingStatus = 'pending' | 'accepted' | 'ongoing' | 'completed' | 'rejected';

export const getBookingsByStatus = (status: BookingStatus): BookingRequest[] => {
  switch (status) {
    case 'pending':
      return pendingRequests;
    case 'accepted':
      return acceptedRequests;
    case 'ongoing':
      return ongoingRequests;
    case 'completed':
      return completedRequests;
    case 'rejected':
      return rejectedRequests;
    default:
      return [];
  }
}; 