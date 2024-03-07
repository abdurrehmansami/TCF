import { useTranslation } from "react-i18next";
import { Spin } from "antd";

const Loading = () => {
  const { t } = useTranslation();
  return (
    <div className="d-flex align-items-center">
      <strong>{t("Loading...")}</strong>

      <div className="ml-auto">
        <Spin size="large" />
      </div>
    </div>
  );
};

export default Loading;
