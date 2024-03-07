import { useTranslation } from "react-i18next";
import { putData, postFormData } from "../../../services/NetworkService";
import {
  MyTextField,
  MyDateField,
  MuiAutocomplete,
} from "../../../components/FormFieldsAnt";
import { MyDropzone } from "../../../components/MyDropZone";
import Moment from "moment";
import { Form, Input, Typography } from "antd";

export const Location = ({
  orderData,
  productLocationMap,
  locQuantity,
  locQuantityList,
  values,
  setFieldValue,
  setValues,
  locations,
  confirmDialog,
  isSubmitting,
  setSubmitting,
  setConfirmDialog,
  id,
  comments,
  updateLocationFields,
  setRespValues,
  edit,
  orderStatus,
  setErrorMsg,
  disabled,
}) => {
  const { t } = useTranslation();
  const saveLocData = (
    product,
    lotNo,
    lotV,
    recPQ,
    recUQ,
    recPV,
    recUV,
    damQ,
    damV,
    exp,
    expV,
    loc,
    locV
  ) => {
    let name =
      "_" + product.id + "_" + productLocationMap.get(product.id).length;
    values["lotNumber" + name] = values[lotV] ? values[lotV] : lotNo;
    values["receivedPallets" + name] = values[recPV] ? values[recPV] : recPQ;
    values["receivedNumberofUnits" + name] = values[recUV]
      ? values[recUV]
      : recUQ;
    values["damageNumberOfUnits" + name] = values[damV] ? values[damV] : damQ;
    values["expiry" + name] = values[expV] ? values[expV] : exp;
    values["locationId" + name] = values[locV] ? values[locV] : loc;
    setValues(values);
  };
  const addLocation = (product) => {
    let locationFields = productLocationMap.get(product.id);
    locationFields.push({
      name: "_" + product.id + "_" + locationFields.length,
      orderProductId: product.orderProductId,
      locationFields: {},
    });
    productLocationMap[product.id] = locationFields;
    setValues(values);
  };

  const removeLocation = (product, index) => {
    if (!(productLocationMap.get(product.id).length == 1)) {
      productLocationMap.get(product.id).splice(index, 1);
    }
    setValues(values);
  };
  const updateReceivedValues = (index, product, val, del, add) => {
    let rec = 0;
    let sur = 0;
    let less = 0;
    let l = [];
    if (locQuantityList.get(product.id)) {
      l = locQuantityList.get(product.id);
    }
    if (del) {
      l.splice(index, 1);
    } else if (add || l.length == 0) {
      l.push({ rec: val });
    } else {
      l[index] = { rec: val };
    }
    locQuantityList.set(product.id, l);
    l.map((o) => {
      rec = rec + o.rec;
    });
    let check = rec - product.quantity;
    if (check > 0) {
      sur = check;
      less = 0;
    } else {
      less = -check;
      sur = 0;
    }
    console.log(rec + " " + sur + " " + less + "");
    locQuantity.set(product.id, { rec: rec, sur: sur, less: less });
    setValues(values);
  };
  return (
    <>
      {orderData?.products?.map((product, ind) =>
        productLocationMap?.get(product.id)?.map((locationField, index) => (
          <>
            {product.isExpiry === null
              ? (product.isExpiry = true)
              : product.isExpiry}
            {product.isFresh === null
              ? (product.isFresh = true)
              : product.isFresh}
            {index === 0 ? (
              <>
                <hr></hr>
                <table style={{ marginBottom: 10 }}>
                  <tr>
                    <th>{ind + 1}.</th>
                    &nbsp;&nbsp;&nbsp;
                    <th>NAME&nbsp;&nbsp;:&nbsp;&nbsp;</th>
                    <th>{product.name}</th>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <th>PALLETS&nbsp;&nbsp;:&nbsp;&nbsp;</th>
                    <th>{product?.quantity ?? 0}</th>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <th>QUANTITY&nbsp;&nbsp;:&nbsp;&nbsp;</th>
                    <th>{product?.numberOfUnits ?? 0}</th>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <th>RECEIVED&nbsp;&nbsp;:&nbsp;&nbsp;</th>
                    <th>{locQuantity?.get(product.id)?.rec ?? 0}</th>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <th>SURPLUS&nbsp;&nbsp;:&nbsp;&nbsp;</th>
                    <th>{locQuantity?.get(product.id)?.sur ?? 0}</th>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <th>LESS&nbsp;&nbsp;:&nbsp;&nbsp;</th>
                    <th>{locQuantity?.get(product.id)?.less ?? 0}</th>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  </tr>
                </table>
              </>
            ) : null}
            <div className="row">
              {product.isFresh && (
                <div className="col-sm-3">
                  <MyTextField
                    name={"lotNumber" + locationField.name}
                    disabled={disabled}
                    inputLabelProps={
                      locationField?.locationFields?.lotNumber && {
                        shrink: true,
                      }
                    }
                    val={locationField?.locationFields?.lotNumber ?? ""}
                    label={t("Lot Number")}
                    type="number"
                  />
                </div>
              )}
              <div className="col-sm-3">
                <MyTextField
                  name={"receivedPallets" + locationField.name}
                  disabled={disabled}
                  inputLabelProps={
                    locationField.locationFields?.receivedPallets && {
                      shrink: true,
                    }
                  }
                  val={locationField?.locationFields?.receivedPallets ?? 0}
                  label={t("Received Pallets")}
                  type="number"
                  required
                  onBlur={(e) => {
                    console.log(
                      e.target.value ==
                        values["receivedPallets" + locationField.name]
                    );
                    if (
                      e.target.value ==
                      (values["receivedPallets" + locationField.name] ?? 0)
                    ) {
                      updateReceivedValues(
                        index,
                        product,
                        values["receivedPallets" + locationField.name],
                        false,
                        false
                      );
                    }
                  }}
                />
              </div>
              <div className="col-sm-3">
                <MyTextField
                  name={"receivedNumberofUnits" + locationField.name}
                  disabled={disabled}
                  inputLabelProps={
                    locationField.locationFields?.receivedNumberofUnits && {
                      shrink: true,
                    }
                  }
                  val={
                    locationField.locationFields?.receivedNumberofUnits ?? ""
                  }
                  label={t("Received Qty")}
                  type="number"
                  required
                />
              </div>
              <div className="col-sm-3">
                <MyTextField
                  name={"damageNumberOfUnits" + locationField.name}
                  disabled={disabled}
                  val={locationField?.locationFields?.damageNumberOfUnits ?? ""}
                  label={t("Damaged Qty")}
                  inputLabelProps={
                    locationField.locationFields?.damageNumberOfUnits && {
                      shrink: true,
                    }
                  }
                  type="number"
                />
              </div>
              {product.isExpiry && (
                <div className="col-sm-3">
                  <MyDateField
                    disabled={disabled}
                    name={"expiry" + locationField.name}
                    label={"Expiry Date"}
                    setFieldValue={setFieldValue}
                    required={
                      (values["receivedPallets" + locationField.name] ??
                        locationField?.locationFields?.receivedPallets) > 0
                        ? true
                        : false
                    }
                    val={locationField?.locationFields?.expiry ?? 0}
                  />
                </div>
              )}
              <div className="col-sm-3" style={{ marginTop: -20 }}>
                {locationField?.locationFields?.locationId ? (
                  locations?.map((loc) => {
                    if (loc.id === locationField?.locationFields?.locationId) {
                      return (
                        <MuiAutocomplete
                          data={locations}
                          disabled={disabled}
                          setFieldValue={setFieldValue}
                          placeholder={t("Location")}
                          displayKey={"name"}
                          name={"locationId" + locationField.name}
                          valueKey="id"
                          val={loc}
                          required={
                            (values["receivedPallets" + locationField.name] ??
                              locationField?.locationFields?.receivedPallets) >
                            0
                              ? true
                              : false
                          }
                        />
                      );
                    }
                  })
                ) : (
                  <MuiAutocomplete
                    data={locations}
                    disabled={disabled}
                    setFieldValue={setFieldValue}
                    placeholder={t("Location")}
                    displayKey={"name"}
                    name={"locationId" + locationField.name}
                    valueKey="id"
                    val={
                      locations?.filter(
                        (loc) =>
                          loc.id == values["locationId" + locationField.name]
                      )?.[0] ?? null
                    }
                    required={
                      (values["receivedPallets" + locationField.name] ??
                        locationField?.locationFields?.receivedPallets) > 0
                        ? true
                        : false
                    }
                  />
                )}
              </div>
              {index + 1 === productLocationMap.get(product.id)?.length ? (
                <div className="col-sm-1">
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    disabled={
                      productLocationMap.get(product.id).length == 1 || disabled
                    }
                    onClick={() => {
                      removeLocation(product, index);
                      updateReceivedValues(
                        index,
                        product,
                        -values["receivedPallets" + locationField.name] ?? 0,
                        true,
                        false
                      );
                    }}
                    style={{
                      borderRadius: 40,
                      fontSize: 13,
                      width: 30,
                      marginTop: 4,
                    }}
                  >
                    -
                  </button>
                  &nbsp;
                  <button
                    disabled={disabled}
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      updateReceivedValues(
                        index,
                        product,
                        values["receivedPallets" + locationField.name] ??
                          locationField.locationFields?.receivedPallets ??
                          0,
                        false,
                        true
                      );
                      saveLocData(
                        product,
                        locationField.locationFields?.lotNumber,
                        "lotNumber" + locationField.name,
                        locationField.locationFields?.receivedPallets,
                        locationField.locationFields?.receivedNumberofUnits,
                        "receivedPallets" + locationField.name,
                        "receivedNumberofUnits" + locationField.name,
                        locationField.locationFields?.damageNumberOfUnits,
                        "damageNumberOfUnits" + locationField.name,
                        locationField.locationFields?.expiry,
                        "expiry" + locationField.name,
                        locationField.locationFields?.locationId,
                        "locationId" + locationField.name
                      );
                      addLocation(product);
                    }}
                    style={{
                      borderRadius: 40,
                      fontSize: 13,
                      width: 30,
                      marginTop: 4,
                    }}
                  >
                    +
                  </button>
                </div>
              ) : null}
            </div>
            {index === productLocationMap.get(product.id).length - 1 && (
              <MyDropzone
                name={"photo" + locationField.name}
                label="Photo"
                setFieldValue={setFieldValue}
                multiple
              />
            )}
            {index === productLocationMap.get(product.id).length - 1 &&
              orderData?.products?.[ind]?.photos.map((o) => {
                return (
                  <div>
                    <a href={o.path} target="_blank">
                      {t("Photo")}
                    </a>
                    <br />
                    <br />
                  </div>
                );
              })}
          </>
        ))
      )}
      <br />
      {comments}
      <div className="row">
        {confirmDialog === false && !edit ? (
          <div className="col-sm-1">
            <button
              type="button"
              disabled={isSubmitting || disabled}
              className="btn btn-success"
              onClick={() => {
                setFieldValue("status", "STOCKED");
                setConfirmDialog(true);
              }}
            >
              {t("Stocked")}
            </button>
          </div>
        ) : null}
        {confirmDialog === false && orderStatus !== "STOCKED" ? (
          <div className="col-sm-11">
            <button
              type="button"
              disabled={isSubmitting}
              className="btn btn-success"
              onClick={() => {
                save(
                  values,
                  setSubmitting,
                  productLocationMap,
                  orderData,
                  id,
                  updateLocationFields,
                  setRespValues,
                  setErrorMsg
                );
              }}
            >
              {t("Save")}
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
};

export const save = (
  values,
  setSubmitting,
  productLocationMap,
  orderData,
  id,
  updateLocationFields,
  setRespValues,
  setErrorMsg
) => {
  setSubmitting(true);
  console.log(id);
  console.log(productLocationMap);
  let dataFiles = [];
  let artifect_types = "";
  let base_paths = "";
  var formData = new FormData();
  values.products = orderData.products;
  orderData.products &&
    orderData.products.map((product) => {
      productLocationMap.get(product.id) &&
        productLocationMap.get(product.id).map((locationField) => {
          if (values["photo" + locationField.name]) {
            values["photo" + locationField.name].map((o) => {
              dataFiles.push(o);
              if (artifect_types.length > 0) artifect_types += ",";
              artifect_types += "photo_";
              base_paths +=
                "/orders/" +
                id +
                "/" +
                "photo/orderproduct/" +
                locationField.orderProductId +
                ",";
            });
            delete values["photo" + locationField.name];
          }
        });
      updateLocationFields(values, product, productLocationMap);
    });
  formData.append("artifect_type", artifect_types);
  base_paths = base_paths.slice(0, -1);
  formData.append("base_path", base_paths);
  dataFiles.map((o) => {
    formData.append("dataFiles", o);
  });
  if (dataFiles.length > 0) {
    postFormData(formData)
      .then(async (res) => {
        if (res && res.data.files) {
          let files = res.data.files.map((file) => ({
            path: file.path,
            mimeType: file.mimetype,
            title: file.filename,
            description: values.description,
            mediaType: file.artifect_type,
          }));
          values.id = id;
          let productsList = [];
          orderData.products &&
            orderData.products.map((product) => {
              let productLocationList = [];
              let photo = files.filter(
                (file) => file.path.split("/")[8] == product.orderProductId
              );
              let productObj = {
                id: product.id,
                quantity: product.quantity,
                productLocation: productLocationList,
                photos: [...product.photos, ...photo],
                orderProductId: product.orderProductId,
              };
              productLocationMap.get(product.id) &&
                productLocationMap.get(product.id).map((locationField) => {
                  if (
                    !(Object.keys(locationField.locationFields).length === 0)
                  ) {
                    productLocationList.push(locationField.locationFields);
                  }
                });
              productObj.productLocation = productLocationList;
              productsList.push(productObj);
            });
          values.products = productsList;
          const resp = await putData("orders/" + id, values);
          if (resp.data) {
            setRespValues(resp.data, values);
          }
          setSubmitting(false);
        }
      })
      .catch((error) => {
        setSubmitting(false);
        setErrorMsg();
      });
    values.products = orderData.products;
  } else {
    let productsList = [];
    orderData.products &&
      orderData.products.map((product) => {
        let productLocationList = [];
        let productObj = {
          id: product.id,
          frozen: product.frozen,
          quantity: product.quantity,
          productLocation: productLocationList,
          photos: product.photos,
          orderProductId: product.orderProductId,
        };
        productLocationMap.get(product.id) &&
          productLocationMap.get(product.id).map((locationField) => {
            if (!(Object.keys(locationField.locationFields).length === 0)) {
              productLocationList.push(locationField.locationFields);
            }
          });
        productObj.productLocation = productLocationList;
        productsList.push(productObj);
      });
    values.id = id;
    values.products = productsList;
    console.log(JSON.stringify(values));
    putData("orders/" + id, values)
      .then((response) => {
        setRespValues(response.data, values);
        setSubmitting(false);
      })
      .catch((error) => {
        setSubmitting(false);
      });
  }
};

export const Comments = ({ orderData }) => {
  const { t } = useTranslation();
  return (
    <>
      <Form.Item label={t("COMMENTS")} name={"comments"}>
        <Input.TextArea placeholder={t("COMMENTS")} rows={2} />
      </Form.Item>
      {orderData?.statusHistoryList?.map((statusHistory, index) => {
        return (
          <>
            {index === 0 && (
              <Typography.Title level={4}>{t("Comments")}</Typography.Title>
            )}
            <div>
              {statusHistory.user +
                " le " +
                Moment(statusHistory.time).format("DD/MM/YYYY hh:mm") +
                ": "}
              <br />
              <i>{statusHistory.comments}</i>
              <br />
              <br />
            </div>
          </>
        );
      })}
    </>
  );
};

export const updateProductLocationsMap = (
  products,
  productLocationMap,
  locQuantity,
  locQuantityList
) => {  
  console.log(products)
  products.forEach((product) => {    
    let locationFields = [];
    let locList = [];
    let rec = 0;
    let sur = 0;
    let less = 0;
    if (product.productLocation.length !== 0) {
      product.productLocation.map((prodLocation) => {
        rec =
          (prodLocation.receivedQuantity ?? prodLocation.receivedPallets) + rec;
        let check = rec - product.quantity;
        if (check > 0) {
          sur = check;
          less = 0;
        } else {
          less = -check;
          sur = 0;
        }
        prodLocation.receivedPallets =
          prodLocation.receivedQuantity ?? prodLocation.receivedPallets;
        prodLocation.damageNumberOfUnits =
          prodLocation.damagedQuantity ?? prodLocation.damageNumberOfUnits;
        locList.push({
          rec: prodLocation.receivedQuantity ?? prodLocation.receivedPallets,
        });
        locationFields.push({
          name: "_" + product.id + "_" + locationFields.length,
          orderProductId: product.orderProductId,
          locationFields: prodLocation,
        });
      });
      locQuantityList.set(product.id, locList);
      locQuantity.set(product.id, { rec: rec, sur: sur, less: less });
      productLocationMap.set(product.id, locationFields);      
    } else {      
      locQuantityList.set(product.id, [{ rec: 0 }]);
      locationFields.push({
        name: "_" + product.id + "_" + locationFields.length,
        orderProductId: product.orderProductId,
        locationFields: {},
      });
      productLocationMap.set(product.id, locationFields);
      locQuantity.set(product.id, { rec: 0, sur: 0, less: 0 });      
    }    
  });
};

export const updateLocationFields = (values, product, productLocationMap) => {
  const keys = Object.keys(values);
  productLocationMap?.get(product.id)?.forEach((locationField) => {
    if (keys.includes("lotNumber" + locationField.name)) {
      locationField.locationFields.lotNumber =
        values["lotNumber" + locationField.name];
      delete values["lotNumber" + locationField.name];
    }
    if (keys.includes("receivedPallets" + locationField.name)) {
      locationField.locationFields.receivedPallets =
        values["receivedPallets" + locationField.name];
      delete values["receivedPallets" + locationField.name];
    }
    if (keys.includes("receivedNumberofUnits" + locationField.name)) {
      locationField.locationFields.receivedNumberofUnits =
        values["receivedNumberofUnits" + locationField.name];
      delete values["receivedNumberofUnits" + locationField.name];
    }
    if (keys.includes("damageNumberOfUnits" + locationField.name)) {
      locationField.locationFields.damageNumberOfUnits =
        values["damageNumberOfUnits" + locationField.name];
      delete values["damageNumberOfUnits" + locationField.name];
    }
    if (keys.includes("expiry" + locationField.name)) {
      locationField.locationFields.expiry =
        values["expiry" + locationField.name];
      delete values["expiry" + locationField.name];
    }
    if (keys.includes("locationId" + locationField.name)) {
      locationField.locationFields.locationId =
        values["locationId" + locationField.name];
      delete values["locationId" + locationField.name];
    }
  });
};

export const LoadPage = (status, id, history) => {
  console.log(status);
  if (status == "NEW") {
    history.push("/new/" + id);
  } else if (status == "VALIDATED") {
    history.push("/validated/" + id);
  } else if (status == "CONFIRMED") {
    history.push("/confirmed/" + id);
  } else if (status == "RECEIVED") {
    history.push("/received/" + id);
  } else if (status == "STOCKED") {
    history.push("/stocked/" + id);
  } else {
    history.push("/orders/" + id);
  }
};

export const SuccessMsg = ({ successMsg, err }) => {
  return (
    <>
      {successMsg !== "" && (
        <>
          <br />
          <div className={err ? "alert alert-danger" : "alert alert-success"}>
            <div className="col-sm-12">{successMsg}</div>
          </div>
        </>
      )}
    </>
  );
};
