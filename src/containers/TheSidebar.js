/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useContext, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { UserContext } from "../UserProvider";
import { DashboardOutlined, SettingOutlined } from "@ant-design/icons";
import { Image, Layout, Menu } from "antd";
import { PieChartOutlined } from "@ant-design/icons";
import { useHistory, Link } from "react-router-dom";
import { CardTravelOutlined, Category, ListOutlined } from "@material-ui/icons";
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}
const TheSidebar = ({ collapsed, setCollapsed }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const show = useSelector((state) => state.sidebarShow);
  const [navigation, setNavigation] = useState(null);
  const [rootSubmenuKeys, setRootKeys] = useState([]);
  const { user } = useContext(UserContext);
  const [openKeys, setOpenKeys] = useState(["1"]);
  const onOpenChange = (keys) => {
    console.log(rootSubmenuKeys);
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };
  const icons = {
    "cil-speedometer": <DashboardOutlined />,
    "cil-file": <ListOutlined />,
    "cil-spreadsheet": <Category />,
    "cil-settings": <SettingOutlined />,
    "cil-truck": <CardTravelOutlined />,
  };
  useEffect(() => {
    let nav = [];
    let keys = [];
    user.permissions?.forEach((o) => {
      keys.push(o.menuUrl);
      nav.push(
        getItem(
          o.name,
          o.menuUrl,
          icons[o.icon] ? icons[o.icon] : <PieChartOutlined />,
          o.childList
            .filter((o) => o.menuUrl !== null && o.menuUrl.length > 0)
            .map((child) => getItem(child.name, child.menuUrl))
        )
      );
    });
    setRootKeys(keys);
    setNavigation(nav);
  }, []);

  return (
    <Layout.Sider
      show={show}
      width={250}
      onShowChange={(val) => dispatch({ type: "set", sidebarShow: val })}
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
    >
      <div
        style={{
          margin: 10,
        }}
      >
        <Link to={"/"}>
          {collapsed ? (
          <div style={{ textAlign: "center" }}>
            <Image
              preview={false}
              // src={"/logo-transparent-sdfoods-square.png"}
              src={"/steelLogo.webp"}
              className="c-sidebar-brand-full"
              height={30}
              width={"auto"}
            />
          </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <Image
                preview={false}
                // src={"/logo-transparent-sdfoods.png"}
                src={"/steelLogo.webp"}
                className="c-sidebar-brand-full"
                height={50}
                width={"auto"}
              />
            </div>
          )}
        </Link>
      </div>
      <Menu
        theme="dark"
        defaultSelectedKeys={["/dashboard"]}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        mode="inline"
        items={navigation}
        onClick={(e) => {
          history.push(e.key);
        }}
      />
    </Layout.Sider>
  );
};

export default memo(TheSidebar);
