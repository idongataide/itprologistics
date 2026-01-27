import { axiosAPIInstance } from "./interceptor";

export const getOperators = async () => {
    try {
      return await axiosAPIInstance
        .get(`/users/operators/`)
        .then((res) => {
          return res?.data;
        });
    } catch (error) {
      return error;
    }
 };


export const getOperatorData = async (uid: string) => {
    try {
      return await axiosAPIInstance
        .get(`users/operators/${uid}/`)
        .then((res) => {
          return res?.data;
        });
    } catch (error) {
      return error;
    }
};

export const addOperators = async (data: any) => {
  try {
    return await axiosAPIInstance
      .post(`/users/operators/`, data)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const addAssets = async (data: any) => {
  try {
    return await axiosAPIInstance
      .post(`/users/assets/`, data)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const getAssets = async () => {
  try {
    return await axiosAPIInstance
      .get(`/users/assets/`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};


export const getAssetsbyCordinate = async (longitude: string, latitude: string) => {
  try {
    const response = await axiosAPIInstance.get(`/users/assets`, {
      params: {
        longitude,
        latitude
      }
    });
    return response?.data;
  } catch (error) {
    return error;
  }
};


export const getAssetsByOperatorId = async (operatorId: string) => {
  try {
    return await axiosAPIInstance
      .get(`/users/assets?operator_id=${operatorId}`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const deleteAsset = async (uid: string) => {
  try {
    return await axiosAPIInstance
      .delete(`users/assets/${uid}/`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const addDrivers = async (data: any) => {
  try {
    return await axiosAPIInstance
      .post(`/users/drivers/`, data)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const getDrivers = async () => {
  try {
    return await axiosAPIInstance
      .get(`/users/drivers/`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const getDriversByOperatorId = async (operatorId: string) => {
  try {
    return await axiosAPIInstance
      .get(`/users/drivers?operator_id=${operatorId}`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const getOperatorCount = async (operatorCount: string) => {
  try {
    return await axiosAPIInstance
      .get(`/users/operators?component=${operatorCount}`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const deleteDriver = async (uid: string) => {
  try {
    return await axiosAPIInstance
      .delete(`users/drivers/${uid}/`)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const bulkUploadOperators = async (formData: FormData) => {
  try {
    return await axiosAPIInstance
      .post(`/users/bulk-operator-upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // 'Accept' : 'application/form-data',
          'upload' : 'yes'
        },
      })
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const updateAsset = async (assetId: string, data: any) => {
  try {
    return await axiosAPIInstance
      .put(`/users/assets/${assetId}`, data)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const updateDriver = async (driverId: string, data: any) => {
  try {
    return await axiosAPIInstance
      .put(`/users/drivers/${driverId}`, data)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const updateOperator = async (operatorId: string, data: any) => {
  try {
    return await axiosAPIInstance
      .put(`/users/operators/${operatorId}`, data)
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};

export const bulkUploadDrivers = async (operatorId: string, formData: FormData) => {
  try {
    return await axiosAPIInstance
      .post(`/users/bulk-driver-upload/${operatorId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'upload': 'yes'
        },
      })
      .then((res) => {
        return res?.data;
      });
  } catch (error) {
    return error;
  }
};
