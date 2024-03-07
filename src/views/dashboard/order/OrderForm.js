import { Form, Formik } from "formik";
import Content from "src/components/Content";
import {
  MyTextField,
  MuiAutocomplete,
  MyProgress,
  MyDateField,
} from "src/components/FormFields";
import { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router";
import useFetch from "../../../hooks/useFetch";
import {
  postData,
  postFormData,
  putData,
} from "../../../services/NetworkService";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../../UserProvider";
import Loading from "src/components/Loading";

function OrderForm(props) {
  const history = useHistory();
  const { t } = useTranslation();
  const { data: vendors } = useFetch("partners", null, 1000);
  const { data: employees } = useFetch("employees", null, 1000);
  const { data: products } = useFetch("products", null, 1000);
  const [selectedProducts] = useState([]);
  //   const [total, setTotal] = useState(0);
  const orderData = props.location.data;
  const edit = props.location.data ? true : false;
  const [initialValues, setInitialValues] = useState({
    employee: null,
    totalAmount: null,
    quantity: null,
    photos: [],
    products: [],
    discountPercentage: null,
    discountedAmount: null,
  });
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isLoaded, setLoaded] = useState(false);
  const { user } = useContext(UserContext);
  const [validateQuotation, setValidateQuotation] = useState(false);
  const [productLocationMap, setProductLocationMap] = useState([]);
  const { data: warehouses } = useFetch("warehouses", null, 1000);
  const [locations, setLocations] = useState([]);
  const [orderStatus, setOrderStatus] = useState(null);

  useEffect(() => {
    // let loc = [];
    console.log(orderData);
    if (warehouses) {
      warehouses.data.content.forEach((warehouse) => {
        warehouse.locations.forEach((location) => {
          let locObj = {
            name: warehouse.name + " - " + location.name,
            id: location.id,
          };
          locations.push(locObj);
        });
      });
      setLocations(locations);
    }
    if (edit && orderData && vendors) {
      setOrderStatus(orderData.status);
      let vendor = vendors.data.content.filter(
        (o) => o.id === orderData.partner.id
      );
      setSelectedVendor(vendor);
      setProductLocationMap([]);
      orderData.products.forEach((product) => {
        let locationFields = [];
        product.productLocation.forEach((loc) => {
          let locObj = null;
          locations.forEach((location) => {
            if (location.id === loc.locationId) {
              console.log("location");
              console.log(location);
              locObj = {
                name: "_" + product.id + "_" + locationFields.length,
                lotNumber: loc.lotNumber,
                receivedQuantity: loc.receivedQuantity,
                damagedQuantity: loc.damagedQuantity,
                expiry: loc.expiry,
                locationDetail: { id: loc.locationId, name: location.name },
              };
              locationFields.push(locObj);
            }
          });
        });
        setProductLocationMap((prevList) => {
          return [
            ...prevList,
            {
              productId: product.id,
              productName: product.name,
              productQuantity: product.quantity,
              locationsFields: locationFields,
            },
          ];
        });
        console.log("productLocationMap");
        console.log(productLocationMap);
      });
      setInitialValues(orderData);
      setLoaded(true);
    }
    if (user && employees) {
      let emp = employees.data.content.filter((o) => o.login === user.name);
      setInitialValues({ ...initialValues, employee: emp[0] });
      setLoaded(true);
    }
    for (let i = 0; i < user.permissions.length; i++) {
      const parent_ = user.permissions[i];
      if (parent_.childList.length > 0) {
        for (let j = 0; j < parent_.childList.length; j++) {
          const child = parent_.childList[j];
          if (child.permission === "validate_quotation")
            setValidateQuotation(true);
        }
      }
    }
  }, [orderData, employees, user, vendors, warehouses, setLocations]);

  useEffect(() => {
    try {
      if (orderData !== null) {
        orderData.products.forEach((product) => {
          selectedProducts.push({
            id: product.id,
            name: product.name,
            htPrice: product.htPrice,
            quantity: product.quantity,
            orderProductId: product.orderProductId,
          });
        });
        // let _total = 0;
        // selectedProducts.forEach((product) => {
        //   _total += product.quantity * product.htPrice;
        // });
        // setTotal(_total);
      }
    } catch (err) {
      return;
    }
  }, [orderData]);
  function addProduct(values, setValues) {
    let selectedProduct = values.product;
    selectedProduct.quantity = values.quantity;
    selectedProducts.push(selectedProduct);

    let _total = 0;
    selectedProducts.forEach((product) => {
      _total += product.quantity * product.htPrice;
    });
    // setTotal(_total);
    values.totalAmount = _total;
    setValues(values);
  }

  function addLocation(id, values, setValues) {
    productLocationMap.map((product) => {
      if (product.productId === id) {
        product.locationsFields.push({
          name: "_" + id + "_" + product.locationsFields.length,
          lotNumber: null,
          receivedQuantity: null,
          damagedQuantity: null,
          expiry: null,
          locationDetail: { id: null, name: null },
        });
      }
      return null;
    });

    setProductLocationMap(productLocationMap);
    setValues(values);
  }

  const handleSubmit = (values, setSubmitting) => {
    if (orderStatus === "STOCKED") {
      const keys = Object.keys(values);
      productLocationMap.forEach((product) => {
        product.locationsFields.forEach((locationField) => {
          if (keys.includes("lotNumber" + locationField.name)) {
            locationField.lotNumber = values["lotNumber" + locationField.name];
          }
          if (keys.includes("receivedQuantity" + locationField.name)) {
            locationField.receivedQuantity =
              values["receivedQuantity" + locationField.name];
          }
          if (keys.includes("damagedQuantity" + locationField.name)) {
            locationField.damagedQuantity =
              values["damagedQuantity" + locationField.name];
          }
          if (keys.includes("expiry" + locationField.name)) {
            locationField.expiry = values["expiry" + locationField.name];
          }
          if (keys.includes("locationId" + locationField.name)) {
            locationField.locationDetail.id =
              values["locationId" + locationField.name];
          }
        });
      });

      productLocationMap.forEach((product) => {
        product.locationsFields.forEach((locationsField) => {
          locationsField.locationId = locationsField.locationDetail.id;
        });
      });
      console.log(values.products);
      orderData.products.map((product) => {
        console.log(product);
        productLocationMap.map((locationMap) => {
          if (product.id === locationMap.productId) {
            product.productLocation = locationMap.locationsFields;
          }
          return null;
        });
        return null;
      });
    } else {
      values["products"] = selectedProducts;
    }
    let dataFiles = [];
    let artifect_types = "";
    let base_paths = "";
    var formData = new FormData();
    formData.append("artifect_type", artifect_types);
    if (edit) {
      const id = orderData.id;
      if (dataFiles.length === 0) {
        console.log("values");
        console.log(values);
        values.id = id;
        putData("orders/" + id, values).then((resp) => {
          if (resp.data) {
            console.log(resp.data);
            setSubmitting(false);
            history.push("/orders/" + id);
            return;
          }
        });
      } else {
        artifect_types.split(",").forEach((type) => {
          base_paths += "/orders/" + id + "/" + type + ",";
        });
        base_paths = base_paths.slice(0, -1);
        formData.append("base_path", base_paths);
        dataFiles.forEach((o) => {
          formData.append("dataFiles", o);
        });
        postFormData(formData).then(async (res) => {
          if (res && res.data.files) {
            let files = res.data.files.map((file) => ({
              path: file.path,
              mimeType: file.mimetype,
              title: file.filename,
              description: values.description,
              mediaType: file.artifect_type,
            }));
            values.photos = files;
            values.id = id;
            console.log("values");
            console.log(values);
            const resp = await putData("orders/" + id, values);
            if (resp.data) {
              console.log(resp.data);
            }
            setSubmitting(false);
            history.push("/orders/" + id);
          }
        });
      }
    } else {
      if (values.photos) {
        values.photos.forEach((o) => {
          dataFiles.push(o);
          if (artifect_types.length > 0) artifect_types += ",";
          artifect_types += "photo";
        });
        delete values.photos;
      }
      console.log("values");
      console.log(values);
      postData("orders", values)
        .then(async (response) => {
          const id = response.data.data.id;
          if (dataFiles.length === 0) {
            setSubmitting(false);
            history.push("/orders/" + id);
            return;
          }
          artifect_types.split(",").forEach((type) => {
            base_paths += "/orders/" + id + "/" + type + ",";
          });
          base_paths = base_paths.slice(0, -1);
          formData.append("base_path", base_paths);
          dataFiles.forEach((o) => {
            formData.append("dataFiles", o);
          });
          const res = await postFormData(formData);
          if (res && res.data.files) {
            let files = res.data.files.map((file) => ({
              path: file.path,
              mimeType: file.mimetype,
              title: file.filename,
              description: values.description,
              mediaType: file.artifect_type,
            }));
            values.photos = files;
            values.id = id;
            console.log("values");
            console.log(values);
            const resp = await putData("orders/" + id, values);
            if (resp.data) {
              console.log(resp.data);
            }
            setSubmitting(false);
            history.push("/orders/" + id);
          }
        })
        .catch((error) => {
          setSubmitting(false);
          alert(error);
        });
    }
  };

  const handleRemoveClick = (index, values, setValues) => {
    let total_ =
      values.totalAmount -
      selectedProducts[index].quantity * selectedProducts[index].htPrice;
    selectedProducts.splice(index, 1);
    values.totalAmount = total_;
    // setTotal(total_);
    setValues(values);
  };

  return !isLoaded ? (
    <Loading />
  ) : (
    <Content title={edit ? t("EDIT_ORDER") : t("ADD_ORDER")}>
      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        onSubmit={(values, { setSubmitting }) => {
          handleSubmit(values, setSubmitting);
        }}
      >
        {({ values, isSubmitting, setFieldValue, setValues }) => (
          <Form>
            <table
              className="table table-lightborder"
              style={{
                borderTopWidth: 3,
                borderColor: "white",
                borderTopStyle: "solid",
              }}
            >
              <tbody>
                <tr>
                  <th className="col-sm-3">{t("ORDER_NUMBER")} </th>
                  <td className="col-sm-3 text-left">
                    {orderData ? orderData.number : null}
                  </td>

                  <th className="col-sm-3">{t("STATUS")}</th>
                  <td className="text-left">{t(orderStatus)}</td>
                </tr>
                <br />
              </tbody>
            </table>
            {(edit ? (selectedVendor ? true : false) : true) && vendors && (
              <MuiAutocomplete
                data={vendors.data.content}
                setFieldValue={setFieldValue}
                placeholder={t("ENTER_VENDORS")}
                displayKey={"name"}
                name="partner.id"
                valueKey="id"
                val={selectedVendor !== null ? selectedVendor[0] : null}
                label={t("ENTER_VENDORS")}
                required
              />
            )}
            {orderStatus === "STOCKED" ? null : (
              <div className="row">
                <div className="col-sm-3">
                  {products && (
                    <MuiAutocomplete
                      data={products.data.content}
                      setFieldValue={setFieldValue}
                      placeholder={t("SELECT_A_PRODUCT")}
                      displayKey={"name"}
                      name="product"
                    />
                  )}
                </div>
                <div className="col-sm-3">
                  <br></br>
                  <MyTextField
                    placeholder={t("QUANTITY")}
                    name="quantity"
                    label={t("QUANTITY")}
                    type="number"
                  />
                </div>
                <div className="col-sm-3">
                  <br></br>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => addProduct(values, setValues)}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
            <table className="table table-lightborder">
              <tbody>
                {orderStatus === "STOCKED" ? null : (
                  <>
                    <tr>
                      <th>{t("PRODUCT")}</th>
                      <th>{t("QUANTITY")}</th>
                      <th></th>
                    </tr>
                    {selectedProducts &&
                      selectedProducts.map((product, index) => (
                        <tr key={product.id}>
                          {product.otherName?.name == null ? product.name : product.otherName?.name}
                          <td>{product.quantity}</td>
                          <td>
                            <button
                              type="button"
                              disabled={isSubmitting}
                              className="btn btn-sm btn-danger"
                              onClick={() =>
                                handleRemoveClick(index, values, setValues)
                              }
                            >
                              {t("DELETE")}
                            </button>
                          </td>
                        </tr>
                      ))}
                    {validateQuotation && (
                      <>
                        <tr>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td>
                            <b>{t("DISCOUNT")}:</b>
                          </td>
                          <td>{values.discountPercentage}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td>
                            <b>{t("DISCOUNTED_AMOUNT")}:</b>
                          </td>
                          <td>{values.discountedAmount}</td>
                          <td></td>
                        </tr>
                      </>
                    )}
                  </>
                )}
              </tbody>
            </table>

            {(orderStatus === "STOCKED" || orderStatus === "RECEIVED") &&
              productLocationMap &&
              productLocationMap.map(
                (product) =>
                  product.locationsFields &&
                  product.locationsFields.map((locationField, index) => (
                    <>
                      {index === 0 ? (
                        <>
                          <hr></hr>
                          <table>
                            <tr>
                              <th>NAME&nbsp;&nbsp;:&nbsp;&nbsp;</th>
                              <th>{product.otherName?.name != null ? product.otherName?.name : product.name}</th>
                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              <th>QUANTITY&nbsp;&nbsp;:&nbsp;&nbsp;</th>
                              <th>
                                {product.productQuantity
                                  ? product.productQuantity
                                  : null}
                              </th>
                            </tr>
                          </table>
                          <br />
                        </>
                      ) : null}
                      <div className="row">
                        <div className="col-sm-2">
                          <MyTextField
                            val={
                              locationField.lotNumber
                                ? locationField.lotNumber
                                : ""
                            }
                            name={"lotNumber" + locationField.name}
                            label={t("LOT_NO")}
                            type="number"
                          />
                        </div>
                        <div className="col-sm-2">
                          <MyTextField
                            val={
                              locationField.receivedQuantity
                                ? locationField.receivedQuantity
                                : ""
                            }
                            name={"receivedQuantity" + locationField.name}
                            label={t("RECEIVED_QTY")}
                            type="number"
                            required
                          />
                        </div>
                        <div className="col-sm-2">
                          <MyTextField
                            val={
                              locationField.damagedQuantity
                                ? locationField.damagedQuantity
                                : "0"
                            }
                            name={"damagedQuantity" + locationField.name}
                            label={t("DAMAGED_QTY")}
                            type="number"
                          />
                        </div>
                        <div className="col-sm-2">
                          <MyDateField
                            val={
                              locationField.expiry ? locationField.expiry : null
                            }
                            name={"expiry" + locationField.name}
                            label={"Expiry Date"}
                            setFieldValue={setFieldValue}
                            required
                          />
                        </div>
                        <div className="col-sm-3" style={{ marginTop: -20 }}>
                          {locations && (
                            <MuiAutocomplete
                              val={
                                locationField.locationDetail
                                  ? locationField.locationDetail
                                  : ""
                              }
                              data={locations}
                              setFieldValue={setFieldValue}
                              placeholder={t("LOCATION")}
                              displayKey={"name"}
                              name={"locationId" + locationField.name}
                              valueKey="id"
                              required
                            />
                          )}
                        </div>
                        {index + 1 === product.locationsFields.length ? (
                          <div className="col-sm-1">
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() =>
                                addLocation(
                                  product.productId,
                                  values,
                                  setValues
                                )
                              }
                              style={{
                                borderRadius: 50,
                                fontSize: 15,
                                width: 33,
                                marginTop: 4,
                              }}
                            >
                              +
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </>
                  ))
              )}

            {orderStatus === "CONFIRMED" && (
              <MyDateField
                val={orderData.deliveryDate ? orderData.deliveryDate : null}
                name="deliveryDate"
                label={"Delivery Date"}
                setFieldValue={setFieldValue}
              />
            )}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-sm btn-primary"
              >
                {t("SUBMIT")}
              </button>
            </div>
            <MyProgress isSubmitting={isSubmitting} />
          </Form>
        )}
      </Formik>
    </Content>
  );
}
export default OrderForm;
