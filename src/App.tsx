import React from "react";
import { RouterProvider } from "react-router-dom";
import { routes } from "./router/router";
import { ConfigProvider } from "antd";
// import "antd/dist/reset.css";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";
import { ToastProvider } from "./global/ToastProvider";
import AuthInitializer from "./components/AuthInitializer";

const themeConfig = {
  token: {
    colorPrimary: "#FF6C2D",
    borderRadius: 8,
  },
  components: {
    Typography: {
      fontFamily: 'Satoshi, sans-serif',
      titleMarginTop: 0,
      titleMarginBottom: 0,
      fontWeight: 700,
      titleFontWeight: 500,
      fontWeightLight: 300,
    }
  }
};

const App: React.FC = () => {
  return (
    <div>
      <HelmetProvider>
        <ToastProvider>
          <AuthInitializer />
          <ConfigProvider theme={themeConfig}>
            <RouterProvider router={routes} />
          </ConfigProvider>
        </ToastProvider>
      </HelmetProvider>
    </div>
  );
};

export default App;