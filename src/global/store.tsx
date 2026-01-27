import { create, StoreApi } from "zustand";
import { devtools, persist } from "zustand/middleware";

type iData = {
  [key: string]: any;
};
interface StoreState {
    navPath: string;
    setNavPath: (path: string) => void;
    siderBarView: boolean;
    setSiderBarView: (siderBarView: boolean) => void;
    firstName: string;
    setFirstName: (firstName: string) => void;
    lastName: string;
    setLastName: (lastName: string) => void;
    token: string | null;
    setToken: (token: string | null) => void;
    email: string;
    setEmail: (email: string) => void;
    role: string;
    setRole: (role: string) => void;
    userName: string;
    setUserName: (userName: string) => void;
    isVerified: boolean;
    setIsVerified: (isVerified: boolean) => void;
    isCompleted: boolean;
    setIsCompleted: (isCompleted: boolean) => void;
    isAuthorized: boolean;
    setIsAuthorized: (isAuthorized: boolean) => void;
    avatar: string;
    setAvatar: (avatar: string) => void;

    formData: iData | null;
    setFormData: (data: iData) => void;

    otpRequestId: string | null;
    setOtpRequestId: (id: string | null) => void;
    otpValue: string | null;
    setOtpValue: (otp: string | null) => void;
}

// this middleware handler is responsible for handling data persistency
const myMiddlewares = <T,>(
    f: (
      set: {
        (
          partial: T | Partial<T> | ((state: T) => T | Partial<T>),
          replace?: false | undefined,
        ): void;
        (state: T | ((state: T) => T), replace: true): void;
      },
      get: () => T,
      api: StoreApi<T>,
    ) => T,
  ) =>
    devtools(
      persist(f, {
        name: "navPaths",
      }),
    );


    export const useOnboardingStore = create<StoreState>()(
        myMiddlewares((set) => ({
        
            navPath: "forgot-password",
            setNavPath: (path: string) => set({ navPath: path }),
            siderBarView: true,
            setSiderBarView: (siderBarView: boolean) => set({ siderBarView }),
            firstName: "",
            setFirstName: (firstName: string) => set({ firstName }),
            lastName: "",
            setLastName: (lastName: string) => set({ lastName }),
            token: null,
            setToken: (token: string | null) => set({ token }),
            email: "",
            setEmail: (email: string) => set({ email }),
            role: "",
            setRole: (role: string) => set({ role }),
            userName: "",
            setUserName: (userName: string) => set({ userName }), 
            isVerified: false,
            setIsVerified: (isVerified: boolean) => set({ isVerified }),
            isCompleted: false,
            setIsCompleted: (isCompleted: boolean) => set({ isCompleted }),
            isAuthorized: false,
            setIsAuthorized: (isAuthorized: boolean) => set({ isAuthorized }),
            avatar: "",
            setAvatar: (avatar: string) => set({ avatar }),

            formData: null,
            setFormData: (data) => set({ formData: data }),

            otpRequestId: null,
            setOtpRequestId: (id) => set({ otpRequestId: id }),
            otpValue: null,
            setOtpValue: (otp) => set({ otpValue: otp }),


        })),
    );