import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { useLocation, matchPath } from "react-router-dom";
import { Breadcrumb, theme } from "antd";
import { HomeFilled } from "@ant-design/icons";
import { ChevronRight } from "@material-ui/icons";

//component - CoreUI / CBreadcrumbRouter
const getPaths = (pathname) => {
  const paths = ["/"];
  if (pathname === "/") return paths;
  pathname.split("/").reduce((prev, curr) => {
    const currPath = `${prev}/${curr}`;
    paths.push(currPath);
    return currPath;
  });
  return paths;
};

const CBreadcrumbRouter = (props) => {
  const { className, routes, noborder } = props;

  let items = null;
  const location = useLocation();
  if (routes) {
    const currPath = location.pathname;
    const paths = getPaths(currPath);
    const currRoutes = paths
      .map((currPath) => {
        const route = routes.find((route) =>
          matchPath(currPath, {
            path: route.path,
            exact: route.exact,
          })
        );
        return { ...route, currPath };
      })
      .filter((route) => route && route.name);

    items = currRoutes.map((route) => {
      return {
        title: (
          <>
            {route.path == "/" ? (
              <HomeFilled style={{ marginRight: 10 }} />
            ) : null}{" "}
            {route.name}
          </>
        ),
        href: currPath === route.path ? null : route.path,
      };
    });
  }

  //render
  const {
    token: { controlItemBgActiveDisabled },
  } = theme.useToken();
  return (
    <Breadcrumb
      style={{
        backgroundColor: props.backgroundColor,
        padding: 20,
        paddingBlock: 10,
        borderBottom: noborder
          ? "none"
          : `1px solid ${controlItemBgActiveDisabled}`,
      }}
      separator={<ChevronRight />}
      items={items}
    />
  );
};

CBreadcrumbRouter.propTypes = {
  backgroundColor: PropTypes.string,
  routes: PropTypes.array,
};

export default CBreadcrumbRouter;
