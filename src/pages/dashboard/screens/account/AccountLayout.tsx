import React from 'react';
import {Toaster} from 'react-hot-toast';
import { Link, Outlet, useLocation } from 'react-router-dom';

const AccountLayout: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { name: 'Personal details', path: '/account' }, 
    { name: 'Change Password', path: '/account/change-password' },
    { name: 'Support', path: '/account/support' },
    { name: 'Delete Account', path: '/account/delete-account' },
  ];

  return (
    <div className="mt-5 px-4 md:px-10">
      <Toaster />
      <h2 className="text-lg font-semibold mb-4">Account</h2>
      <div className="flex flex-col md:flex-row bg-white min-h-[80vh]">        
        <div className="w-full md:w-64 md:border-r border-gray-200 p-2 md:p-4">
          <nav className="bg-white">
            <ul className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible mb-3">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <li key={link.path} className="">
                    <Link
                      to={link.path}
                      className={`inline-block md:block py-2 md:py-3 px-3 md:px-3 text-sm font-medium rounded-md whitespace-nowrap ${isActive ? 'bg-[#FFF0EA] text-[#E86229] md:border-r-4 md:border-[#FF8957] border-[#FF8957]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                      
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="flex-1 md:p-4 p-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AccountLayout; 