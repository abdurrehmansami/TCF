import { Drawer } from "antd";
import OrderDrawerContent from "./OrderDrawerContent";
import useFetch from "src/hooks/useFetch";
import Loading from "./Loading";
import OrderForm2 from "src/views/dashboard/order/OrderForm2";
import { useTranslation } from "react-i18next";
const OrderDrawer = ({
  visible,
  title,
  handleAction,
  onClose,
  orderId,
  ...props
}) => {
  const { t } = useTranslation();
  const { data: order } = useFetch("orders/" + orderId);
  const w = window.screen.width > 850 ? 850 : window.screen.width;
  if (props.mode === "view") {
    return (
      <Drawer onClose={onClose} open={visible} title={title} width={w}>
        {order && order.data ? (
          <OrderDrawerContent handleAction={handleAction} data={order.data} />
        ) : (
          <Loading />
        )}
      </Drawer>
    );
  } else {
    return (
      <Drawer
        onClose={onClose}
        open={visible}
        title={props.mode === "create" ? t("ADD_ORDER") : t("EDIT_ORDER")}
        width={850}
      >
        <OrderForm2 data={order?.data} handleAction={handleAction} />
      </Drawer>
    );
  }
};

export default OrderDrawer;
