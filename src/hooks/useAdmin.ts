import { getBookings, BookingDetails, getBookingsCount, getDailyPayout, getDashboardOperators, getRemittedRevenue, getRevenues } from "@/api/bookingsApi";
import { getCustomerCount, getCustomers, getCustomersDetails } from "@/api/customersApi";
import { getOperators, getOperatorData, getDrivers, getDriversByOperatorId, getAssetsbyCordinate, getAssets, getOperatorCount, getAssetsByOperatorId } from "@/api/operatorsApi";
import { getFees, getFeesCategory, getProfile, getServices, getFeesCount, getServicesCount, getStakeholdersCount, getBisProcessList, getNotifications, getStakeholders, getAreas, getCommandCenters } from "@/api/settingsApi";
import { getTeams, getTeamsCount } from "@/api/teamsApi";
import { getTransactionCount, TransactionList } from "@/api/transactionsApi";
import { getBanksList } from "@/api/banks";
import { getStakeholderPayouts } from "@/api/bookingsApi";

import useSWR from "swr";
import { getOutsider } from "@/api/outsidersApi";

export const useAllCustomers = () => {
  const { data, isLoading, mutate } = useSWR(
    `users/`,
    () => {
      return getCustomers().then((res) => {
        return res?.data;
      });
    },

    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};

export const useCustomerCount = () => {
    const { data, isLoading, mutate } = useSWR(
      `/users?component=count-status`,
      () => {
        return getCustomerCount().then((res) => {
          return res;
        });
      },
      {
        revalidateOnFocus: false,
      }
    );
    return { data, isLoading, mutate };
};

export const useCustomersData = (userId: string) => {
  const { data, isLoading, mutate } = useSWR(
    `users/`,
    () => {
      return getCustomersDetails(userId).then((res) => {
        return res?.data;
      });
    },

    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};


export const useAllOperators = () => {
  const { data, isLoading, mutate } = useSWR(
    `users/operators/`,
    () => {
      return getOperators().then((res) => {
        return res?.data;
      });
    },

    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};


export const useOperatorData = (uid: string) => {
  const { data, isLoading, mutate } = useSWR(
    `users/operators/${uid}/`,
    () => {
      return getOperatorData(uid).then((res) => {
        return res?.data;
      }); 
    },

    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};


export const useOperatorCount = (operatorCount: string) => {
  const { data, isLoading, mutate } = useSWR(
    operatorCount ? `/users/operators?component=${operatorCount}` : null,
    () => {
      return getOperatorCount(operatorCount).then((res) => {
        return res?.data;
      });
    },
    {
      revalidateOnFocus: false,
    },
  );
  return { data, isLoading, mutate };
};

export const useAllTeam = () => {
  const { data, isLoading, mutate } = useSWR(
    `/accounts/admin-user`,
    () => {
      return getTeams().then((res) => {
        return res?.data;
      });
    },

    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};

export const useBanksList = () => {
  const { data, isLoading, mutate } = useSWR(
    '/banks',
    () => {
      return getBanksList().then((res) => {
        return res?.data;
      });
    },
    {
      revalidateOnFocus: false,
    }
  );
  return { data, isLoading, mutate };
};

export const useGetAssets = () => {
  const { data, isLoading, mutate } = useSWR(
    `/users/assets`,
    () => {
      return getAssets().then((res) => {
        return res?.data;
      });
    },

    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};

export const useGetAssetsbyCord = (longitude: string, latitude: string) => {
  const { data, isLoading, mutate } = useSWR(
    `/users/assets`,
    () => {
      return getAssetsbyCordinate(longitude,latitude).then((res) => {
        return res?.data;
      });
    },

    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};


export const useAssetsByOperatorId = (operatorId: string | undefined) => {
    const { data, isLoading, mutate } = useSWR(
      operatorId ? `/users/assets?operator_id=${operatorId}` : null,
      (url) => {
        if (!url || !operatorId) return null; 
        return getAssetsByOperatorId(operatorId).then((res) => {
          return res?.data;
        });
      },
      {
        revalidateOnFocus: false,
      }
    );
  
    return { data, isLoading, mutate };
  };
  

export const useGetDrivers = () => {
  const { data, isLoading, mutate } = useSWR(
    `/users/drivers/`,
    () => {
      return getDrivers().then((res) => {
        return res?.data;
      });
    },

    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};

export const useGetDriversByOperatorId = (operatorId: string | undefined) => {
  const { data, isLoading, mutate } = useSWR(
    operatorId ? `/users/drivers?operator_id=${operatorId}` : null,
    (url) => {
      if (!url || !operatorId) return null; 
      return getDriversByOperatorId(operatorId).then((res) => {
        return res?.data;
      });
    },
    {
      revalidateOnFocus: false,
    }
  );

  return { data, isLoading, mutate };
};

export const useAllBookings = (cancelledBy?: string, startDate?: string, endDate?: string) => {
  const { data, isLoading, mutate } = useSWR(
    `/towings${cancelledBy ? `&cancelled_by=${cancelledBy}` : ''}${startDate ? `&start_date=${startDate}` : ''}${endDate ? `&end_date=${endDate}` : ''}`,
    () => {
      return getBookings(cancelledBy, startDate, endDate).then((res) => {
        return res?.data;
      });
    },
    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};



export const useBookingDetails = (towing_id: string | undefined) => {
  const { data, isLoading, mutate } = useSWR(
    towing_id ? `/towings/${towing_id}` : null,
    (url) => {
      if (!url || !towing_id) return null;
      return BookingDetails(towing_id).then((res) => {
        return res?.data;
      });
    },
    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};

export const useRevenues = (operatorEarning: string) => {
  const { data, isLoading, mutate } = useSWR(
    `/towings?component=${operatorEarning}`,
    () => {
      return getRevenues(operatorEarning).then((res) => {
        return res?.data;
      });
    },
    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};

export const useAllBookingsCount = (countStatus: string = '0') => {
  const { data, isLoading, mutate } = useSWR(
    `/towings?component=${countStatus}`,
    () => {
      return getBookingsCount(countStatus).then((res) => {
        return res?.data;
      });
    },
    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};



export const useAllService = (type: string | undefined) => {
  const { data, isLoading, mutate } = useSWR(
    type ? `/settings/services?type=${type}` : null,
    (url) => {
      if (!url || !type) return null;
      return getServices(type).then((res) => {
        return res?.data;
      });
    },
    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};


export const useTransactions = () => {
  const { data, isLoading, mutate } = useSWR(
    '/payments/get-transactions',
    () => {
      return TransactionList().then((res) => {
        return res?.data;
      });
    },
    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};

export const useServices = () => {
  const { data, isLoading, mutate } = useSWR(
    `/settings/services`,
    () => {
      return getServices('').then((res) => {
        return res;
      });
    },
    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};

export const useFees = () => {
  const { data, isLoading, mutate } = useSWR(
    '/settings/fees',
    () => {
      return getFees().then((res) => {
        return res;
      });
    },
    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};

export const useAdminProfile = () => {
  const { data, isLoading, mutate } = useSWR(
    `/accounts/profile/`,
    () => {
      return getProfile().then((res) => {
        return res?.data;
      });
    },

    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};

export const useGetNotification = () => {
    const { data, isLoading, mutate } = useSWR(
      `/accounts/notification`,
      () => {
        return getNotifications().then((res) => {
          return res?.data;
        });
      },
  
      {
        revalidateOnFocus: false,
      },
    );
  
    return { data, isLoading, mutate };
  };

export const useAllTeamsCount = (countStatus: string = '0') => {
  const { data, isLoading, mutate } = useSWR(
    `/accounts/admin-user?component=${countStatus}`,
    () => {
      return getTeamsCount(countStatus).then((res) => {
        return res?.data;
      });
    },
    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};

export const useAllTransCount = (countStatus: string = '0') => {
  const { data, isLoading, mutate } = useSWR(
    `/payments/get-transactions?component=${countStatus}`,
    () => {
      return getTransactionCount(countStatus).then((res) => {
        return res?.data;
      });
    },
    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};


export const useDashboardOperators = (date: string = '0') => {
  const { data, isLoading, mutate } = useSWR(
    `/towings/get-dashboard-ops${date}`,
    () => {
      return getDashboardOperators(date).then((res) => {
        return res?.data;
      });
    },

    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};


export const useRemittedRevenue = (date: string = '0') => {
  const { data, isLoading, mutate } = useSWR(
    `/towings/stakeholder-daily-revenue${date}`,
    () => {
      return getRemittedRevenue(date).then((res) => {
        return res?.data;
      });
    },

    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};

export const useStakeholderPayouts = (date: string = '0') => {
  const { data, isLoading, mutate } = useSWR(
    `/towings/stakeholder-daily-revenue${date}`,
    () => {
      return getStakeholderPayouts().then((res) => {
        return res?.data;
      });
    },

    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};

export const useDailyPayout = (date: string = '0') => {
  const { data, isLoading, mutate } = useSWR(
    `/towings/daily-revenue-operator${date}`,
    () => {
      return getDailyPayout(date).then((res) => {
        return res?.data;
      });
    },

    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};

export const useFeesCount = () => {
  const { data, isLoading, mutate } = useSWR<
    { success: boolean; msg: string; data: { total: number }[] } | undefined
  >(
    `/settings/fees?component=count`,
    () => {
      return getFeesCount().then((res) => {
        return res;
      });
    },
    {
      revalidateOnFocus: true,
    }
  );
  return { data, isLoading, mutate };
};

export const useGetFees = (feeVariable: string = '0') => {
  const { data, isLoading, mutate } = useSWR(
    `/settings/fees?component=${feeVariable}`,
    () => {
      return getFeesCategory(feeVariable).then((res) => {
        return res?.data;
      });
    },
    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};

export const useServicesCount = () => {
  const { data, isLoading, mutate } = useSWR(
    `/settings/services?component=count`,
    () => {
      return getServicesCount().then((res) => {
        return res;
      });
    },
    {
      revalidateOnFocus: false,
    }
  );
  return { data, isLoading, mutate };
};


export const useStakeholdersCount = () => {
    const { data, isLoading, mutate } = useSWR(
      `/users/stakeholders?component=count`,
      () => {
        return getStakeholdersCount().then((res) => {
          return res;
        });
      },
      {
        revalidateOnFocus: false,
      }
    );
    return { data, isLoading, mutate };
};



export const useGetProcess = () => {
    const { data, isLoading, mutate } = useSWR(
      `/users/biz-process/`,
      () => {
        return getBisProcessList().then((res) => {
          return res?.data;
        });
      },
  
      {
        revalidateOnFocus: false,
      },
    );
  
    return { data, isLoading, mutate };
};
  

export const useLagosCities = () => {
  const cities = [
    "Agege",
    "Ajeromi-Ifelodun",
    "Alimosho",
    "Amuwo-Odofin",
    "Apapa",
    "Badagry",
    "Epe",
    "Eti-Osa",
    "Ibeju-Lekki",
    "Ifako-Ijaiye",
    "Ikeja",
    "Ikorodu",
    "Kosofe",
    "Lagos Island",
    "Lagos Mainland",
    "Mushin",
    "Ojo",
    "Oshodi-Isolo",
    "Shomolu",
    "Surulere"
  ];

  return { data: cities, isLoading: false };
};

export const useStakeholders = () => {
  const { data, isLoading, mutate } = useSWR(
    `/users/stakeholders`,
    () => {
      return getStakeholders().then((res) => {
        return res?.data;
      });
    },
    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};


export const useGetArea = () => {
  const { data, isLoading, mutate } = useSWR(
    `/settings/areas/`,
    () => {
      return getAreas().then((res) => {
        return res?.data;
      });
    },
    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};


export const useSearch = (q:string) => {
  const { data, isLoading, mutate } = useSWR(
    `/outsiders/${q}`,
    () => {
      return getOutsider(q).then((res) => {
        return res?.data;
      });
    },
    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};




export const useCommandCenters = () => {
  const { data, isLoading, mutate } = useSWR(
    `/account/commands/`,
    () => {
      return getCommandCenters().then((res) => {
        return res?.data;
      });
    },
    {
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, mutate };
};