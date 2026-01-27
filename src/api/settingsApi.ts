import { axiosAPIInstance } from "./interceptor";

export const getServices = async (type: any) => {
    try {
      return await axiosAPIInstance 
        .get(`/settings/services${type}`)
        .then((res) => {
          return res?.data;
        });
    } catch (error)  {
      return error;
    }
 };

 
export const getFees = async () => {
  try {
    return await axiosAPIInstance
      .get(`settings/fees`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const getProfile = async () => {
  try {
    return await axiosAPIInstance
      .get(`accounts`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const contactSupport = async (data: { message: string }) => {
  try {
    return await axiosAPIInstance
      .post(`support/contact`, data)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const deleteAccount = async () => {
  try {
    return await axiosAPIInstance
      .delete(`accounts`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const updateProfile = async (data: {
  first_name: string;
  last_name: string;
  phone_number: string;
}) => {
  try {
    return await axiosAPIInstance
      .put(`accounts`, data)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const updatePassword = async (data: {
  old_password: string;
  new_password: string;
}) => {
  try {
    return await axiosAPIInstance
      .put(`accounts`, data)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const set2FA = async (data: {
  password: string;
  '2fa_code': string;
}) => {
  try {
    return await axiosAPIInstance
      .post(`accounts/set2fa`, data)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const getFeesCategory = async (feeVariable: any) => {
  try {
    return await axiosAPIInstance
      .get(`/settings/fees?component=${feeVariable}`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const getFeesCount = async () => {
  try {
    return await axiosAPIInstance
      .get(`/settings/fees?component=count`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const getAreas = async () => {
  try {
    return await axiosAPIInstance
      .get(`/settings/areas`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const addFees = async (data: any) => {
  try {
    return await axiosAPIInstance
      .post(`/settings/fees`, data)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const updateFee = async (feeId: string, data: { amount: string; tag: string; otp: string }) => {
  try {
    return await axiosAPIInstance
      .put(`/settings/fees/${feeId}`, data)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const deleteFee = async (feeId: string) => {
  try {
    return await axiosAPIInstance
      .delete(`/settings/fees/${feeId}`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const addService = async (data: { 
  amount: string; 
  type: string; 
  name: string; 
  otp: string;
  operator_id?: string;
}) => {
  try {
    return await axiosAPIInstance
      .post(`/settings/services`, data)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const updateService = async (service_id: string, data: { amount: string; type: string; name: string; otp: string }) => {
  try {
    return await axiosAPIInstance
      .put(`/settings/services/${service_id}`, data)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const deleteService = async (service_id: string) => {
  try {
    return await axiosAPIInstance
      .delete(`/settings/services/${service_id}`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const getServicesCount = async () => {
  try {
    return await axiosAPIInstance
      .get(`/settings/services?component=count`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const getStakeholders = async () => {
  try {
    return await axiosAPIInstance
      .get(`/users/stakeholders`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const getNotifications = async () => {
  try {
    const response = await axiosAPIInstance.get('/accounts/notification');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addStakeholder = async (data: { 
  name: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  otp: string;
}) => {
  try {
    return await axiosAPIInstance
      .post(`/users/stakeholders`, data)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const updateStakeholder = async (stakeholderId: string, data: { 
  name: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  amount: string;
  amount_type: 'percentage' | 'amount';
  otp: string;
}) => {
  try {
    return await axiosAPIInstance
      .put(`/users/stakeholders/${stakeholderId}`, data)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const deleteStakeholder = async (stakeholderId: string) => {
  try {
    return await axiosAPIInstance
      .delete(`/users/stakeholders/${stakeholderId}`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const getStakeholdersCount = async () => {
  try {
    return await axiosAPIInstance
      .get(`/users/stakeholders?component=count`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};
  

export const getBizImage = async () => {
  try {
    const response = await axiosAPIInstance.get('/users/biz-image');
    return response.data;
  } catch (error) {
    throw error;
  }
};



export const getBisProcess = async (
  data: { doc_name: string; otp: string },
  mode: 'add' | 'edit' = 'add',
  bizId?: string
) => {
  try {
    if (mode === 'edit' && bizId) {
      console.log(mode,'dsdsdsd')
      return await axiosAPIInstance
        .put(`/users/biz-process/${bizId}`, data)
        .then((res) => {
          return res?.data;
        });
    } else {
      return await axiosAPIInstance
        .post(`/users/biz-process`, data)
        .then((res) => {
          return res?.data;
        });
    }
  } catch (error) {
    return error;
  }
};

export const getBisProcessList = async () => {
  try {
    return await axiosAPIInstance
      .get(`/users/biz-process`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const deleteBisProcess = async (bizId: string) => {
  try {
    return await axiosAPIInstance
      .delete(`/users/biz-process/${bizId}`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const confirmPickupArrival = async (towing_id: string) => {
  const response = await axiosAPIInstance.post(`/towings/request-arrive/${towing_id}`);
  return response.data;
};

export const confirmDestinationArrival = async (towing_id: string) => {
  const response = await axiosAPIInstance.post(`/towings/complete-request/${towing_id}`);
  return response.data;
};

export const getCommandCenters = async () => {
  try {
    return await axiosAPIInstance
      .get(`/accounts/commands`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};