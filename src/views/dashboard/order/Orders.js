import MainTable from "../../../components/MainTable2";
import useFetch from "../../../hooks/useFetch";
import { useTranslation } from "react-i18next";

function Orders(props) {
  let pathname = props.location.pathname;
  pathname = pathname.substring(1, pathname.length);

  const { t } = useTranslation();
  const { data: vendors } = useFetch("partners", null, 1000);
  return (
    <MainTable
      addRoute="/orders/add"
      addBtnTitle={t("ADD_ORDER")}
      overRideDelete={!(pathname === "stocked" || pathname === "published")}
      vendors={vendors}
    />
  );
}
export default Orders;
