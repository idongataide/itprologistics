import InfoRow from './InfoRow';
import { useState } from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

interface BookingInfoProps {
  booking: any;
  showCancellationDetails?: boolean;
}

const BookingInfo: React.FC<BookingInfoProps> = ({ booking, showCancellationDetails = false }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? (booking.url.length - 1) : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => 
      prev === booking.url.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <>
      {/* Image Section */}
      {booking?.url && booking.url.length > 0 && (
        <div className="mb-3 p-4 border border-[#E5E9F0] rounded-lg">
          <div className="text-sm text-[#475467] space-y-3">
            <div className="flex flex-col items-center">
              <div className="w-[100%] mb-2">
                <p className="font-normal text-[#667085]">Booking Image</p>
              </div>             
              <div className="w-[100%] relative">
                <a 
                  href={booking.url[currentImageIndex]} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block cursor-pointer"
                >
                  <img 
                    src={booking.url[currentImageIndex]} 
                    alt="Booking" 
                    className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity"
                  />
                </a>
                {booking.url.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevious}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full hover:bg-white"
                    >
                      <IoChevronBack className="w-5 h-5 text-gray-600" />
                    </button>
                    <button 
                      onClick={handleNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full hover:bg-white"
                    >
                      <IoChevronForward className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {booking.url.map((_: string, index: number) => (
                        <div 
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div> 
            </div>
          </div>
        </div>
      )}

      {/* Customer Details */}
      <div className="mb-3 p-4 border border-[#E5E9F0] rounded-lg">
        <div className="text-sm text-[#475467] space-y-3">
          <InfoRow 
            label="Customer Name"
            value={`${booking?.user_data?.first_name} ${booking?.user_data?.last_name}`}
            capitalize
          />
          <InfoRow 
            label="Email"
            value={booking?.user_data?.email}
          />
          <InfoRow 
            label="Phone number"
            value={booking?.user_data?.phone_number}
          />
        </div>
      </div>

      {/* Vehicle Details */}
      <div className="mb-3 p-4 border border-[#E5E9F0] rounded-lg">
        <div className="text-sm text-[#475467] space-y-3">
          <InfoRow 
            label="Vehicle model"
            value={booking?.vehicle_model}
            capitalize
          />
          <InfoRow 
            label="Vehicle colour"
            value={booking?.vehicle_color}
            capitalize
          />
          <InfoRow 
            label="Number plate"
            value={booking?.plate_number}
            capitalize
          />
          <InfoRow 
            label="Vehicle Reg"
            value={booking?.vehicle_reg}
            capitalize
          />
          <InfoRow 
            label="Vehicle Type"
            value={booking?.vehicle_type}
            capitalize
          />
          <InfoRow 
            label="Reason for towing"
            value={booking?.tow_reason}
            capitalize
          />
          <InfoRow 
            label="Vehicle loading status"
            value={booking?.vehicle_loaded === 1 ? 'Loaded' : 'Unloaded'}
            capitalize
          />
        </div>
      </div>

      {/* Location Details */}
      <div className="mb-3 p-4 border border-[#E5E9F0] rounded-lg">
        <div className="text-sm text-[#475467] space-y-3">
          <InfoRow 
            label="Pickups"
            value={booking?.start_address}
            capitalize
          />
          <InfoRow 
            label="Destination"
            value={booking?.end_address}
            capitalize
          />
          <InfoRow 
            label="Pickup landmark"
            value={booking?.landmark}
            capitalize
          />
        </div>
      </div>

      {/* Cancellation Details - Only shown when showCancellationDetails is true */}
      {showCancellationDetails && (
        <div className="mb-3 p-4 border border-[#E5E9F0] rounded-lg">
          <div className="text-sm text-[#475467] space-y-3">
            <InfoRow 
              label="Cancellation Reason"
              value={booking?.cancel_data?.reason}
              capitalize
            />
            <InfoRow 
              label="Cancelled By"
              value={booking?.cancel_data?.cancel_by}
              capitalize
            />
          </div>
        </div>
      )}
    </>
  );
};

export default BookingInfo; 