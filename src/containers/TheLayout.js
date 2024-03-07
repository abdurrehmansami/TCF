import React, { useEffect, useState } from "react";
import { TheContent, TheSidebar, TheFooter, TheHeader } from "./index";
import { Layout, theme } from "antd";
// import TheSidebar from "./TheSidebar";
const { Content, Footer } = Layout;

const TheLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  useEffect(() => {
    const w = window.screen.width;
    if (w <= 768) {
      setCollapsed(true);
    }
  }, []);
  return (
    <Layout className="c-app c-default-layout">
      <TheSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout className="site-layout">
        <TheHeader style={{ padding: 0, background: colorBgContainer }} />
        <Content>
          <TheContent />
        </Content>
        <Footer style={{ textAlign: "center", padding: 0 }}>
          <TheFooter />
        </Footer>
      </Layout>
    </Layout>
  );
};

export default TheLayout;
