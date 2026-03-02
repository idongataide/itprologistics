import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import Images from './images';

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  orderId?: {
    _id: string;
    status: string;
    pickupLocation: string;
    destination: string;
    tripDate: string;
  };
  driverId?: string | null;
  vehicleId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  data?: {
    orderId: string;
  };
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface NotificationsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
}

const NotificationsSidebar: React.FC<NotificationsSidebarProps> = ({
  isOpen,
  onClose,
  notifications,
}) => {
  const getNotificationDateCategory = (dateString: string) => {
    const date = dayjs(dateString);
    if (date.isToday()) {
      return 'Today';
    } else if (date.isYesterday()) {
      return 'Yesterday';
    } else {
      return 'Older';
    }
  };

  const groupedNotifications = notifications.reduce((acc, notification) => {
    const category = getNotificationDateCategory(notification.createdAt);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);

  if (!isOpen) {
    return null; // Render nothing if not open
  }

  return (
    <div className="fixed inset-0 z-[999] flex justify-end bg-[#38383880] p-5 bg-opacity-50" onClick={onClose}>
      <div className="md:w-[48%] lg:w-1/3 w-100 z-[9999] h-full bg-white rounded-xl slide-in overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="h-full bg-white rounded-xl overflow-hidden">
          <div className="flex justify-between items-center py-3 px-6 border-b border-[#D6DADD]">
            <h2 className="text-md font-semibold text-[#1C2023]">Notifications</h2>
            <button
              onClick={onClose}
              className="text-[#7D8489] bg-[#EEF0F2] cursor-pointer py-2 px-3 rounded-3xl hover:text-black"
            >
              ✕
            </button>
          </div>
          <div className='overflow-y-auto flex flex-col h-[calc(100vh-160px)] slide-in scrollbar-hide hover:scrollbar-show'>
            <div className="relative flex-1 px-4 py-6 sm:px-6 overflow-y-auto">
              {Object.keys(groupedNotifications).map(dateCategory => (
                <div key={dateCategory} className="mb-10">
                  <div className="text-sm font-semibold text-[#475467] mb-2">
                    {dateCategory} <span className='text-[#D0D5DD]'> • </span> <span className='text-[#667085] font-normal'>{dayjs(groupedNotifications[dateCategory][0].createdAt).format('ddd, DD-MM-YYYY')}</span>
                  </div>
                  <ul role="list" className="-my-6 mt-1">
                    {groupedNotifications[dateCategory].map(notification => (
                      <li key={notification._id} className="flex items-start py-2">
                        <div className='h-8 w-8 bg-[#FFF0EA] rounded-full p-2 flex-shrink-0'>
                          <img src={Images.icon.fav} alt="" />    
                        </div>    
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-[#475467]">{notification.title}</div>
                            <p className="mt-1 text-sm font-normal text-[#667085] break-words">{notification.message}</p>
                            
                            {/* Show order details if available */}
                            {notification.orderId && (
                              <div className="mt-2 text-xs bg-gray-50 p-2 rounded-md">
                                <div className="text-[#475467]">
                                  <span className="font-medium">Order:</span> {notification.orderId.status}
                                </div>
                                <div className="text-[#667085]">
                                  {notification.orderId.pickupLocation} → {notification.orderId.destination}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="ml-auto flex items-start text-sm capitalize text-[#667085] whitespace-nowrap flex-shrink-0">
                          {dayjs(notification.createdAt).fromNow()}
                          {!notification.isRead && (
                            <span className="ml-2 inline-block h-2 w-2 rounded-full bg-[#34B27B] flex-shrink-0"></span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center text-[#667085] py-8">No notifications yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsSidebar;