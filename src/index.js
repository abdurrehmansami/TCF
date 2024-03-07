import "react-app-polyfill/ie11"; // For IE 11 support
import "react-app-polyfill/stable";
import "core-js";
import "./polyfill";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import UserProvider from "./UserProvider";
import { icons } from "./assets/icons";
import { Provider } from "react-redux";
import store from "./store";
import "./translations/i18n";
import { ConfigProvider } from "antd";

React.icons = icons;

ReactDOM.render(
  <Provider store={store}>
    <UserProvider>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#1F2A37",
            fontSize: 13,
          },
        }}
      >
        <App />
      </ConfigProvider>
    </UserProvider>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
