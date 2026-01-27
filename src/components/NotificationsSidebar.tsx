import React, { useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import Images from './images';


dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

interface Notification {
  auth_id: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | string;
  user: 'admin' | 'user' | string;
  status: number;
  createdAt: string;
  updatedAt: string;
  notification_id: string;
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
  const [activeTab, setActiveTab] = useState<'bookings' | 'payments' | 'admin'>('bookings');

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

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'bookings') {
      return notification.type === 'booking';
    } else if (activeTab === 'payments') {
      return notification.type === 'payment';
    } else if (activeTab === 'admin') {
      return notification.user === 'admin';
    }
    return false; // Should not happen with current tabs
  });

  const groupedNotifications = filteredNotifications.reduce((acc, notification) => {
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
            <div className="px-4 py-4">
                <div className="flex space-x-4 bg-[#F2F4F7] border-b border-gray-200 p-1 rounded-lg">
                    <button
                        className={`py-2 px-4 text-sm font-normal ${activeTab === 'bookings' ? 'bg-[#fff] rounded-lg text-[#E86229]' : 'cursor-pointer text-[#667085]'}`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        Bookings ({notifications.filter(n => n.type === 'booking').length})
                    </button>
                    <button
                        className={`py-2 px-4 text-sm font-normal ${activeTab === 'payments' ? 'bg-[#fff] rounded-lg text-[#E86229]' : 'cursor-pointer text-[#667085]'}`}
                        onClick={() => setActiveTab('payments')}
                    >
                        Payments ({notifications.filter(n => n.type === 'payment').length})
                    </button>
                    <button
                        className={`py-2 px-4 text-sm font-normal ${activeTab === 'admin' ? 'bg-[#fff] rounded-lg text-[#E86229]' : 'cursor-pointer text-[#667085]'}`}
                        onClick={() => setActiveTab('admin')}
                    >
                        Admin ({notifications.filter(n => n.user === 'admin').length})
                    </button>
                </div>
                </div>
            <div className="relative flex-1 px-4 py-2 sm:px-6 overflow-y-auto">
                {Object.keys(groupedNotifications).map(dateCategory => (
                <div key={dateCategory} className="mb-10 ">
                    <div className="text-sm font-semibold text-[#475467] mb-2">
                    {dateCategory} <span className='text-[#D0D5DD]'> • </span> <span className='text-[#667085] font-normal'>  {dayjs(groupedNotifications[dateCategory][0].createdAt).format('ddd, DD-MM-YYYY')}</span>
                    </div>
                    <ul role="list" className="-my-6 mt-1 ">
                    {groupedNotifications[dateCategory].map(notification => (
                        <li key={notification.notification_id} className="flex items-center py-2">
                        <div className='h-8 w-8 bg-[#FFF0EA] rounded-full p-2'>
                            <img src={Images.icon.fav} alt="" />    
                        </div>    
                        <div className="ml-3 flex w-[60%] flex-col">
                            <div className="text-sm font-medium text-[#475467]">{notification.title}</div>
                            <p className="mt-1 text-sm font-normal text-[#667085]">{notification.message}</p>
                        </div>
                        <div className="ml-auto flex items-center text-sm capitalize text-[#667085]">
                            {dayjs(notification.createdAt).fromNow()}
                            {notification.status === 0 && (
                                <span className="ml-2 inline-block h-2 w-2 rounded-full bg-[#34B27B]"></span>
                            )}
                        </div>
                        </li>
                    ))}
                    </ul>
                </div>
                ))}
                {filteredNotifications.length === 0 && (
                    <div className="text-center text-[#667085] py-8">No notifications for this category.</div>
                )}
            </div>
          </div>
           {/* <div className="border-t border-gray-200 px-4 py-4 sm:px-6 flex justify-between items-center">
              <button className="text-sm font-medium text-gray-600 hover:text-gray-900">Mark all as read</button>
              <button className="rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">View all</button>
           </div> */}
        </div>
      </div>
    </div>
  );
};

export default NotificationsSidebar; 