import React, { Suspense, useContext } from "react";
import { UserContext } from "../UserProvider";
import { Redirect, Route, Switch } from "react-router-dom";
import { CContainer, CFade } from "@coreui/react";

// routes config
import routes from "../routes";
import { useTranslation } from "react-i18next";
import { getData } from "src/services/NetworkService";
import { message } from "antd";

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
);

const TheContent = () => {
  const { t } = useTranslation();
  const { user, login, logout } = useContext(UserContext);

  const authorization = (url) => {
    for (let i = 0; i < user.permissions.length; i++) {
      const parent = user.permissions[i];
      if (url === parent.displayMenu) {
        return true;
      } else if (parent.childList.length > 0) {
        for (let j = 0; j < parent.childList.length; j++) {
          const child = parent.childList[j];
          if (url.startsWith(child.displayMenu)) {
            return true;
          } else if (child.childList.length > 0) {
            for (let k = 0; k < child.childList.length; k++) {
              const subChild = child.childList[k];
              if (url === subChild.displayMenu) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  };

  const isAuthorized = async (url) => {
    if ((new Date() - user.ts) / 1000 / 60 < 30) {
      console.log("2");
      return authorization(url);
    } else {
      let res = await getData("mainmenu");
      if (res.data && res.data.length > 0) {
        login(user.name, res.data);
        return authorization(url);
      } else {
        message.error("Session expired. Please log in again.");
        logout();
        return false;
      }
    }
  };

  return (
    <main style={{ padding: 15 }}>
      <Suspense fallback={loading}>
        <Switch>
          {routes.map((route, idx) => {
            return (
              route.component && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={t(route.name)}
                  render={(props) => (
                    <CFade>
                      {console.log(route.path + ":" + isAuthorized(route.path))}
                      {isAuthorized(route.path) ? (
                        <route.component {...props} />
                      ) : (
                        <Redirect to="/dashboard" />
                      )}
                    </CFade>
                  )}
                />
              )
            );
          })}
          <Redirect from="/" to="/dashboard" />
        </Switch>
      </Suspense>
    </main>
  );
};

export default React.memo(TheContent);
