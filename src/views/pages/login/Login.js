import React, { useContext } from "react";
import axios from "axios";
import { Button, Card, Col, Form, Image, Input, Row } from "antd";
import { UserContext } from "../../../UserProvider";
import { useTranslation } from "react-i18next";
import { getData } from "src/services/NetworkService";
import { Link } from "react-router-dom";

const Login = () => {
  const { login } = useContext(UserContext);
  const { t } = useTranslation();
  const [form] = Form.useForm();
  return (
    <div className="c-app c-app-login c-default-layout flex-row align-items-center">
      <Row style={{ flex: 1, paddingInline: 20 }}>
        <Col xl={8} md={12} xs={24} style={{ margin: "auto" }}>
          <Card style={{ maxWidth: 410, margin: "auto", display: "block" }}>
            <Form
              size="large"
              name="loginForm"
              layout="vertical"
              form={form}
              initialValues={{ username: "", password: "" }}
              onFinish={(values) => {
                const params = new URLSearchParams();
                params.append("username", values.username);
                params.append("password", values.password);
                const config = {
                  withCredentials: true,
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                };
                axios
                  .post(
                    process.env.REACT_APP_SERVER_URL + "login",
                    params,
                    config
                  )
                  .then((res) => {
                    if (res.status === 200) {
                      getData("mainmenu")
                        .then((res) => {
                          login(values.username, res.data);
                        })
                        .catch(() => alert("Login failed!"));
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                    alert("Login failed!");
                  });
              }}
            >
              <div className="text-center">
                <Image
                  preview={false}
                  // src={"/logo-main-sdfoods.png"}
                  src={"/steelLogo.webp"}
                  className="login-logo"
                  width={230}
                  height={"auto"}
                />
              </div>
              <br />
              <p className="text-muted text-center">
                {t("Sign In to your account")}
              </p>
              <Form.Item
                name="username"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input placeholder={t("Username")} />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input.Password placeholder={t("Password")} />
              </Form.Item>
              <Form.Item className="text-center">
                <Button type="primary" className="px-4" htmlType="submit">
                  {t("Login")}
                </Button>
              </Form.Item>
              <Form.Item className="text-center pt-2">
                <Link component={Button} type="link" to="/forgotpassword">
                  {t("Forgot password")}
                </Link>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
