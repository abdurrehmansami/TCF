import { Button, Col, Descriptions, Form, InputNumber, Row } from "antd";
import { stringify, parse } from 'flatted';
import dayjs from "dayjs";
import {
  MyTextField,
  MyTimeField,
  MuiAutocomplete,
  MyDateField
} from "src/components/FormFieldsAnt";
import { useState, useEffect, useContext } from "react";
import useFetch from "../../../hooks/useFetch";
import {
  postData,
  postFormData,
  putData,
} from "../../../services/NetworkService";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../../UserProvider";
import Loading from "src/components/Loading";
import {
  save,
  updateProductLocationsMap,
  updateLocationFields,
  LoadPage,
  Comments,
} from "./LocationFieldsAnt";
import { useHistory } from "react-router";
import { postNotification } from "./OrderDetails";
import {
  CloseCircleOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import moment from "moment";
import DatePicker from "src/components/DatePicker";
import { Link } from "react-router-dom";
import { Upload } from "src/components/Upload";
import TimePicker from "src/components/TimePicker";
import { date } from "yup/lib/locale";
function OrderForm2(props) {
  const { t } = useTranslation();
  const [locQuantity] = useState(new Map());
  const history = useHistory();
  const { data: vendors } = useFetch("partners", null, 1000);
  const { data: employees } = useFetch("employees", null, 1000);
  const { data: products } = useFetch("products", null, 1000);
  const {data:sites} = useFetch("locations",null,1000)
  const [selectedProducts] = useState([]);
  const orderData = props.data;
  const edit = orderData ? true : false;
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isLoaded, setLoaded] = useState(false);
  const [employee, setEmployee] = useState(null);
  const { user } = useContext(UserContext);
  const [isSubmitting, setSubmitting] = useState(false);
  const [validateQuotation, setValidateQuotation] = useState(false);
  const [productLocationMap] = useState(new Map());
  const { data: warehouses } = useFetch("warehouses", null, 1000);
  const [locations, setLocations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderStatus, setOrderStatus] = useState(null);
  const id = orderData ? orderData.id : null;
  let [successMsg, setSuccessMsg] = useState("");
  const [err, setErr] = useState(false);
  const [locQuantityList] = useState(new Map());
  const [form] = Form.useForm();
  const [productOtherNames, setProductOtherNames] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [isFieldFilled, setIsFieldFilled] = useState(true);
  useEffect(() => {    
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
    if (edit && orderData && vendors) {
      setOrderStatus(orderData.status);
      setLoaded(true);
    }
    if (user && employees) {
      let emp = employees.data.content.find((o) => o.login.toLowerCase() === user.name.toLowerCase());
      if (emp?.id) {
        setEmployee(emp);
      }
      setLoaded(true);
    }
    if (orderData) {
      form.setFieldsValue({
        ...orderData,
        expectedDeliveryDate: orderData.expectedDeliveryDate
          ?  dayjs(
              moment(orderData.expectedDeliveryDate).format()
            ).utc()
          : null,
        expectedDeliveryTime: orderData.expectedDeliveryTime
          ? dayjs(
              moment(orderData.expectedDeliveryTime).format()
            ).utc()
          : null,
        deliveryDate: orderData.deliveryDate
          ?  dayjs(
              moment(orderData.deliveryDate).format()
            ).utc()
          : null,
        deliveryTime: orderData.deliveryTime
          ? dayjs(
              moment(orderData.deliveryTime).format()
            ).utc()
          : null,
        partnerId: orderData.partner?.id,
        products: orderData?.products?.map((p) => ({
          ...p,
          readOnly: true,
          productLocation: p.productLocation.map((loc) => ({
            ...loc,
            expiry: dayjs(moment.utc(loc.expiry).local().format("YYYY-MM-DD")),
          })),
          photos: p.photos.map((loc) => ({
            ...loc,
            uid: "-" + loc.id,
            name: loc.name || loc.id,
            url: loc.path,
            status: "done",
          })),
        })),
      });
      setOrders(orderData);
      updateProductLocationsMap(
        orderData.products,
        productLocationMap,
        locQuantity,
        locQuantityList
      );
    } else {
      form.setFieldsValue({products: [{                                        
        quantity: ""
      }]})
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
  }, [orders, employees, user, vendors, warehouses, setLocations]);

  useEffect(() => {
    try {
      if (orders !== null) {
        orders.products.forEach((product) => {
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
  }, [orders]);

  const setErrorMsg = () => {
    setErr(true);
    setSuccessMsg(
      t(
        "It looks there is an error while processing your request. Please report this issue to us so we can fix it Some error occured, Sorry for inconvenience, Please try again later"
      )
    );
    setTimeout(() => {
      setSuccessMsg("");
      setErr(false);
    }, 2500);
  };
  const setRespValues = (data, values) => {
    setSuccessMsg(t("YOUR_ORDER_IS_UPDATED_SUCCESSFULLY"));
    updateProductLocationsMap(
      data.data.products,
      productLocationMap,
      locQuantity,
      locQuantityList
    );
    values.products = data.data.products;
    values.comments = "";
    setOrderStatus(data.data.status);
    setTimeout(() => {
      setSuccessMsg("");
      // LoadPage(data.data.status, id, history);
      props.handleAction(data.data, "view");
    }, 2500);
  };

  const handleSubmit = (values) => {     
    const {
      deliveryDate,
      deliveryTime,
      partnerId,
      discountPercentage,
      discountedAmount,
      totalAmount,
    } = values;
    console.log('values:', values);
    const {expectedDeliveryDate,expectedDeliveryTime} = values.products;
    const products = [];
    const dataFiles = [];
    // const locationProducts =[]
    const site = values.site
    
    let artifect_types = "";
    let base_paths = "";
    var formData = new FormData();
    let formatD = dayjs(values.expectedDeliveryTime).utc(true)
    let extratime = (formatD.hour() * 3600 + formatD.minute() * 60 + formatD.second()) * 1000
    values.products.forEach(
      ({
        id,
        frozen,
        orderProductId,
        photos,
        productLocation,
        quantity,
        numberOfUnits,
        otherName,
        substituteName
      }) => {
        const productLocations = [];        
        productLocation?.forEach(
          ({
            damageNumberOfUnits,
            expiry,
            locationId,
            lotNumber,
            receivedNumberofUnits,
            receivedPallets,
          }) => {
            productLocations.push({
              damageNumberOfUnits,
              expiry,
              locationId,
              lotNumber,
              receivedNumberofUnits,
              receivedPallets,
            });
          }
        );
        const uploadedFiles = photos?.fileList?.filter((file) => {
          if (file.originFileObj) {
            dataFiles.push(file.originFileObj);
            if (artifect_types.length > 0) artifect_types += ",";
            artifect_types += "photo_";
            base_paths +=
              "/orders/" +
              orderData.id +
              "/" +
              "photo/orderproduct/" +
              orderProductId +
              ",";
          }
          return file.path;
        });

        products.push({
          id,
          frozen,
          orderProductId,
          photos: uploadedFiles || [],
          productLocation: productLocations,
          quantity,
          numberOfUnits,
          otherName: (otherName ? otherName : substituteName ? {
            name: substituteName,
            productId: id
          } : null)                   
        });
      }
    );
    
    
     if (deliveryDate) {
        let formatD = dayjs(deliveryDate).utc(true)
        let extratime = (formatD.hour() * 3600 + formatD.minute() * 60 + formatD.second()) * 1000
        values.deliveryDate = dayjs(formatD).valueOf() - extratime
      }
      if (deliveryTime) {
        let formatT = dayjs(deliveryTime).utc(true)
        values.deliveryTime = (formatT.hour() * 3600 + formatT.minute() * 60 + formatT.second()) * 1000
      }
     if (expectedDeliveryDate) {
        let formatD = dayjs(expectedDeliveryDate).utc(true)
        let extratime = (formatD.hour() * 3600 + formatD.minute() * 60 + formatD.second()) * 1000
        values.expectedDeliveryDate = dayjs(formatD).valueOf() - extratime
      }
      if (expectedDeliveryTime) {
        let formatT = dayjs(expectedDeliveryTime).utc(true)
        values.expectedDeliveryTime = (formatT.hour() * 3600 + formatT.minute() * 60 + formatT.second()) * 1000
      }
      
      const matchingSite = sites.data.content.find(site => site.name === values.site.name)

  
      const locationProducts = values.products.map((product) => {

        const {
          action,category,createdBy,createdOn,description,expectedDeliveryDate,expectedDeliveryTime,fields,flag,frozen,htPrice,imageUrl,isFresh,isExpiry,isOtherNamesDisabled,
          key,orderupdatedOn,value,updatedBy,unit,tva,subCategory,ref,prestashopProductId,order,
          productOtherNames,productLocation,priceVATinc,
          id,
          name,
          quantity,
          numberOfUnits,
          otherName,  // Add other attributes you want to include
        } = product;
      
        const dateWithoutTime = new Date(product.expectedDeliveryDate);
        dateWithoutTime.setHours(0, 0, 0, 0); // Set time to midnight
        // const timeObject = new Date(product.expectedDeliveryTime);
        const timestampDateWithoutTime = dateWithoutTime.getTime();
        const dateObject = new Date(product.expectedDeliveryTime);
        const hours = dateObject.getHours();
        const minutes = dateObject.getMinutes();
        
        const timestamp = hours * 60 * 60 * 1000 + minutes * 60 * 1000;
        const combinedTimestamp = timestampDateWithoutTime + timestamp;
        console.log('EACH',product)

        // Now 'timestamp' holds the total milliseconds since midnight.
        // combined ki jaga timestamp bhjdo
        
        return {
          product: { action,category,createdBy,createdOn,description,expectedDeliveryDate,expectedDeliveryTime,fields,flag,frozen,htPrice,imageUrl,isFresh,isExpiry,isOtherNamesDisabled,
            key,orderupdatedOn,value,updatedBy,unit,tva,subCategory,ref,prestashopProductId,order,
            productOtherNames,productLocation,priceVATinc,
            id,
            name,
            quantity,
            numberOfUnits,
            otherName},
          expectedDeliveryDate: timestampDateWithoutTime,
          expectedDeliveryTime: timestamp, 
         location: matchingSite
        };
      });
      

    const payload = {
      discountPercentage,
      discountedAmount,
      employee,
      products,
      totalAmount,
      deliveryDate: values.deliveryDate,
      deliveryTime: values.deliveryTime,
      id: orderData?.id,
      expectedDeliveryDate: values.expectedDeliveryDate,
      expectedDeliveryTime: values.expectedDeliveryTime,
      partner: { id: partnerId },
    };

    if (edit) {
      const id = orderData.id;
      if (dataFiles.length === 0) {
        payload.photos = [];
        payload.id = id;
        putData("orders/" + id, payload).then((resp) => {
          if (resp.data) {            
            setSubmitting(false);
            // LoadPage(resp.data.data.status, id, history);
            props.handleAction(resp.data.data, "view");
            postNotification(resp.data, t);
            return;
          }
        });
      } else {
        base_paths = base_paths.slice(0, -1);
        formData.append("artifect_type", artifect_types);
        formData.append("base_path", base_paths);
        dataFiles.map((o) => {
          return formData.append("dataFiles", o);
        });
        postFormData(formData)
          .then(async (res) => {
            if (res && res.data.files) {
              // res.data.files.map((file) => ({
              //   path: file.path,
              //   mimeType: file.mimetype,
              //   title: file.filename,
              //   description: values.description,
              //   mediaType: file.artifect_type,
              // }));
              res.data?.files?.map((file) => {
                const orderProductIdRaw = file.path?.split("/orderproduct/")[1];
                const [orderProductId] = orderProductIdRaw.split("/");                
                payload.products.map((product) => {
                  if (
                    orderProductId &&
                    product.orderProductId.toString() ===
                    orderProductId.toString()
                  ) {
                    product.photos.push({
                      ...file,
                      name: file.filename,
                      mimeType: file.mimetype,
                    });
                  }
                });
              });
              const resp = await putData("orders/" + id, payload);
              if (resp.data) {                
                // LoadPage(resp.data.data.status, id, history);
                props.handleAction(resp.data.data, "view");
                setSubmitting(false);
                postNotification(resp.data, t);
              }
            }
          })
          .catch((error) => {
            setErrorMsg();
          });
      }
    } else {
        let formatD = dayjs(values.expectedDeliveryDate).utc(true)
        let formatT = dayjs(values.expectedDeliveryTime).utc(true)
        let extratime = (formatD.hour() * 3600 + formatD.minute() * 60 + formatD.second()) * 1000
        let expectedDeliveryDate = dayjs(formatD).valueOf() - extratime
        let expectedDeliveryTime = (formatT.hour() * 3600 + formatT.minute() * 60 + formatT.second()) * 1000
        postData("orders", 
        {
          discountPercentage,
          discountedAmount,
          employee,
          // products,
          totalAmount,
          expectedDeliveryDate: expectedDeliveryDate,
          expectedDeliveryTime: expectedDeliveryTime,
          partner: { id: partnerId },
          locationProducts
        }
        
        )
          .then(async (response) => {
            const id = response.data.data.id;
            if (dataFiles.length === 0) {
              setSubmitting(false);
              // LoadPage(response.data.data.status, id, history);
              props.handleAction(response.data.data, "view");
              postNotification(response.data, t);
              return;
            }
            artifect_types.split(",").map((type) => {
              return (base_paths += "/orders/" + id + "/" + type + ",");
            });
            base_paths = base_paths.slice(0, -1);
            formData.append("base_path", base_paths);
            dataFiles.map((o) => {
              return formData.append("dataFiles", o);
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
              payload.photos = files;
              payload.id = id;
              const resp = await putData("orders/" + id, payload);
              if (resp.data) {              
                // LoadPage(resp.data.data.status, id, history);
                props.handleAction(resp.data.data, "view");
                postNotification(resp.data, t);
                setSubmitting(false);
              }
            } else {
              setErrorMsg();
            }
          })
          .catch((error) => {
            setSubmitting(false);
            alert(error);
          });
    }
  };

  const onSelect = (option) => {
    const frm = form.getFieldsValue();
    frm.partnerId = option.id;
    setTimeout(() => {
      form.setFieldsValue(frm);
    }, 100);    
  };
  const onSelect2 = (option) => {
    const frm = form.getFieldsValue();
    frm.siteId = option.id;
    setTimeout(() => {
      form.setFieldsValue(frm);
    }, 100);    
  };

  const calculatePrice = (values,changedField) => {
    let amt = 0;
    let quantity = 0;
    let numberOfUnits = 0;

    let isPalletFilled = false;
    let isQuantityFilled = false;

    values.products.forEach((product) => {
      if (product.htPrice) {
        amt += product.htPrice * (product.quantity || 0);
        quantity += product.quantity || 0;
        numberOfUnits += product.numberOfUnits || 0;

         // Check if either "PALLET" or "QUANTITY" is filled
        if (product.quantity) {
          isQuantityFilled = true;
        }
        if (product.numberOfUnits) {
          isPalletFilled = true;
        }
      }
    });

    values.totalAmount = parseFloat(amt.toFixed(2));
    values.quantity = quantity;
    values.numberOfUnits = numberOfUnits;
    if (changedField === "quantity") {
      setIsFieldFilled(!(isPalletFilled || isQuantityFilled));
    } else if (changedField === "numberOfUnits") {
      setIsFieldFilled(!(isPalletFilled || isQuantityFilled));
    }
    form.setFieldsValue(values);
  };  
  return !isLoaded ? (
    <Loading />
  ) : (
    <>
      <Form
        layout="vertical"
        form={form}
        resetForm={true}
        key={formKey}
        onFinish={(values) => {          
          if (orderStatus === "STOCKED") {
            save(
              values,
              setSubmitting,
              productLocationMap,
              orderData,
              id,
              updateLocationFields,
              setRespValues
            );
          } else {
            handleSubmit(values);
          }
        }}
      >
        {({ values }) => (
          <>
            <Descriptions style={{ marginBottom: 20 }}>
              <Descriptions.Item label={t("ORDER_NUMBER")}>
                {orders ? orders.number : null}
              </Descriptions.Item>
              <Descriptions.Item label={t("STATUS")}>
                {t(orderStatus)}
              </Descriptions.Item>
            </Descriptions>
            {vendors && (
              <MuiAutocomplete
                data={vendors.data.content}
                placeholder={t("ENTER_VENDORS")}
                displayKey={"name"}
                name={["partner", "name"]}
                onSelect={onSelect}
                label={t("Enter Vendor")}
                required
              />
            )}
            {sites && (
              <MuiAutocomplete
                data={sites.data.content}
                placeholder={t("Enter Site")}
                displayKey={"name"}
                name={["site","name"]}
                onSelect={onSelect2}
                label={t("Enter Site")}
                required
              />
            )}
           
            <div style={{ display: "none" }}>
              <MyTextField name={"partnerId"} type="hidden" />
              <MyTextField name={"quantity"} type="hidden" />
              <MyTextField name={"numberOfUnits"} type="hidden" />
              <MyTextField name={"totalAmount"} type="hidden" />
              <MyTextField name={"discountPercentage"} type="hidden" />
              <MyTextField name={"discountedAmount"} type="hidden" />
            </div>
            {orderStatus === "STOCKED" || orderStatus === "RECEIVED" ? null : (
              <Form.List name="products">
                {(fields, { add, remove }) => {

                  return (
                    <>
                      {fields.map((field, index) => {
                        const row = form.getFieldValue([
                          "products",
                          field.name,
                        ]);
                        return (
                          <Row key={field.name} gutter={20}>
                            <Col xs={8}>
                              {products && (
                                <MuiAutocomplete
                                  {...field}
                                  required
                                  label={t("PRODUCT")}
                                  disabled={
                                    row.readOnly ||
                                    orderStatus === "PUBLISHED" ||
                                    orderStatus === "CANCELLED"
                                  }
                                  onSelect={({ quantity, ...option }) => {                           
                                    const previousValues = form.getFieldValue([
                                      "products",
                                      field.name,
                                    ]);
                                    form.setFieldValue(
                                      ["products", field.name],
                                      { ...previousValues, ...option }
                                    );
                                    const productNames = form.getFieldValue(["products",field.name])
                                    setProductOtherNames(productNames?.otherNames)
                                    const productOtherNames = option.otherNames || []
                                    form.setFieldValue(['products',field.name,'productOtherNames'],productOtherNames)
                                    const isOtherNamesDisabled = !productOtherNames || productOtherNames.length === 0;
                                    form.setFieldValue(['products',field.name,"isOtherNamesDisabled"],isOtherNamesDisabled);
                                    
                                    setFormKey((formKey) => formKey + 1)
                                    calculatePrice(form.getFieldsValue());
                                  }}
                                  message={t("PLEASE_SELECT_A_PRODUCT")}
                                  data={products.data.content}
                                  placeholder={t("SELECT_A_PRODUCT")}
                                  displayKey={"name"}
                                  name={[field.name, "name"]}
                                />
                              )}
                            </Col>                                                     
                              <Col xs={8}>
                                {products && (
                                  <MuiAutocomplete
                                    {...field}                                    
                                    label={t("Other Names")}
                                    disabled={
                                      row.readOnly ||
                                      orderStatus === "PUBLISHED" ||
                                      orderStatus === "CANCELLED" ||
                                      form.getFieldValue(["products", field.name, "isOtherNamesDisabled"])
                                      // !productOtherNames || productOtherNames === 0
                                    }
                                    data={productOtherNames || []}
                                    placeholder={t("SELECT_A_DIFFERENT_PRODUCT_NAME")}
                                    displayKey={"name"}
                                    name={[field.name, "otherName"]}
                                    onSelect={(selectedOption) => {
                                      form.setFieldValue(["products", field.name, "otherName"], selectedOption)
                                    }} 
                                    onBlur={(event)=>{
                                      if (form.getFieldValue(['products',field.name,"otherName"])?.id === undefined) {
                                        form.setFieldValue(['products',field.name,"otherName"],'') 
                                      }
                                    }}
                                  />
                                )}
                              </Col>  
                              <Row gutter={20}>                 
                            <Col xs={8} md={6}>
                              <MyTextField
                                disabled={
                                  row.readOnly ||
                                    orderStatus === "PUBLISHED" ||
                                    orderStatus === "CANCELLED" ||
                                    row.otherName ? true : false 
                                    // (productOtherNames && productOtherNames.length > 0)
                                }
                                placeholder={t("")}
                                name={[field.name, "substituteName"]}
                                label={t("Substitue Name")}
                                type="text"
                              />
                            </Col>
                            <Col xs={8} md={4}>
                              <MyTextField
                                disabled={
                                  row.readOnly ||
                                  orderStatus === "PUBLISHED" ||
                                  orderStatus === "CANCELLED"
                                }
                                placeholder={t("PALLET")}
                                name={[field.name, "quantity"]}
                                label={t("PALLET")}
                                // required={!(row.quantity || row.numberOfUnits)}
                                type="number"
                                onChange={() => {
                                  calculatePrice(form.getFieldsValue(),"quantity");
                                }}
                              />
                            </Col>
                            <Col xs={8} md={4}>
                              <MyTextField
                                disabled={
                                  row.readOnly ||
                                  orderStatus === "PUBLISHED" ||
                                  orderStatus === "CANCELLED"
                                }
                                placeholder={t("QUANTITY")}
                                name={[field.name, "numberOfUnits"]}
                                label={t("QUANTITY")} 
                                required={!(row.numberOfUnits)}
                                type="number"
                                onChange={() => {  
                                  calculatePrice(form.getFieldsValue(),"numberOfUnits");
                                }}
                                val={values?.numberOfUnits || null}
                              />
                            </Col>
                            </Row>
                              <Row >     
                                <Col xs={8} md={15}>
                                
                                  {/* <Form.Item
                                    name="expectedDeliveryDateEach"
                                    label={t("Expected Delivery Date")}
                                    rules={[{ required: true }]}
                                  > */}
                                  {/* <Form.Item > */}
                                    {/* <DatePicker format={"DD/MM/YYYY"} style={{ width: "100%" }} name="expectedDeliveryDate" placeholder={t("Expected Delivery Date")} required
                                    value={values?.expectedDeliveryDate}
                                    onChange={(date) => form.setFieldValue('expectedDeliveryDate', date)}/> */}
                                  {/* </Form.Item> */}
                                  <Form.Item name={[field.name, "expectedDeliveryDate"]} label={t("Expected Delivery Date")} rules={[{ required: true }]}>
                                    <DatePicker format={"DD/MM/YYYY"} style={{ width: "100%" }} placeholder={t("Expected Delivery Date")} required />
                                  </Form.Item>

                                </Col>
                                <Col xs={8} md={15} style={{marginTop:30}}>
                                  {/* <MyTimeField
                                    name="expectedDeliveryTime"
                                    // label={t("EXPECTED_DELIVERY_TIME")}
                                    required
                                  /> */}
                                  <Form.Item name={[field.name, "expectedDeliveryTime"]} label={t("Expected Delivery Time")} rules={[{ required: true }]}>
                                    <MyTimeField required />
                                  </Form.Item>

                                </Col> 
                              </Row>
                                <hr/>
                            <Col> 
                              <Form.Item label="&nbsp;">
                                <Button
                                  disabled={
                                    index === 0 ||
                                    orderStatus === "STOCKED" ||
                                    orderStatus === "PUBLISHED" ||
                                    orderStatus === "CANCELLED"
                                  }
                                  type="dashed"
                                  danger
                                  onClick={() => remove(field.name)}
                                  icon={<CloseCircleOutlined />}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        );
                      })}
                      <hr/>
                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={add}
                          disabled={
                            orderStatus === "PUBLISHED" ||
                            orderStatus === "CANCELLED"
                          }
                          icon={<PlusCircleOutlined />}
                        >
                          Add More
                        </Button>
                      </Form.Item>
                    </>
                  );
                }}
              </Form.List>
            )}
            {["RECEIVED", "STOCKED"].includes(orderStatus) && (
              <>
                <Form.List name="products">
                  {(fields) => (
                    <>
                      {fields.map((f, index) => {
                        const row = form.getFieldValue(["products", f.name]);
                        console.log("row", row, form.getFieldsValue());
                        const readOnly = orderStatus === "STOCKED";
                        return (
                          <div key={f.name}>
                            <Descriptions
                              size="small"
                              colon={false}
                              column={5}
                              style={{ marginBottom: 20 }}
                              labelStyle={{
                                color: "#101828",
                                fontWeight: 600,
                                fontSize: 14,
                              }}
                              contentStyle={{
                                color: "#667085",
                                fontWeight: 400,
                                fontSize: 14,
                              }}
                            >
                              <Descriptions.Item
                                span={5}
                                label={
                                  <>
                                    <span style={{ color: "red" }}>
                                      {index + 1}.
                                    </span>{" "}
                                    {t("NAME")}
                                  </>
                                }
                              >
                                {readOnly ? (
                                  <Link to={`products/${row.id}`}>
                                    {row.otherName ? row.otherName.name : row.name}
                                  </Link>
                                ) : (
                                  row.otherName ? row.otherName.name : row.name
                                )}
                              </Descriptions.Item>
                              <Descriptions.Item span={1} label={t("PALLETS")}>
                                {row.quantity || 0}
                              </Descriptions.Item>
                              <Descriptions.Item span={1} label={t("QUANTITY")}>
                                {row.numberOfUnits}
                              </Descriptions.Item>
                              <Descriptions.Item span={1} label={t("RECEIVED")}>
                                {locQuantity?.get(row.id)?.rec ?? 0}
                              </Descriptions.Item>
                              <Descriptions.Item span={1} label={t("SURPLUS")}>
                                {locQuantity?.get(row.id)?.sur ?? 0}
                              </Descriptions.Item>
                              <Descriptions.Item span={1} label={t("LESS")}>
                                {locQuantity?.get(row.id)?.less ?? 0}
                              </Descriptions.Item>
                            </Descriptions>
                            <Form.List name={[f.name, "productLocation"]}>
                              {(nf, { add, remove }) => (
                                <>
                                  {nf.map((field, i) => {
                                    return (
                                      <Row
                                        gutter={20}
                                        key={f.name + "_" + field.name}
                                      >
                                        <Col>
                                          <Form.Item
                                            label={
                                              i === 0 ? t("LOT_NUMBER") : null
                                            }
                                            name={[field.name, "lotNumber"]}
                                          >
                                            <InputNumber
                                              disabled={readOnly}
                                              style={{ width: 130 }}
                                              placeholder={t("LOT_NUMBER")}
                                            />
                                          </Form.Item>
                                        </Col>
                                        <Col>
                                          <Form.Item
                                            label={
                                              i === 0
                                                ? t("RECEIVED_PALLETS")
                                                : null
                                            }
                                            name={[
                                              field.name,
                                              "receivedPallets",
                                            ]}
                                          >
                                            <InputNumber
                                              disabled={readOnly}
                                              style={{ width: 130 }}
                                              placeholder={t(
                                                "RECEIVED_PALLETS"
                                              )}
                                            />
                                          </Form.Item>
                                        </Col>
                                        <Col>
                                          <Form.Item
                                            label={
                                              i === 0 ? t("RECEIVED_QTY") : null
                                            }
                                            name={[
                                              field.name,
                                              "receivedNumberofUnits",
                                            ]}
                                          >
                                            <InputNumber
                                              disabled={readOnly}
                                              style={{ width: 130 }}
                                              placeholder={t("RECEIVED_QTY")}
                                            />
                                          </Form.Item>
                                        </Col>
                                        <Col>
                                          <Form.Item
                                            label={
                                              i === 0 ? t("DAMAGED_QTY") : null
                                            }
                                            name={[
                                              field.name,
                                              "damageNumberOfUnits",
                                            ]}
                                          >
                                            <InputNumber
                                              disabled={readOnly}
                                              style={{ width: 130 }}
                                              placeholder={t("DAMAGED_QTY")}
                                            />
                                          </Form.Item>
                                        </Col>
                                        <Col>
                                          <Form.Item
                                            label={
                                              i === 0 ? t("EXPIRY_DATE") : null
                                            }
                                            name={[field.name, "expiry"]}
                                          >
                                            <DatePicker
                                              disabled={readOnly}
                                              style={{ width: 130 }}
                                              format={"DD/MM/YYYY"}
                                              placeholder={t("EXPIRY_DATE")}
                                            />
                                          </Form.Item>
                                        </Col>
                                        <Col md={4}>
                                          {locations && (
                                            <MuiAutocomplete
                                              {...field}
                                              required
                                              label={
                                                i === 0 ? t("LOCATION") : null
                                              }
                                              disabled={
                                                row.readOnly ||
                                                orderStatus === "PUBLISHED" ||
                                                orderStatus === "CANCELLED"
                                              }
                                              message={t(
                                                "PLEASE_SELECT_A_LOCATION"
                                              )}
                                              data={locations}
                                              placeholder={t(
                                                "SELECT_A_LOCATION"
                                              )}
                                              displayKey={"name"}                                              
                                              name={[field.name, "locationId"]}
                                            />
                                          )}
                                        </Col>
                                        {readOnly ? null : (
                                          <Col style={{ width: 40 }}>
                                            <Form.Item
                                              label={i === 0 ? " " : null}
                                            >
                                              <Button
                                                type="dashed"
                                                icon={
                                                  <MinusCircleOutlined
                                                    width={14}
                                                    height={14}
                                                  />
                                                }
                                                danger
                                                onClick={() =>
                                                  remove(field.name)
                                                }
                                              />
                                            </Form.Item>
                                          </Col>
                                        )}
                                      </Row>
                                    );
                                  })}
                                  {readOnly ? null : (
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: 20,
                                        marginBottom: 20,
                                      }}
                                    >
                                      <Button
                                        onClick={add}
                                        block
                                        type="dashed"
                                        icon={<PlusOutlined />}
                                      >
                                        <span>Add</span>
                                      </Button>
                                    </div>
                                  )}
                                </>
                              )}
                            </Form.List>
                            <Form.Item
                              name={[f.name, "photos"]}
                              label={t("PHOTO")}
                            >
                              <Upload
                                className="image-upload-grid"
                                prefix={orderData?.id || ""}
                                disabled={readOnly}
                              >
                                <div>
                                  Drag &amp; drop or{" "}
                                  <u className="text-primary">browse</u>
                                </div>
                              </Upload>
                            </Form.Item>
                          </div>
                        );
                      })}
                    </>
                  )}
                </Form.List>
              </>
            )}
            {/* <Row gutter={20}>
              <Col xs={8} md={6}>
                <Form.Item
                  name="expectedDeliveryDate"
                  label={t("Expected Delivery Date")}
                  rules={[{ required: true }]}
                >
                  <DatePicker format={"DD/MM/YYYY"} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={8} md={6}>
                <MyTimeField
                  name="expectedDeliveryTime"
                  label={t("EXPECTED_DELIVERY_TIME")}
                  required
                />
                </Col> */}
                {/* {!["NEW", "VALIDATED"].includes(orderStatus) &&
                  <>
                  <Col xs={8} sm={6} md={6}>
                    <Form.Item
                      name="deliveryDate"
                      label={t("DELIVERY_DATE")}
                      rules={[{ required: true }]}
                    >
                      <DatePicker
                        format={"DD/MM/YYYY"}
                        style={{ width: "100%" }}
                        defaultValue={null}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={8} sm={6} md={6}>
                    <Form.Item
                      name="deliveryTime"
                      label={t("DELIVERY_TIME")}
                      rules={[{ required: true }]}
                      >
                      <TimePicker
                        format={"hh:mm A"}
                        use12Hours
                        showSecond={false}
                        style={{ width: "100%" }}
                        defaultValue={null}
                        />
                    </Form.Item>
                  </Col>
                        </>
                      } */}
            {/* </Row> */}
            {!(orderStatus === "STOCKED") && (
              <Button type="primary" htmlType="submit" disabled={isSubmitting}>
                {t("SUBMIT")}
              </Button>
            )}
            {orderStatus === "STOCKED" && (
              <Button htmlType="submit" disabled={isSubmitting}>
                {t("SAVE")}
              </Button>
            )}
          </>
        )}
      </Form>
    </>
  );
}
export default OrderForm2;
