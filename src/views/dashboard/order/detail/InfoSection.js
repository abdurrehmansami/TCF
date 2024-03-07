import Moment from "moment";
import { useTranslation } from "react-i18next";

const InfoSection = ({ orderData, orderStatus }) => {
  const { t } = useTranslation();
  return (
    <div>
      <table className="table container table-sm">
        <tbody>
          <tr>
            <th className="col-sm-3">{t("Order Number")} </th>
            <td className="col-sm-3 text-left">{orderData.number}</td>

            <th className="col-sm-3">{t("Status")}</th>
            <td className="text-left">{t(orderStatus)}</td>
          </tr>
          <tr>
            <th className="col-sm-3">{t("Expected delivery date")} </th>
            <td className="col-sm-3 text-left">
              {Moment.utc(orderData.expectedDeliveryDate).format("DD/MM/YYYY")}
            </td>

            <th className="col-sm-3">{t("Expected Delivery time")}</th>
            <td className="col-sm-3 text-left">
              {Moment.utc(orderData.expectedDeliveryTime).format("HH:mm")}
            </td>
          </tr>
          <tr>
            <th className="col-sm-3">{t("Vendor")} </th>
            <td className="col-sm-3 text-left">{orderData.partner?.name}</td>
            <th className="col-sm-3"></th>
            <td className="text-left"></td>
          </tr>

          {(orderStatus === "RECEIVED" ||
            orderStatus === "STOCKED" ||
            orderStatus === "CONFIRMED") && (
            <tr>
              <th className="col-sm-3">{t("Logistics")} </th>
              <td className="col-sm-3 text-left">
                {t(orderData.logisticsType)}
              </td>
              {orderData.transporterName ? (
                <>
                  <th className="col-sm-3">{t("Transporter name")}</th>
                  <td className="text-left">{t(orderData.transporterName)}</td>
                </>
              ) : (
                <>
                  <th className="col-sm-3"></th>
                  <td className="text-left"></td>
                </>
              )}
            </tr>
          )}
          {(orderStatus === "RECEIVED" || orderStatus === "STOCKED") && (
            <tr>
              <th className="col-sm-3">{t("Stock rotated")} </th>
              <td className="col-sm-3 text-left">
                {orderData.stockRotated ? "Yes" : "No"}
              </td>
              {!orderData.stockRotated ? (
                <>
                  <th className="col-sm-3">{t("Reason")}</th>
                  <td className="text-left">{t(orderData.reason)}</td>
                </>
              ) : (
                <>
                  <th className="col-sm-3"></th>
                  <td className="text-left"></td>
                </>
              )}
            </tr>
          )}
          <br />
          <br />
          {orderData.products &&
            (false &&(orderStatus !== "STOCKED" &&  orderStatus === "GRN_RECEIVED" &&
            orderStatus !== "RECEIVED")) && (
              <>
                <tr>
                  <legend>{t("Products")}</legend>
                </tr>
              </>
            )}
          {(false &&(orderStatus !== "STOCKED" &&
            orderStatus !== "RECEIVED")) && orderStatus === "GRN_RECEIVED" &&
            orderData?.products?.map?.((product) => (
              <>
                <tr>
                  <th className="col-sm-3">{t("Products")}</th>
                  <th className="col-sm-3">{""}</th>
                  <th className="col-sm-3">{"Pallet"}</th>
                  <th className="col-sm-3">{t("Quantity")}</th>
                </tr>
                <tr>
                  <td className="col-sm-3">
                    <div>
                      {product.otherName != null
                        ? product.otherName.name
                        : product.name}
                    </div>
                  </td>
                  <td className="col-sm-3">
                    <div></div>
                  </td>
                  <td className="col-sm-3">
                    <div>{product.quantity}</div>
                  </td>
                  <td className="col-sm-3">
                    <div>{product.numberOfUnits}</div>
                  </td>
                </tr>
                <br />
              </>
            ))}
          {orderStatus === "CONFIRMED" && (
            <>
              <tr>
                <th className="col-sm-3">{t("Purchase Order")} </th>
                <td className="col-sm-3 text-left">
                  {orderData.purchaseOrderMedia && (
                    <a
                      href={orderData.purchaseOrderMedia.path}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("Purchase Order")}
                    </a>
                  )}
                </td>
                <td></td>
                <td></td>
              </tr>
              <br />
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InfoSection;