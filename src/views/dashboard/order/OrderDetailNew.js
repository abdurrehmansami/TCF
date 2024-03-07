import { useEffect, useReducer, useRef, useState } from "react";
import { Form, Formik } from "formik";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import useFetch from "src/hooks/useFetch";
import { CCard, CCardBody, CCardHeader, CCol, CRow } from "@coreui/react";
import {
  MuiAutocomplete,
  MyDateField,
  MyTextField,
} from "src/components/FormFields";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { MyDropzone } from "src/components/MyDropZone";
import { Menu, MenuItem } from "@material-ui/core";
import InfoSection from "./detail/InfoSection";
import { generateInvoice } from "./detail/pdf/Invoice";
import { getData, postData, postFormData, putData } from "src/services/NetworkService";
import GrnTable from "./detail/GrnTable";

const OrderDetails = (props) => {
  const { t } = useTranslation();
  const history = useHistory();
  const id = props.match.params.id;
  const { data: order } = useFetch("orders/" + id);
  const { data: products } = useFetch("products", null, 1000);
  const { data: grn } = useFetch(`orders/${id}/grn`);
  const ref = useRef(null);
  const [disabled] = useState(false);
  const { data: warehouses } = useFetch("warehouses", null, 1000);
  const [locations, setLocations] = useState([]);
  const [orderProductMap] = useState(new Map());
  const [grnList, setGrnList] = useState([]);
  const [orderData, setOrderData] = useState({});
  const initialState = [];
  const [locationDetails,setLocationDetails] = useState([]);
  // const red = useReducer(reducer, initialState);
  // console.log(red);
  const [initialValues, setInitialValues] = useState({
    id: id,
    products: [],
    notes: "",
  });
  const [orderStatus, setOrderStatus] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [productMap, setProductMap] = useState(new Map());
  const [locationMap, setLocationMap] = useState(new Map());
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  useEffect(() => {
    if (products) {
      let map = new Map();
      products?.data?.content?.forEach((product) => {
        map.set(product.id, { name: product.name });
      });
      setProductMap(map);
    }
  }, [products]);

  useEffect(() => {
    if (warehouses) {
      let map = new Map();
      warehouses.data.content.forEach((warehouse) => {
        warehouse.locations.forEach((location) => {
          map.set(location.id, {
            name: warehouse.name + " - " + location.name,
          });
        });
      });
      setLocationMap(map);
    }
  }, [warehouses]);

  useEffect(() => {
    if (grn) {
      let list = setGrnListData(grn);
      setGrnList(list);
    }
  }, [grn]);

  const setGrnListData = (grn) => {
    let list = [];
    grn.data.forEach((grn) => {
      let productLocationMap = new Map();
      grn?.productLocation?.map((l) => {
        if (productLocationMap.get(l.productId)) {
          let loc = productLocationMap.get(l.productId);
          loc.push(l);
          productLocationMap.set(l.productId, loc);
        } else {
          let loc = [];
          loc.push(l);
          productLocationMap.set(l.productId, loc);
        }
      });
      list.push({ productLocationMap: productLocationMap, ...grn });
    });
    return list;
  };

  useEffect(() => {
    if (order) {
      setOrderData(order.data);
      setInitialValues({
        ...order.data,
        id: id,
        products: [],
      });
      setOrderStatus(order.data.status);
      order.data.products.forEach((product) => {
        orderProductMap.set(product.id, product);
      });
    }
    if (warehouses) {
      let loc = [];
      warehouses.data.content.forEach((warehouse) => {
        warehouse.locations.forEach((location) => {
          let locObj = {
            name: warehouse.name + " - " + location.name,
            id: location.id,
          };
          loc.push(locObj);
        });
      });
      setLocations(loc);
    }
  }, [order, id, warehouses]);

  const addGrn = (values, setFieldValue) => {
    let len = values?.products.length;
    setFieldValue(`products.${len}`, {
      id: null,
      productLocation: [
        {
          id: null,
          receivedNumberofUnits: 0,
          receivedPallets: 0,
          receivedQuantity: 0,
          damageNumberOfUnits: 0,
          damagedQuantity: 0,
          expiry: null,
          locationId: null,
          lotNumber: null,
        },
      ],
    });
    // }
  };

  const discard = (values, setFieldValue) => {
    values.products.length = 0;
    setFieldValue(values);
  }

  const handleAction = (data) => {
    history.push({
      pathname: "/orders/edit",
      data: orderData,
    });
  };
  const updateReceivedValues = (index, product, val, del, add) => {
    let rec = 0;
    let sur = 0;
    let less = 0;
    let l = [];
    console.log(product);
    l = product.productLocation;
    if (del) {
      l.splice(index, 1);
    } else if (add || l.length == 0) {
      l.push({rec: val});
    } else {
      l[ index ] = {rec: val};
    }
    l.map((o) => {
      rec = rec + +o.rec;
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
    locationDetails[ index ] = { rec, sur, less}
    setLocationDetails(locationDetails)
  };

  return (
    <>
      <CCard>{console.log("locationDetails", locationDetails)}
        <CCardHeader>
          <div className="row">
            <div className="col-sm-6">
              <h3 className="text-uppercase">Order Detail</h3>
            </div>
            <div className="col-sm-6 text-right"></div>
          </div>
        </CCardHeader>
        <CCardBody>
          <Formik
            initialValues={initialValues}
            enableReinitialize
            innerRef={ref}
            onSubmit={(values, { setSubmitting }) => {
              let dataFiles = [];
              let artifect_types = "";
              let base_paths = "";
              values.products?.map((product, i) => {
                if (product?.photos_?.length > 0) {
                  product?.photos_?.forEach((o) => {
                    dataFiles.push(o);
                    // artifect_types += ",";
                    artifect_types += "photo_" + i;
                    base_paths += "/orders/" + id + "/photo/orderproduct" + ",";
                  });
                  delete product.photos_;
                }
              });
              var formData = new FormData();
              formData.append("artifect_type", artifect_types);
              base_paths = base_paths.slice(0, -1);
              formData.append("base_path", base_paths);
              dataFiles.map((o) => {
                formData.append("dataFiles", o);
              });
              if (dataFiles.length > 0) {
                postFormData(formData).then(async (res) => {
                  if (res && res.data.files) {
                    res.data.files.map((file) => {
                      let file_ = {
                        path: file.path,
                        mimeType: file.mimetype,
                        title: file.filename,
                        description: values.description,
                        mediaType: file.artifect_type,
                      };
                      let index = file?.artifect_type?.split("_")[1];
                      values.products[index].photos = [
                        ...(values.products?.[index]?.photos ?? []),
                        file_,
                      ];
                    });
                  }
                  if (values.action === "PUBLISH") {
                    values.status = "GRN_RECEIVED";
                    postData(`orders/${id}/grn`, values)
                      .then((res) => {
                        if (res && res.data) {
                          alert("GRN Received Successfully");

                          getData(`orders/${id}/grn`)
                            .then((res) => {
                              if (res && res.data) {
                                let list = setGrnListData(res.data.data);
                                setGrnList(list);
                                setSubmitting(false);
                              }
                            })
                            .catch((err) => {
                              console.log(err);
                              setSubmitting(false);
                            });
                        }
                      })
                      .catch((err) => {
                        console.log(err);
                        setSubmitting(false);
                      });
                  }
                  if (values.action === "CLOSE") {
                    values.status = "COMPLETED";
                    putData(`orders/${id}`, values)
                      .then((resp) => {
                        if (resp && resp.data) {

                          history.push({
                            pathname: "/completed/" + id,
                            data: resp.data
                          })
                          // alert("Order Closed Successfully")

                          // getData(`orders/${id}/grn`)
                          //   .then((res) => {
                          //     if (res && res.data) {
                          //       let list = setGrnListData(res.data.data);
                          //       setGrnList(list);
                          //       setSubmitting(false);
                          //     }
                          //   })
                          //   .catch((err) => {
                          //     console.log(err);
                          //     setSubmitting(false);
                          //   });
                        }
                      })
                  }
                });
              } else {
                if (values.action === "PUBLISH") {
                  values.status = "GRN_RECEIVED";
                  postData(`orders/${id}/grn`, values)
                    .then((res) => {
                      if (res && res.data) {
                        getData(`orders/${id}/grn`)
                          .then((res) => {
                            if (res && res.data) {
                              let list = setGrnListData(res.data);
                              setGrnList(list);
                              setInitialValues({
                                ...initialValues,
                                products: [],
                                notes: "",
                              });
                              setSubmitting(false);
                            }
                          })
                          .catch((err) => {
                            console.log(err);
                            setSubmitting(false);
                          });
                      }
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                }
                if (values.action === "CLOSE") {
                  values.status = "COMPLETED";
                  putData(`orders/${id}`, values)
                    .then((resp) => {
                      if (resp && resp.data) {

                        history.push({
                          pathname: "/completed/" + id,
                          data: resp.data
                        })

                        // alert("Order Closed Successfully")

                        // getData(`orders/${id}/grn`)
                        //   .then((res) => {
                        //     if (res && res.data) {
                        //       let list = setGrnListData(res.data.data);
                        //       setGrnList(list);
                        //       setSubmitting(false);
                        //     }
                        //   })
                        //   .catch((err) => {
                        //     console.log(err);
                        //     setSubmitting(false);
                        //   });
                      }
                    })
                }
              }
            }}
          >
            {({ values, isSubmitting, setFieldValue }) => (
              <Form>
                {order && (
                  <>
                    <div className="row">
                      <div className="col-sm-12 text-right">
                        {order.data.status !== "PUBLISHED" &&
                          order.data.status !== "STOCKED" && (
                            <>
                              <button
                                type="button"
                                disabled={isSubmitting}
                                className="btn btn-sm btn-primary"
                                onClick={() => handleAction(orderData)}
                              >
                                {t("Edit")}
                              </button>
                              &nbsp;
                            </>
                          )}
                        <button
                          type="button"
                          disabled={isSubmitting}
                          className="btn btn-sm btn-primary"
                          onClick={() =>
                            generateInvoice(orderData, order, locations, t)
                          }
                        >
                          {t("Pdf")}
                        </button>
                      </div>
                    </div>
                    <br />
                  </>
                )}
                <InfoSection orderData={orderData} orderStatus={orderStatus} />
                <GrnTable grnList={grnList} {...{ productMap, locationMap }} />
                {values.products?.map((product, i) => (
                  <>
                    <CRow>
                      <CCol sm="3" style={{ marginTop: 10 }}>
                        <MuiAutocomplete
                          name={`products.${i}`}
                          placeholder={t("Product")}
                          data={products?.data?.content}
                          displayKey={"name"}
                          valueKey={"id"}
                          required={true}
                          onChange={(e, value) => {
                            if (value == null) {
                              setFieldValue(`products.${i}`, {
                                id: null,
                                productLocation: [
                                  {
                                    id: null,
                                    receivedNumberofUnits: 0,
                                    receivedPallets: 0,
                                    receivedQuantity: 0,
                                    damageNumberOfUnits: 0,
                                    damagedQuantity: 0,
                                    expiry: null,
                                    locationId: null,
                                    lotNumber: "",

                                  }]
                              });
                            }
                            else {
                              let product = value;
                              if (orderProductMap.get(value?.id)) {
                                product = orderProductMap.get(value?.id);
                              }
                              console.log(product);
                              setFieldValue(`products.${i}`, {
                                id: value?.id,
                                ...product,
                                productLocation: [
                                  {
                                    id: null,
                                    receivedNumberofUnits: 0,
                                    receivedPallets: 0,
                                    receivedQuantity: 0,
                                    damageNumberOfUnits: 0,
                                    damagedQuantity: 0,
                                    expiry: null,
                                    locationId: null,
                                    lotNumber: "",
                                  },
                                ],
                              });
                            }
                          }}
                          setFieldValue={setFieldValue}
                        />
                      </CCol>
                      {/* <CCol sm="9" style={{ marginTop: 40 }}>
                        <tr>
                          <th>
                            PALLETS &nbsp;: &nbsp;{product?.quantity ?? 0}
                          </th>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <th>
                            QUANTITY &nbsp;: &nbsp;
                            {product?.numberOfUnits ?? 0}
                          </th>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <th>RECEIVED &nbsp;: &nbsp;{locationDetails?.[i]?.rec}</th>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <th>SURPLUS &nbsp;: &nbsp;{locationDetails?.[i]?.sur}</th>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <th>LESS &nbsp;: &nbsp;{locationDetails?.[i]?.less}</th>
                        </tr>
                      </CCol> */}
                    </CRow>
                    {product?.productLocation?.map?.((locationField, index) => (
                      <CRow>
                        {!product.isFresh && (
                          <div className="col-sm-3">
                            <MyTextField
                              name={`products.${i}.productLocation.${index}.lotNumber`}
                              label={t("Lot Number")}
                              type="number"
                              disabled={!(!!product.id)}
                            />
                          </div>
                        )}
                        <div className="col-sm-3">
                          <MyTextField
                            name={`products.${i}.productLocation.${index}.receivedPallets`}
                            disabled={!(!!product.id)}
                            label={t("Received Pallets")}
                            type="number"
                            required
                            onBlur={(e) => {
                              setFieldValue(
                                `products.${i}.productLocation.${index}.receivedPallets`,
                                e.target.value
                              );
                              console.log(
                                e.target.value,
                                locationField.receivedPallets
                              );
                              if (
                                e.target.value ==
                                (locationField.receivedPallets ?? 0)
                              ) {
                              }
                              updateReceivedValues(
                                index,
                                product,
                                e.target.value,
                                false,
                                false,
                              );

                            }}
                          />
                        </div>
                        <div className="col-sm-3">
                          <MyTextField
                            name={`products.${i}.productLocation.${index}.receivedNumberofUnits`}
                            disabled={!(!!product.id)}
                            label={t("Received Qty")}
                            type="number"
                            required
                          />
                        </div>
                        <div className="col-sm-3">
                          <MyTextField
                            name={`products.${i}.productLocation.${index}.damageNumberOfUnits`}
                            disabled={!(!!product.id)}
                            label={t("Damaged Qty")}
                            type="number"
                          />
                        </div>
                        {product?.isExpiry && (
                          <div className="col-sm-3">
                            <MyDateField
                              disabled={!(!!product.id)}
                              name={`products.${i}.productLocation.${index}.expiry`}
                              label={"Expiry Date"}
                              setFieldValue={setFieldValue}
                              required={
                                locationField?.receivedPallets > 0
                                  ? true
                                  : false
                              }
                            />
                          </div>
                        )}
                        <div className="col-sm-3" style={{ marginTop: -20 }}>
                          {locations && (
                            <MuiAutocomplete
                              data={locations ?? []}
                              disabled={!(!!product.id)}
                              setFieldValue={setFieldValue}
                              placeholder={t("Location")}
                              displayKey={"name"}
                              name={`products.${i}.productLocation.${index}.locationId`}
                              valueKey="id"
                              val={
                                locations?.filter(
                                  (loc) =>
                                    loc.id ==
                                    values?.grn?.products?.[index]?.locationId
                                )?.[0] ?? null
                              }
                              required={
                                locationField?.receivedPallets > 0
                                  ? true
                                  : false
                              }
                            />
                          )}
                        </div>
                        {index + 1 === product.productLocation?.length && (
                          <>
                            <div className="col-sm-9">
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                disabled={
                                  product?.productLocation?.length === 1 ||
                                  disabled
                                }
                                onClick={() => {
                                  setFieldValue(
                                    `products.${i}.productLocation`,
                                    product.productLocation.splice(index, 1)
                                  );
                                  // updateReceivedValues(index, product, -values["receivedPallets" + locationField.name] ?? 0, true, false)
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
                                disabled={!(!!product.id)}
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() => {
                                  setFieldValue(
                                    `products.${i}.productLocation.${index + 1
                                    }`,
                                    {
                                      id: null,
                                      receivedNumberofUnits: 0,
                                      receivedPallets: 0,
                                      receivedQuantity: 0,
                                      damageNumberOfUnits: 0,
                                      damagedQuantity: 0,
                                      expiry: null,
                                      locationId: null,
                                      lotNumber: null,
                                    }
                                  );
                                  // updateReceivedValues(index, product, values["receivedPallets" + locationField.name] ?? locationField.locationFields?.receivedPallets ?? 0, false, true)
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
                          </>
                        )}
                        {index + 1 === product.productLocation?.length && (
                          <CCol sm="12">
                            <MyDropzone
                              name={`products.${i}.photos_`}
                              label="Photo"
                              setFieldValue={setFieldValue}
                              multiple
                            />
                          </CCol>
                        )}
                      </CRow>
                    ))}
                  </>
                ))}
                {values.status !== "COMPLETED" && <>
                  {values?.products?.length === 0 ? (
                    <div className="row">
                      <div className="col-sm-12 text-right">
                        <>
                          <button
                            style={{marginRight:"4px"}}
                            type="button"
                            disabled={isSubmitting}
                            className="btn btn-sm btn-primary"
                            onClick={() => addGrn(values, setFieldValue)}
                          >
                            {t("Add GRN")}
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-sm btn-danger"
                            onClick={() => { setFieldValue("action", "CLOSE") }}
                          >
                            {t("Close Order")}
                          </button>
                        </>
                      </div>
                      {/* <div className="col-sm-12 text-right">
                        <>
                          
                        </>
                      </div> */}
                    </div>
                  ) : (
                    <div className="row">
                      <div className="col-sm-12 text-right">
                        <>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            className="btn btn-sm btn-primary"
                            onClick={() => addGrn(values, setFieldValue)}
                          >
                            {t("Add Products")}
                          </button>
                        </>
                      </div>
                    </div>
                  )}
                </>
                }
                <br />
                {values?.products?.length > 0 &&
                  <>
                    <MyTextField
                      name="notes"
                      label={t("Notes")}
                      multiple
                      rows={3}
                    />
                    <div className="row">
                      <div className="col-sm-12 ">
                        <>
                          <button
                            style={{marginRight:"4px"}}
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-sm btn-success"
                            onClick={() => { setFieldValue("action", "PUBLISH") }}
                          >
                            {t("Stock & Publish")}
                          </button>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            className="btn btn-sm btn-danger"
                            onClick={() => { discard(values, setFieldValue) }}
                          >
                            {t("Discard")}
                          </button>
                          &nbsp;
                        </>
                      </div>
                    </div>
                    {/* <div className="row">
                      <div className="col-sm-12 ">
                        <>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            className="btn btn-sm btn-success"
                            onClick={() => { discard(values, setFieldValue) }}
                          >
                            {t("Discard")}
                          </button>
                          &nbsp;
                        </>
                      </div>
                    </div> */}
                  </>
                }
              </Form>
            )}
          </Formik>
        </CCardBody>
      </CCard>
    </>
  );
};
export default OrderDetails;

const reducer = (state, action) => {
  console.log(action);
  let [product, index, val] = action.payload;
  let rec = 0;
  let sur = 0;
  let less = 0;
  let l = [];
  l = product.productLocation;
  if (action.type === "del") {
    l.splice(index, 1);
  } else if (action.type === "add" || l.length == 0) {
    l.push({ rec: val });
  } else {
    l[index] = { rec: val };
  }
  l.map((o) => {
    rec = rec + +o.rec;
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
  // return { rec, sur, less };
  // state[index] = { rec, sur, less };
  return state;
};

const updateReceivedValues = (index, product, val, del, add) => {
  let rec = 0;
  let sur = 0;
  let less = 0;
  let l = [];
  console.log(product);
  l = product.productLocation;
  if (del) {
    l.splice(index, 1);
  } else if (add || l.length == 0) {
    l.push({ rec: val });
  } else {
    l[index] = { rec: val };
  }
  l.map((o) => {
    rec = rec + +o.rec;
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
  return { rec, sur, less };
};
