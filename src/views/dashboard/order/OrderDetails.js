import useFetch from "../../../hooks/useFetch";
import { postData } from "../../../services/NetworkService";
import React,{useState} from "react";
import Loading from "src/components/Loading";
import OrderDrawerContent from "src/components/OrderDrawerContent";

function OrderDetails(props) {
  const id = props.match.params.id;
  const { data: order } = useFetch("orders/" + id);
  const [mode, setMode] = useState("view")
  const handleAction = (data, targetMode) => {
    setMode(targetMode)  
  };

  return order?.data ? (
    <OrderDrawerContent {...props} handleAction={handleAction} mode={mode} data={order?.data} />
  ) : (
    <Loading />
  );
}

export default OrderDetails;

export const postNotification = (o, t) => {
  let name = `${o.data.id}`;
  let title = t("order update notification", {
    company: o.client?.society?.toUpperCase(),
  });
  let status = t(o.data.status);
  let message = t("order updated notification message", {
    contract: name,
    status: status,
  });
  let notification = {
    type: "STATUS_CHANGE",
    orderId: name,
    title: title,
    message: message,
    link: `/orders/${name}`,
  };
  postData("notifications", notification).then((res) => console.log(res));  
};
