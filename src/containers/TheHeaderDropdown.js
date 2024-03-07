import { useContext } from "react";
import { UserContext } from "../UserProvider";
import { useTranslation } from "react-i18next";
import { SettingOutlined, UserOutlined } from "@ant-design/icons";
import { EmailOutlined, SecurityOutlined } from "@material-ui/icons";
import { Dropdown, Space } from "antd";
import { useHistory } from "react-router-dom";
import { CImg } from "@coreui/react";

const TheHeaderDropdown = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { logout } = useContext(UserContext);
  const items = [
    {
      label: t("CHANGE_PASSWORD"),
      icon: <SettingOutlined className="mfe-2" />,
      key: "/changepassword",
      onClick: () => history.push("/changepassword"),
    },
    {
      label: t("MYPROFILE"),
      icon: <UserOutlined className="mfe-2" />,
      key: "/myprofile",
      onClick: () => history.push("/myprofile"),
    },
    {
      label: t("LOGOUT"),
      icon: <SecurityOutlined className="mfe-2" />,
      key: "1",
      onClick: () => logout(),
    },
  ];
  const empty = null;
  return (
    <Dropdown
      menu={{
        items,
      }}
      trigger={["click"]}
    >
      <a href={empty} onClick={(e) => e.preventDefault()}>
        <Space>
          {/* <EmailOutlined /> */}
          <div className="c-avatar mt-3">
            <CImg src="/avatars/profile-default.png" className="c-avatar-img" alt=""/>

          </div>
        </Space>
      </a>
    </Dropdown>
  );
};

export default TheHeaderDropdown;
