import React, { createContext, useContext } from "react";
import toast, { Toaster, ToastOptions } from "react-hot-toast";

type ToastType = "success" | "error" | "loading" | "custom";

interface ToastContextProps {
  viewToast: (
    message: string,
    type?: ToastType,
    options?: ToastOptions,
  ) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const viewToast = (
    message: string,
    type: ToastType = "success",
    options?: ToastOptions,
  ) => {
    if (type === "success") {
      toast.success(message, options);
    } else if (type === "error") {
      toast.error(message, options);
    } else if (type === "loading") {
      toast.loading(message, options);
    } else {
      toast(message, options);
    }
  };
  // toastOptions={{ className: "z-[999999999999999]" }}
  return (
    <ToastContext.Provider value={{ viewToast }}>
      {children}
      <Toaster
        containerStyle={{
          textAlign: "center",
          zIndex: 999999999999
        }}
        position="top-center"
        reverseOrder={false}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("must be in a provider!");
  }
  return context;
};
