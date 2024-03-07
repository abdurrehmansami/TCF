import React from "react";
import { useTranslation } from "react-i18next";
// routes config
import routes from "../routes";
import { TheHeaderDropdown, TheHeaderDropdownMssg } from "./index";
import { Layout, Menu, theme } from "antd";
import { useHistory } from "react-router-dom";
import CBreadcrumbRouter from "src/components/CBreadcrumbRouter";

const TheHeader = () => {
  const { t } = useTranslation();
  const history = useHistory();

  routes.map((o) => (o["name"] = t(o["name"])));
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  return (
    <>
      <Layout.Header
        theme="light"
        style={{ backgroundColor: colorBgContainer, padding: 0 }}
      >
        <div className="d-flex justify-content-between">
          <Menu
            // onClick={(e) => history.push(e.key)}
            mode="horizontal"
            theme="light"
            style={{ flex: 1 }}
            items={[
              // {
              //   label: t("DASHBOARD"),
              //   key: "/dashboard",
              // },
//              {
//                style: {
//                  marginLeft: "auto",
//                },
//                label: <TheHeaderDropdownMssg />,
//                key: "message",
//              },
              {
                style: {
                  marginLeft: "auto",
                },
                label: <TheHeaderDropdown />,
                key: "profile",
              },
            ]}
          />
        </div>
      </Layout.Header>
      <CBreadcrumbRouter backgroundColor={colorBgContainer} routes={routes} />
    </>
  );
};

export default TheHeader;
