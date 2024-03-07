import React, { useContext } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { UserContext } from "./UserProvider";
import "antd/dist/reset.css";
import "./scss/style.scss";
import { Toaster } from "react-hot-toast";

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
);

// Containers
const TheLayout = React.lazy(() => import("./containers/TheLayout"));
// Pages
const Login = React.lazy(() => import("./views/pages/login/Login"));
const ForgotPassword = React.lazy(() =>
  import("./views/pages/login/ForgotPassword")
);

const App = () => {
  const { user } = useContext(UserContext);

  return (
    <BrowserRouter>
      <Toaster position="bottom-center" reverseOrder={true} />
      <React.Suspense fallback={loading}>
        <Switch>
          {/* <Route path="/sales/order" name="My Order" render={(props) => <MyOrder />} /> */}
          <Route
            path="/forgotpassword"
            name="Forgot Password"
            render={(props) => <ForgotPassword {...props} />}
          />
          {user.auth ? (
            <Route
              path="/"
              name="Home"
              render={(props) => <TheLayout {...props} />}
            />
          ) : (
            <Route
              path="/"
              name="Login"
              render={(props) => <Login {...props} />}
            />
          )}
        </Switch>
      </React.Suspense>
    </BrowserRouter>
  );
};

export default App;
