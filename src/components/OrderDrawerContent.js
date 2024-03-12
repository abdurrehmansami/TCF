import {
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Select,
  Table,
  Tag,
  Typography,
  notification,
  theme,
  Collapse,
  Empty,
  Upload as Uploader,
  Divider,
  Popover,
  Tooltip
} from "antd";
import { CloseOutlined, Icon, InfoCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import { Upload } from "./Upload";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CBreadcrumbRouter from "src/components/CBreadcrumbRouter";
import useFetch from "src/hooks/useFetch";
import routes from "src/routes";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import {
  postFormData,
  putData,
  postData,
  getData,
} from "src/services/NetworkService";
import {
  Comments,
  // LoadPage,
  updateProductLocationsMap,
} from "src/views/dashboard/order/LocationFieldsAnt";
import { useHistory } from "react-router";
import { postNotification } from "src/views/dashboard/order/OrderDetails";
import { UserContext } from "src/UserProvider";
import DatePicker from "./DatePicker";
import TimePicker from "./TimePicker";
import dayjs from "dayjs";
import {
  MinusCircleOutlined,
  PlusOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { MuiAutocomplete, MyTextField } from "src/components/FormFieldsAnt";
import { Tab } from "@coreui/coreui";
import { red } from "@material-ui/core/colors";
var utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const OrderDrawerContent = ({ data: orderData, handleAction }) => {
  const [fileList, setFileList] = useState([]);
  const [locations, setLocations] = useState([]);
  let files = [];
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
  const { data: warehouses } = useFetch("warehouses", null, 1000);
  const { data: sites } = useFetch("locations", null, 1000);
  const [data, setOrderData] = useState(orderData);
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSubmitting, setSubmitting] = useState(true);
  const { data: user } = useFetch("employeeprofile");
  const { data: emps } = useFetch("employees", null, 1000);
  const { user: user_ } = useContext(UserContext);
  const [productLocationMap] = useState(new Map());
  const [locQuantity] = useState(new Map());
  const [locQuantityList] = useState(new Map());
  const [formKey, setFormKey] = useState(0);
  const { data: products } = useFetch("products", null, 1000);
  const { data: grn } = useFetch(`orders/${orderData.id}/grn`);
  const [grnTable, setGrnTable] = useState([]);
  const [productMap, setProductMap] = useState(new Map());
  const [showGRN, setShowGRN] = useState(false);
  const [grnTableItems, setGrnTableItems] = useState();
  const [lastAddedGRNStatus, setLastAddedGRNStatus] = useState(null)
  const [productItems, setProductItems] = useState();
  const [isVirtualGRN, setIsVirtualGRN] = useState(false);
  const [generatedGRNNumber, setGeneratedGRNNumber] = useState("");
  const [generatedReceivedDate, setGeneratedReceivedDate] = useState(null);
  const [locationOptions, setLocationOptions] = useState(null)
  const [selectedProductNames, setSelectedProductNames] = useState([])
  const [productList, setProductList] = useState(null)
  const [Products, setProducts] = useState(null)
  const [productsInCurrentOrder,setproductsInCurrentOrder] =  useState(null)
  console.log('selectedProductNames', selectedProductNames)
  console.log('productList', productList)
  console.log('Products', Products)
  useEffect(() => {
    if(products){
      let _products = products.data?.content.map(item=>({...item, value: item.name}))
      setProducts(_products)
    }
  }, [products])

  useEffect(() => {
    if(isVirtualGRN && /*products?.data?.content*/Products) {
      let prodList = Products.filter(item=>!selectedProductNames.includes(item.name))
      setProductList(prodList);
    }
  }, [selectedProductNames])
  
  const ProductSelect = ({f, index, add, remove, form, values}) => {
    console.log('values.products', values.products)
    return(
      <Form.Item
        name={[f.name, "name"]}
        required
      >
        <Select
          showSearch
          placeholder="Select a product"
          optionFilterProp="name"
          onChange={(val, option)=>{
            const previousValues =
              form.getFieldValue([
                "products",
                f.name,
              ]);
            form.setFieldValue(
              ["products", f.name],
              { ...previousValues, ...option }
            );
            const selectedProduct = form.getFieldValue([
              "products",
              f.name,
            ]); 
            form.setFieldValue(
              [
                "products",
                f.name,
                "productLocation",
                0,
              ],
              {
                lotNumber: isVirtualGRN ? (selectedProduct.isFresh || selectedProduct.isExpiry) ? "LN" + moment().format("YYMMDDHHmm") + index : "" : "",
                receivedPallets: "",
                receivedNumberofUnits: "",
                damageNumberOfUnits: "",
                expiry: isVirtualGRN ? selectedProduct.isExpiry ? moment().add(1, 'months') :  "" : "",
                location: {
                  name: "",
                },
              }
            );

            setFormKey(
              (formKey) => formKey + 1
            );
            if(isVirtualGRN) {
              let newState = [...selectedProductNames];
              newState[f.name] = selectedProduct.name;
              setSelectedProductNames(newState);
            }
          }}
          filterOption={(input, option) =>(option?.name ?? "").toLowerCase().includes(input.toLowerCase())}
          options={isVirtualGRN && productList ? productList : Products}
        />
        {/* <MuiAutocomplete
          {...f}
          required
          onClear={()=>{
            if(values.isVirtual) {
              let newNameState = selectedProductNames.length>0 ? selectedProductNames.filter((item,i) => i !== f.name) : [];
              setSelectedProductNames(newNameState);
            }
            add("", index)
            remove(index+1)
          }}
          onSelect={({
            quantity,
            ...option
          }) => {
            const previousValues =
              form.getFieldValue([
                "products",
                f.name,
              ]);
              console.log('previousValues', previousValues)
            form.setFieldValue(
              ["products", f.name],
              { ...previousValues, ...option }
            );
            const selectedProduct = form.getFieldValue([
              "products",
              f.name,
            ]); 
            form.setFieldValue(
              [
                "products",
                f.name,
                "productLocation",
                0,
              ],
              {
                lotNumber: isVirtualGRN ? (selectedProduct.isFresh || selectedProduct.isExpiry) ? "LN" + moment().format("YYMMDDHHmm") + index : "" : "",
                receivedPallets: "",
                receivedNumberofUnits: "",
                damageNumberOfUnits: "",
                expiry: isVirtualGRN ? selectedProduct.isExpiry ? moment().add(1, 'months') :  "" : "",
                location: {
                  name: "",
                },
              }
            );

            setFormKey(
              (formKey) => formKey + 1
            );
            if(isVirtualGRN) {
              let newState = [...selectedProductNames];
              newState[f.name] = selectedProduct.name;
              setSelectedProductNames(newState);
            }
          }}
          message={t("PLEASE_SELECT_A_PRODUCT")}
          // data={!isVirtualGRN ? products?.data?.content : (productList ?? products?.data?.content ?? [])}
          data={isVirtualGRN && productList ? productList : Products}
          placeholder={t("SELECT_A_PRODUCT")}
          displayKey={"name"}
          name={[f.name, "name"]}
        /> */}
      </Form.Item>
    )
  }

  const pathList = {
    ALL: "orders",
    NEW: "/new",
    VALIDATED: "/validated",
    CONFIRMED: "/confirmed",
    RECEIVED: "/received",
    STOCKED: "/stocked",
    PUBLISHED: "/published",
    CANCELLED: "/cancelled",
  };
  useEffect(() => {
    if (orderData?.status) {
      window.history.pushState(
        null,
        "",
        pathList[orderData.status] ?? window.location.pathname
      );
      history.location.pathname =
        pathList[orderData.status] ?? window.location.pathname;
    }
  }, [orderData.status]);

  useEffect(() => {
    // if (warehouses?.data?.content?.length) {
    //   let loc = [], locOpt = [];
    //   warehouses.data.content.forEach((warehouse) => {
    //     warehouse.locations.forEach((location) => {
    //       let locObj = {
    //         // label: warehouse.name + " - " + location.name,
    //         value: warehouse.name + " - " + location.name,
    //         name: warehouse.name + " - " + location.name,
    //         id: location.id,
    //       };
    //       loc.push(locObj);
    //       // locOpt.push({label: JSON.stringify(warehouse.name + " - " + location.name), value: JSON.stringify(warehouse.name + " - " + location.name)})
    //     });
    //   });
    //   setLocations(loc);
    //   // setLocationOptions(locOpt);
    //   setSubmitting(false);
    // }
    if (sites?.data?.content?.length) {
      let loc = [], locOpt = [];
      sites.data.content.forEach((site) => {
       
          let locObj = {
            // label: warehouse.name + " - " + location.name,
            value: site.name + " - " + site.address,
            name: site.name + " - " + site.address,
            id: site.id,
          };
          loc.push(locObj);
          // locOpt.push({label: JSON.stringify(warehouse.name + " - " + location.name), value: JSON.stringify(warehouse.name + " - " + location.name)})
      
      });
      setLocations(loc);
      // setLocationOptions(locOpt);
      setSubmitting(false);
    }
    if (orderData.products) {
      let productsInOrder = [];
      orderData.products.forEach((product) => {
       
          let locObj = {
            // label: warehouse.name + " - " + location.name,
            
            id: product.orderProductId,
          };
          productsInOrder.push(locObj);
          // locOpt.push({label: JSON.stringify(warehouse.name + " - " + location.name), value: JSON.stringify(warehouse.name + " - " + location.name)})
      
      });
      setproductsInCurrentOrder(productsInOrder);
      // setLocationOptions(locOpt);
      setSubmitting(false);
    }

    if (data) {
      updateProductLocationsMap(
        data.products,
        productLocationMap,
        locQuantity,
        locQuantityList
      );
      populateProductsTable(data);
    }

    if (data && warehouses?.data?.content?.length) {
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
      const products = form.getFieldValue("products");
      products?.map((product) => {
        product.productLocation?.map((location) => {
          loc.map((warehouseLocation) => {
            if (location.locationId == warehouseLocation.id) {
              location.location = warehouseLocation;
            }
          });
        });
      });
    }
  }, [data, user_, emps, warehouses]);

  const populateProductsTable = (data) => {
    let tableItems = [];
    tableItems.push({
      key: data.id,
      label: "Products",
      children: (
        <div className="table-responsive">
          <Table
            dataSource={data.products}
            pagination={data.products.length > 10}
            columns={[
              {
                dataIndex: "id",
                key: "id",
                title: t("ID"),
                sorter: (a, b) => a.id - b.id,
              },
              {
                dataIndex: "otherName" ? ["otherName", "name"] : "name",
                key: "name",
                title: t("PRODUCT_NAME"),
                sorter: (a, b) => a.name?.length - b.name?.length,
                render: (text, record) =>
                  record.otherName ? text : record.name,
              },
              {
                dataIndex: "numberOfUnits",
                key: "numberOfUnits",
                title: t("QTY"),
                sorter: (a, b) => a.numberOfUnits - b.numberOfUnits,
              },
              // {
              //   dataIndex: "quantity",
              //   key: "quantity",
              //   title: t("PALLETS"),
              //   sorter: (a, b) => a.quantity - b.quantity,
              // },
              {
                dataIndex: "expectedDeliveryDate",
                key: "expectedDeliveryDate",
                title: t("Expected Delivery Date"),
                render:  (text) => text ? moment(text).format('LL') : '-',
                // sorter: (a, b) => a.quantity - b.quantity,
              },
              {
                dataIndex: "expectedDeliveryTime",
                key: "expectedDeliveryTime",
                title: t("Expected Delivery Time"),
                render: (text)=> text ? moment(text).format('LT') : '-',
                // sorter: (a, b) => a.quantity - b.quantity,
              },
              
              // {
              //   dataIndex: "site",
              //   key: "siteId",
              //   title: t("Site ID"),
              //   render: (site) => (site && site.id) ? site.id : '-',
              // },
              {
                dataIndex: "orderProductId",
                key: "orderProductId",
                title: t("Order Product ID"),
                render: (orderProductId) => orderProductId  ? orderProductId : '-',
              },
      //         ((orderData && orderData.status === "RECEIVED" || orderData.status === "GRN_RECEIVED") && !showGRN)
      // ? {
      //     // key: "addGRN",
      //     title: "Actions",
      //     render: (_, record) => (
      //       <Button
      //         htmlType="button"
      //         onClick={() => {
      //           setShowGRN(true);
      //         }}
      //       >
      //         Add GRN
      //       </Button>
      //     ),
      //   }
      // : null,
              // {
              //   dataIndex: "htPrice",
              //   key: "htPrice",
              //   title: t("PRICE_WW_VAT"),
              //   sorter: (a, b) => a.htPrice - b.htPrice,
              // },
              // {
              //   dataIndex: "priceVATinc",
              //   key: "priceVATinc",
              //   title: t("PRICE_INC_VAT"),
              //   sorter: (a, b) => a.priceVATinc - b.priceVATinc,
              //   render: text => text ? parseFloat(text).toFixed(2):  "" 
              // },
              // {
              //   dataIndex: "htPrice",
              //   key: "htPrice",
              //   title: t("COST_PRICE"),
              //   sorter: (a, b) => a.htPrice - b.htPrice,
              // },
            ]}
          />
        </div>
      ),
    });
    setProductItems(tableItems);
  };

  useEffect(() => {
    if (products) {
      let map = new Map();
      products?.data?.content?.forEach((product) => {
        map.set(product.id, product.name);
      });
      setProductMap(map);

      // if (grn?.data) {
      //   populateGRNTable(grn);
      // }
    }
  }, [products]);

  useEffect(() => {
    if (productMap.size > 0 && grn?.data) {
      populateGRNTable(grn);
    }
  }, [productMap, grn]);

  const handleVirtualGRNChange = (e) => {
    const isChecked = e.target.checked;
    setIsVirtualGRN(isChecked);
    if (isChecked) {
      Modal.confirm({
        title:"Confirmation!",
        content:"Are you sure you want to check the Virtual GRN? Your form data will reset.",
        onOk(){
          // Generate GRN number in the format VGyyMMddhhmm
          const year = dayjs().format("YY");
          const month = dayjs().format("MM");
          const day = dayjs().format("DD");
          const hour = dayjs().format("HH");
          const minutes = dayjs().format("mm");
      
          const generatedGRNNumber = `VG${year}${month}${day}${hour}${minutes}`;
          setGeneratedGRNNumber(generatedGRNNumber);
      
          // Set received date to today
          const today = dayjs().startOf("day");
          setGeneratedReceivedDate(today);
          const products = form.getFieldValue("products") || [];
          const updatedProducts = products.map((product) => ({
            ...product,
            lotNumber: "LN"+dayjs().format("YYMMDDHHmm"),
            expiry: dayjs().add(1,"months"),
          }));
          // Update form values
          form.setFieldsValue({
            grnNumber: generatedGRNNumber,
            grnReceivedDate: today,
            products: updatedProducts
          });
          form.resetFields(["products"]);
        },
        onCancel(){
          setIsVirtualGRN(!isChecked)
          form.setFieldsValue({
            isVirtual: !isChecked,
          })
        }
      })
    } else {
      Modal.confirm({
        title: "Confirmation",
        content: "Are you sure you want to uncheck the Virtual GRN? Your form data will be reset.",
        onOk() {
          // Clear generated values when unchecked
            setGeneratedGRNNumber("");
            setGeneratedReceivedDate(null);
            const products = form.getFieldValue("products") || [];
            const updatedProducts = products.map((product) => ({
              ...product,
              lotNumber: "",
              expiry: null,
            }));
            form.setFieldsValue({
              grnNumber: "",
              grnReceivedDate: null,
              products: updatedProducts
            });
            // Force resetting the fields
            form.resetFields(["products"]);
            setSelectedProductNames([])
            setProductList(products?.data?.content)
        },
        onCancel() {
          setIsVirtualGRN(!isChecked);
          form.setFieldsValue({
            isVirtual: !isChecked,
          })
        },
      });
    console.log("Form Values After Update:", form.getFieldsValue());
    }
  };
  
  const setRespValues = (data, values) => {
    notification.success({
      message: t("Your order is updated successfully"),
    });
    updateProductLocationsMap(
      data.data.products,
      productLocationMap,
      locQuantity,
      locQuantityList
    );
    setOrderData(data.data);
    values.products = data.data.products;
    values.comments = "";
  };
  const setOrderValues = (values) => {
    let data = orderData;
    if (values.comments && values.comments !== "") {
      data.statusHistoryList.push({
        time: moment(),
        status: values.status,
        user: user.fullname,
        comments: values.comments,
      });
    }
    setOrderData({ ...orderData, data: data });
  };

  const handleSubmit = (values, action, status) => {
    console.log('Handle Submit', values, action, status)
    if (action === "CLOSE") {
      if (grnTable.filter(o => o.status !== "PUBLISHED").length > 0) {
        Modal.warn({
          title: (<div style={{color: '#FAAD14'}}>Warning!</div>),
          content: (<p style={{color: '#606060'}}>{'Please publish highlighted GRN(s) to proceed'}</p>),
        });
        setLoading(false);
        return;
      }
    }

    if (action === "STOCK_AND_PUBLISH" ||
      action === "STOCK" ||
      action === "GRN_RECEIVED") {

      if(!values.grnNumber && !values.grnReceivedDate) {
        Modal.error({
          title: (<div style={{color: '#FF4D4F'}}>Required!</div>),
          content: (
            <p style={{color: '#606060'}}>Both <b>GRN Number</b> and <b>Received Date</b> is required to generate GRN</p>
          ),
        });
        setLoading(false);
        return;
      } else if(!values.grnNumber) {
        Modal.error({
          title: (<div style={{color: '#FF4D4F'}}>Required!</div>),
          content: (
              <p style={{color: '#606060'}}><b>GRN Number</b> is required to generate GRN</p>
          ),});
        setLoading(false);
        return;
      } else if(!values.grnReceivedDate) {
        Modal.error({
          title: (<div style={{color: '#FF4D4F'}}>Required!</div>),
          content: (
            <p style={{color: '#606060'}}><b>Received Date</b> is required to generate GRN</p>
          ),
        });
        setLoading(false);
        return;
      }

      if (!values.products?.length > 0) {
        Modal.warn({
          title: (<div style={{color: '#FAAD14'}}>Warning!</div>),
          content: (<p style={{color: '#606060'}}>Please add atleast one product</p>),
        });
        setLoading(false);
        return;
      } else {
        let emptyFields = 0
        let emptyFieldNames = []
        let emptyProdField = 0
        let damagedQtyGreaterThanReceived = []
        values.products.forEach((product, i)=> {
          if(product.name === "" || !product.name) {
            emptyProdField+=1
          } else {
            product?.productLocation && product.productLocation.forEach((entry, i)=>{
              if(!entry.receivedNumberofUnits || entry.receivedNumberofUnits == '') {emptyFields+=1; emptyFieldNames.push({product: product?.name, position: i+1, field: 'Received Qty'})}
              else if(entry.damageNumberOfUnits && entry.damageNumberOfUnits?.length != 0 && (entry.damageNumberOfUnits > entry.receivedNumberofUnits)){ damagedQtyGreaterThanReceived.push({product: product?.name, position: i+1}); };
              if(entry.location.name == '') {emptyFields+=1; emptyFieldNames.push({product: product?.name, position: i+1, field: 'Location'})}
              if((product.isFresh ||product.isExpiry) && entry.lotNumber == '') {emptyFields+=1; emptyFieldNames.push({product: product?.name, position: i+1, field: 'Lot Number'})}
              if(product.isExpiry && entry.expiry == '') {emptyFields+=1; emptyFieldNames.push({product: product?.name, position: i+1, field: 'Expiry Date'})}
            })
          }
        })
        if(emptyProdField > 0) {
          Modal.error({
            title: (<div style={{color: '#FF4D4F'}}>Product Field Error!</div>),
            content: (<p style={{color: '#606060'}}>Some Product fields are empty</p>),
          });
          setLoading(false);
          return;
        } else if (emptyFieldNames.length > 0/*emptyFields > 0*/){
          // Modal.error({
          //   title: (<div style={{color: '#FF4D4F'}}>Fields Required!</div>),
          //   content: (<div style={{color: '#606060'}}>
          //       <p>There are some required fields that are empty in product section.</p>
          //       <p>Required fields are:
          //         <ul>
          //           <li>Received Qty</li>
          //           <li>Location</li>
          //           <li>Expiry</li>
          //         </ul>
          //       </p>
          //     </div>
          //   ),
          // });
          Modal.error({
            title: (<div style={{color: '#FF4D4F'}}>Fields Required!</div>),
            content: (<div style={{color: '#606060'}}>
                {emptyFieldNames.filter(item=>item.field === 'Received Qty').length !== 0 && <p><b>Received Qty:</b>
                  <ol style={{fontSize: 12}}>
                  {emptyFieldNames.map((item,i)=>(
                    item.field === 'Received Qty' &&
                    <li key={i}>Product: <b>{item?.product}</b>, Entry#: <b>{item?.position}</b></li>
                  ))}
                  </ol>
                </p>}
                {emptyFieldNames.filter(item=>item.field === 'Location').length !== 0 && <p><b>Location:</b>
                  <ol style={{fontSize: 12}}>
                  {emptyFieldNames.map((item,i)=>(
                    item.field === 'Location' &&
                    <li key={i}>Product: <b>{item?.product}</b>, Entry#: <b>{item?.position}</b></li>
                  ))}
                  </ol>
                </p>}
                {emptyFieldNames.filter(item=>item.field === 'Lot Number').length !== 0 && <p><b>Lot Number:</b>
                  <ol style={{fontSize: 12}}>
                  {emptyFieldNames.map((item,i)=>(
                    item.field === 'Lot Number' &&
                    <li key={i}>Product: <b>{item?.product}</b>, Entry#: <b>{item?.position}</b></li>
                  ))}
                  </ol>
                </p>}
                {emptyFieldNames.filter(item=>item.field === 'Expiry Date').length !== 0 && <p><b>Expiry Date:</b>
                  <ol style={{fontSize: 12}}>
                  {emptyFieldNames.map((item,i)=>(
                    item.field === 'Expiry Date' &&
                    <li key={i}>Product: <b>{item?.product}</b>, Entry#: <b>{item?.position}</b></li>
                  ))}
                  </ol>
                </p>}
              </div>
            ),
          });
          setLoading(false);
          return;
        } else if (damagedQtyGreaterThanReceived.length > 0) {
          Modal.error({
            title: (<div style={{color: '#FF4D4F'}}>Warning</div>),
            content: (<div style={{color: '#606060', fontSize: 12}}>
              <p><b>Damaged Quantity</b> must not be greater than <b>Received Qty</b>. <br /> Following positions have greater Damaged Quantities.</p>
              <ol style={{fontSize: 12}}>
                {damagedQtyGreaterThanReceived.map((item,i) => (
                  <li key={i}>Product: <b>{item?.product}</b>, Entry#: <b>{item?.position}</b></li>
                ))}
              </ol>
            </div>),
          });
          setLoading(false);
          return;
        }
      }
    }

    Modal.confirm({
      title: t("ARE_YOU_SURE"),
      onOk: () => {
        if (action !== "CLOSE") {
          setLoading(true);
        }
        if (
          action === "STOCK_AND_PUBLISH" ||
          action === "PUBLISH" ||
          action === "GRN_RECEIVED"
        ) {
          let unpublishProductExist = false;
          values.products &&
            values.products.forEach((product) => {
              if (!product.prestashopProductId) {
                alert(
                  "There are some products not available on ecommerce store. Please publish the products from product edit/detail page"
                );
                unpublishProductExist = true;
              }
            });
          if (unpublishProductExist) {
            setLoading(false);
            return;
          }
          values.action = action;
          values.status = "GRN_RECEIVED";
          handleSave(values, "submit");
        } else if(action === "STOCK") {
          values.action = action;
          values.status = "GRN_RECEIVED";
          handleSave(values,"submit")
        } else if (action === "CLOSE") {
          values.id = data.id;
          values.status = "COMPLETED";
          putData(`orders/${orderData.id}`, values).then((resp) => {
            if (resp && resp.data) {
              handleAction(resp.data.data, "view");
              // LoadPage(resp.data.data.status, data.id, history);
              // postNotification(resp.data, t);
              // history.push({
              //   pathname: "/completed/" + id,
              //   data: resp.data
              // })

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
          });
        } else {
          values.id = data.id;
          values.quotation = false;
          values.purchaseOrder = false;
          values.employee = null;
          // values.stockRotated = "false";

          let emp = data.employee
            ? emps.data.content.filter((o) => o.id === data.employee.id)[0]
            : emps.data.content.filter((o) => o.login === user_.name)[0];

          if (action === "OLDSTOCK") {
            values.action = "PUBLISH";
            values.status = "PUBLISHED";
          } 
          else {
            if(status === "CANCELLED_BY_VENDOR")
            {
              values.status = status;
              values.action = action;
            }
            else{
              values.status = action;
              values.action = action;
            }
          }
          if (values.deliveryDate) {
            let formatD = dayjs(values.deliveryDate).utc(true);
            let extratime =
              (formatD.hour() * 3600 +
                formatD.minute() * 60 +
                formatD.second()) *
              1000;
            values.deliveryDate = dayjs(formatD).valueOf() - extratime;
          }
          if (values.deliveryTime) {
            let formatT = dayjs(values.deliveryTime).utc(true);
            values.deliveryTime =
              (formatT.hour() * 3600 +
                formatT.minute() * 60 +
                formatT.second()) *
              1000;
          }
          values.commission =
            data.employee && data.employee.commissionPercentage;
          values.employee = emp;

          if (values.action && values.action === "PUBLISH") {
            let unpublishProductExist = false;
            data.products &&
              data.products.forEach((product) => {
                if (!product.prestashopProductId) {
                  alert(
                    "There are some products not available on ecommerce store. Please publish the products from product edit/detail page"
                  );
                  unpublishProductExist = true;
                }
              });
            if (unpublishProductExist) {
              setLoading(false);
              return;
            }
          }
          let dataFiles = [];
          let artifect_types = "";
          let base_paths = "";

          var formData = new FormData();
          if (values.purchaseOrderMedia?.file) {
            dataFiles.push(values.purchaseOrderMedia.file);
            if (artifect_types.length > 0) artifect_types += ",";
            artifect_types += "purchaseOrder,";
            base_paths += "/orders/" + data.id + "/purchaseOrder/,";
          }

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
                  if (files.length > 0) {
                    let purchaseOrder = files.filter(
                      (file) => file.mediaType === "purchaseOrder"
                    );
                    values["purchaseOrderMedia"] = purchaseOrder[0];
                  }
                  values.products = data.products;
                  try {
                    const resp = await putData("orders/" + data.id, values);
                    if (resp.data) {
                      setLoading(false);
                      setRespValues(resp.data, values);
                      setOrderValues(values);
                      handleAction(resp.data.data, "view");
                      // LoadPage(resp.data.data.status, data.id, history);
                      postNotification(resp.data, t);
                    }
                  } catch (err) {
                    notification.error({ message: err.message });
                    setLoading(false);
                  }
                }
              })
              .catch((error) => {
                notification.error({ message: error.message });
                setLoading(false);
              });
          } else {
            putData("orders/" + data.id, { ...values, products: data.products })
              .then((response) => {
                if (response.data) {
                  setLoading(false);
                  setRespValues(response.data, values);
                  setOrderValues(values);
                  postNotification(response.data, t);
                  // LoadPage(response.data.data.status, data.id, history);
                  handleAction(response.data.data, "view");
                } else {
                  notification.error({ message: response.message });
                  setLoading(false);
                }
              })
              .catch((error) => {
                notification.error({ message: error.message });
                setLoading(false);
              });
          }
        }
      },
      onCancel: () => {
        console.log("ok onCancel", values);
      },
    });
  };

  const populateGRNTable = (grnData) => {
    let grnTableData = [];
    grnData.data?.map?.((item) => {
      grnTableData.push({
        id: item.id,
        grnNumber: item.grnNumber,
        isVirtual:item.isVirtual,
        note: item.note,
        status: item.status,
        products: item.productLocation.map((loc) => ({
          productId: loc.productId,
          productName: productMap.get(loc.productId),
          receivedNumberofUnits: loc.receivedNumberofUnits,
          damageNumberOfUnits: loc.damageNumberOfUnits,
          receivedPallets: loc.receivedPallets,
          lotNumber: loc.lotNumber,
          expiry: moment(loc.expiry).isValid()
            ? moment(loc.expiry).format("DD/MM/YY")
            : "",
          location: locations.filter((loca) => loca.id === loc.locationId)?.[0]
            ?.name,
        })),
      });
    });
    setGrnTable(grnTableData);

    let tableItems = [];

    grnTableData.map((item, index, arr) => {
      if(index === arr.length-1) setLastAddedGRNStatus(item?.isVirtual);
      const virtualTag = item.isVirtual ? <Tag color="#2B2A4C">Virtual GRN</Tag> : null;
      tableItems.push({
        key: item.id,
        label:(
          <span style={{display:'flex', justifyContent:'space-between'}}>
            <span>{index + 1 + "). GRN NUMBER: " + (item.grnNumber ?? "")}{item.status === 'STOCKED' ? 
            <Popover 
              trigger="hover" 
              color="#ffffff" 
              content={
                      <div style={{margin: '5px 10px 0', color: '#f43a3a', textAlign: 'center', width: 300}}>
                        <text style={{fontSize: 12, fontWeight: 500}}>This GRN is stocked but not published on ecommerce. To publish it on ecommerce, first open the GRN then click on Publish button.</text>
                      </div>
                    }
              >
                <InfoCircleOutlined style={{color:'#ffffff', fontSize: 16, marginLeft:15}} />
              </Popover> : <span></span>}</span>
            {virtualTag}
          </span>
        ),

        style: {
          marginTop: "0px",
          background: item.status !== "PUBLISHED" ? "#e84652" : ""
        },
        children: (
          <Card
            style={{
              background: "#F9FAFB",
              marginTop: "20px",
              border: "1px solid #E5E7EB",
              marginTop: "10px",
            }}
          >
            <Table
              dataSource={item.products}
              footer={() => "Comments: " + (item.note ?? "")}
              pagination={data.products.length > 10}
              // title={() => "GRN Number: " + item.id}
              columns={[
                // {
                //   dataIndex: "productId",
                //   key: "id",
                //   title: t("ID"),
                // },
                {
                  dataIndex: "productName",
                  key: "name",
                  title: t("PRODUCT_NAME"),
                  sorter: (a, b) => a.name?.length - b.name?.length,
                  // render: (text, record) =>
                  //   record.otherName ? text : record.name,
                },
                {
                  dataIndex: "receivedNumberofUnits",
                  key: "receivedNumberofUnits",
                  title: t("Received Quantity"),
                  sorter: (a, b) =>
                    a.receivedNumberofUnits - b.receivedNumberofUnits,
                },
                {
                  dataIndex: "damageNumberOfUnits",
                  key: "damageNumberOfUnits",
                  title: t("Damaged Quantity"),
                  sorter: (a, b) =>
                    a.damageNumberOfUnits - b.damageNumberOfUnits,
                },
                {
                  dataIndex: "receivedPallets",
                  key: "receivedPallets",
                  title: t("Received Pallets"),
                  sorter: (a, b) => a.receivedPallets - b.receivedPallets,
                },
                {
                  dataIndex: "lotNumber",
                  key: "lotNumber",
                  title: t("Lot Number"),
                  sorter: (a, b) => a.lotNumber - b.lotNumber,
                },
                {
                  dataIndex: "expiry",
                  key: "expiry",
                  title: t("Expiry"),
                  sorter: (a, b) => a.expiry - b.expiry,
                },
                {
                  dataIndex: "location",
                  key: "location",
                  title: t("Location"),
                  sorter: (a, b) => a.location - b.location,
                },
              ]}
            />
            {/* {
              item.status !== "PUBLISHED" &&
              <Button
                type="primary"
                htmlType="button"
                loading={loading}
                style={{ marginLeft: 15 }}
                onClick={() => {
                  let values = form.getFieldsValue()
                  values.id = orderData.id
                  values.grnId = item.id
                  handleSubmit(values, "PUBLISH", "PUBLISHED");
                }}
              >
                {t("Publish")}
              </Button>
            } */}
          </Card>
        ),
      });
    });
    setGrnTableItems(tableItems);
  };

  const handleSave = (dd, type) => {
    if (type) {
      setLoading(true);
    } else {
      setSaving(true);
    }
    const products = [];
    const dataFiles = [];
    const grnImageFiles = [];
    let artifect_types = "";
    let base_paths = "";
    var formData = new FormData();
    dd.products?.forEach(
      ({
        id,
        frozen,
        orderProductId,
        photos,
        productLocation,
        quantity,
        prestashopProductId,
      }) => {
        const productLocations = [];
        productLocation.forEach(
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
              locationId: locationId,
              lotNumber,
              receivedNumberofUnits,
              receivedPallets,
            });
          }
        );
        products.push({
          id,
          frozen,
          orderProductId,
          photos: [],
          productLocation: productLocations,
          quantity,
          prestashopProductId,
        });

        if (photos?.file) {
          dataFiles.push(photos.file);

          if (artifect_types.length > 0) artifect_types += ",";
          artifect_types += "photo_";
          base_paths +=
            "/orders/" +
            data.id +
            "/" +
            "photo/orderproduct/" +
            orderProductId +
            ",";
        }
        if(dd.grnImages?.file){
          grnImageFiles.push(dd.grnImages.file)
          if (artifect_types.length > 0) artifect_types += ",";
          artifect_types += "photo_";
          base_paths +=
            "/uploads/orders/" +
            data.id +
            "/" +
            "purchaseOrder/" +
            dd.grnImages.file.name +
            ",";
        }
      }
    );

    if (dataFiles.length > 0) {
      formData.append("artifect_type", artifect_types);
      base_paths = base_paths.slice(0, -1);
      formData.append("base_path", base_paths);
      dataFiles.map((o) => {
        formData.append("dataFiles", o);
      });
      postFormData(formData).then(async (res) => {
        res.data?.files?.map((file) => {
          const orderProductIdRaw = file.path?.split("/orderproduct/")[1];
          const [orderProductId] = orderProductIdRaw.split("/");
          products.map((product) => {
            if (orderProductId && product.orderProductId === orderProductId) {
              product.photos = [
                { ...file, name: file.filename, mimeType: file.mimetype },
              ];
            }
          });
        });

        const values = {
          ...data,
          ...dd,
          products,
        };
        postData(`orders/${orderData.id}/grn`, values)
          .then((res) => {
            if (res && res.data) {
              getData(`orders/${orderData.id}/grn`)
                .then((res) => {
                  if (res && res.data) {
                    setLoading(false);
                    // setRespValues(res.data, values);
                    // setOrderValues(values);
                    // postNotification(newOrderData, t);
                    populateGRNTable(res.data);
                    setShowGRN(false);
                    setIsVirtualGRN(false)
                    setSelectedProductNames([])
                    setProductList(null)
                    form.resetFields();
                    // let list = setGrnListData(res.data.data);
                    // setGrnList(list);
                    // handleAction(res.data, "view");
                    // setSubmitting(false);
                  } else {
                    notification.error({ message: res.message });
                    setLoading(false);
                  }
                })
                .catch((err) => {
                  if (type) {
                    setLoading(true);
                  } else {
                    setSaving(true);
                  }
                  notification.error({ message: err.message });
                  setLoading(false);
                });
            }
          })
          .catch((err) => {
            console.log(err);
            setSubmitting(false);
          });

        // putData("orders/" + data.id, values)
        //   .then((response) => {
        //     if (type) {
        //       setLoading(true);
        //     } else {
        //       setSaving(true);
        //     }
        //     if (response.data) {
        //       setRespValues(response.data, values);
        //       setOrderValues(values);
        //       postNotification(response.data, t);
        //       // LoadPage(response.data.data.status, data.id, history);
        //       handleAction(response.data.data, "view");
        //     } else {
        //       notification.error({ message: response.message });
        //     }
        //   })
        //   .catch((error) => {
        //     if (type) {
        //       setLoading(true);
        //     } else {
        //       setSaving(true);
        //     }
        //     notification.error({ message: error.message });
        //   });
      });
    }
    if(grnImageFiles.length > 0){
      formData.append("artifect_type", artifect_types);
      base_paths = base_paths.slice(0, -1);
      formData.append("base_path", base_paths);
      grnImageFiles.map((o) => {
        formData.append("grnImageFiles", o);
      });
      // dd.grnImages.fileList.forEach((file) => {
      //   formData.append("grnImages", file);
      // });
      postFormData(formData).then(async (res) => {
        const grnImages = res?.data?.files?.map((file) => ({
          name: file.name,
          path: `uploads/orders/${data.id}/photo/${file.name}`,
          mimeType: file.type,
          description: dd.description || '',
          type: file.name,
        }))
        const values = {
          ...data,
          ...dd,
          products,
          grnImages
        };
        postData(`orders/${orderData.id}/grn`, values)
          .then((res) => {
            if (res && res.data) {
              getData(`orders/${orderData.id}/grn`)
                .then((res) => {
                  if (res && res.data) {
                    setLoading(false);
                    populateGRNTable(res.data);
                    setShowGRN(false);
                    setIsVirtualGRN(false)
                    setSelectedProductNames([])
                    setProductList(null)
                    form.resetFields();
                  } else {
                    notification.error({ message: res.message });
                    setLoading(false);
                  }
                })
                .catch((err) => {
                  if (type) {
                    setLoading(true);
                  } else {
                    setSaving(true);
                  }
                  notification.error({ message: err.message });
                  setLoading(false);
                });
            }
          })
          .catch((err) => {
            console.log(err);
            setSubmitting(false);
          });
      });
    }
    else {
      const values = {
        ...data,
        ...dd,
        products,
      };
      const orderProdId = orderData.products[0].orderProductId
      postData(`orders/${orderData.id}/order-products/${orderProdId}/grn`, values)
        .then((res) => {
          if (res && res.data) {
            getData(`orders/${orderData.id}/grn`)
              .then((res) => {
                if (res && res.data) {
                  setLoading(false);
                  // setRespValues(res.data, values);
                  // setOrderValues(values);
                  // postNotification(newOrderData, t);
                  populateGRNTable(res.data);
                  setShowGRN(false);
                  setIsVirtualGRN(false)
                  setSelectedProductNames([])
                  setProductList(null)
                  form.resetFields();
                  // let list = setGrnListData(res.data.data);
                  // setGrnList(list);
                  // handleAction(res.data, "view");
                  // setSubmitting(false);
                } else {
                  notification.error({ message: res.message });
                  setLoading(false);
                }
              })
              .catch((err) => {
                if (type) {
                  setLoading(true);
                } else {
                  setSaving(true);
                }
                notification.error({ message: err.message });
                setLoading(false);
              });
          } else {
            if (type) {
              setLoading(true);
            } else {
              setSaving(true);
            }
            notification.error({ message: res.message });
            setLoading(false);
          }
        })
        .catch((err) => {
          if (type) {
            setLoading(true);
          } else {
            setSaving(true);
          }
          notification.error({ message: err.message });
          setLoading(false);
          console.log(err);
          // setSubmitting(false);
        });
      // putData("orders/" + data.id, values)
      //   .then((response) => {
      //     if (type) {
      //       setLoading(false);
      //     } else {
      //       setSaving(false);
      //     }
      //     if (response.data) {
      //       setRespValues(response.data, values);
      //       setOrderValues(values);
      //       postNotification(response.data, t);
      //       // LoadPage(response.data.data.status, data.id, history);
      //       handleAction(response.data.data, "view");
      //     } else {
      //       notification.error({ message: response.message });
      //     }
      //   })
      //   .catch((error) => {
      //     if (type) {
      //       setLoading(false);
      //     } else {
      //       setSaving(false);
      //     }
      //     notification.error({ message: error.message });
      //   });
    }
  };

  const generateInvoice = () => {
    setSubmitting(true);
    const productsTable = [];
    const grnItemsTable = [];
    productsTable.push(
      orderData.status === "STOCKED" || orderData.status === "PUBLISHED"
        ? [
            { text: t("NAME"), style: "tableHeader" },
            {
              text: t("LOT_NUMBER"),
              style: "tableHeader",
              alignment: "center",
            },
            {
              text: t("RECEIVED_QTY"),
              style: "tableHeader",
              alignment: "center",
            },
            {
              text: t("DAMAGED_QTY"),
              style: "tableHeader",
              alignment: "center",
            },
            { text: t("EXPIRY_DATE"), style: "tableHeader" },
            { text: t("LOCATION"), style: "tableHeader", alignment: "center" },
          ]
        : [
            { text: t("NAME"), style: "tableHeader" },
            { text: t("PALLET"), style: "tableHeader", alignment: "center" },
            { text: t("QUANTITY"), style: "tableHeader", alignment: "center" },
          ]
    );

    if (["GRN_RECEIVED", "COMPLETED"].includes(status) && grn && grn?.data) {
      grn.data.map((grnItem, index) => {
        if (index > 0) {
          grnItemsTable.push([
            {
              text: "",
              style: "tableHeader",
              fillColor: "#555555",
              color: "#00FFFF",
              colSpan: 7,
            },
            {
              text: "",
              style: "tableHeader",
            },
            {
              text: "",
              style: "tableHeader",
            },
            {
              text: "",
              style: "tableHeader",
            },
            {
              text: "",
              style: "tableHeader",
            },
            {
              text: "",
              style: "tableHeader",
            },
            {
              text: "",
              style: "tableHeader",
            },
          ]);
        }
        grnItem.productLocation.map((location, locIndex) => {
          if (locIndex == 0) {
            grnItemsTable.push([
              {
                text: "GRN NUMBER:",
                style: "tableHeader",
              },
              {
                text: grnItem.grnNumber,
                fontSize: 9,
                alignment: "center",
                colSpan: 2,
              },
              {
                text: "",
                style: "tableHeader",
              },
              {
                text: "Received Date",
                style: "tableHeader",
                colSpan: 2,
              },
              {
                text: "",
                fontSize: 9,
                alignment: "center",
              },
              {
                text: moment(grnItem.receivedDate).isValid()
                  ? moment(grnItem.receivedDate).format("DD/MM/YY")
                  : "",
                fontSize: 9,
                alignment: "center",
                colSpan: 2,
              },
              {
                text: "",
                style: "tableHeader",
              },
            ]);
            grnItemsTable.push([
              { text: t("NAME"), style: "tableHeader" },
              {
                text: t("LOT_NUMBER"),
                style: "tableHeader",
                alignment: "center",
              },
              {
                text: t("RECEIVED_PALLETS"),
                style: "tableHeader",
                alignment: "center",
              },
              {
                text: t("RECEIVED_QTY"),
                style: "tableHeader",
                alignment: "center",
              },
              {
                text: t("DAMAGED_QTY"),
                style: "tableHeader",
                alignment: "center",
                width: "auto",
              },
              { text: t("EXPIRY_DATE"), style: "tableHeader" },
              {
                text: t("LOCATION"),
                style: "tableHeader",
                alignment: "center",
              },
            ]);
          }
          grnItemsTable.push([
            {
              text: productMap.get(location.productId),
              fontSize: 9,
            },
            {
              text: location.lotNumber ? location.lotNumber : "",
              fontSize: 9,
              alignment: "center",
            },
            {
              text: location.receivedPallets,
              fontSize: 9,
              alignment: "center",
            },
            {
              text: location.receivedNumberofUnits,
              fontSize: 9,
              alignment: "center",
            },
            {
              text: location.damageNumberOfUnits
                ? location.damageNumberOfUnits
                : "",
              fontSize: 9,
              alignment: "center",
            },
            {
              text: location.expiry
                ? moment.utc(location.expiry).format("DD/MM/YYYY")
                : "",
              fontSize: 9,
              alignment: "center",
            },
            {
              text: locations.filter((loc) => loc.id === location.locationId)[0]
                .name,
              fontSize: 9,
              alignment: "center",
            },
          ]);
          if (locIndex === grnItem.productLocation.length - 1) {
            grnItemsTable.push([
              {
                text: t("Comments"),
                style: "tableHeader",
                alignment: "center",
                fillColor: "#ced2d8",
              },
              {
                text: grnItem.note ? grnItem.note : "",
                fontSize: 9,
                alignment: "center",
                colSpan: 6,
              },
              {
                text: "",
                fontSize: 9,
                alignment: "center",
              },
              {
                text: "",
                fontSize: 9,
                alignment: "center",
              },
              {
                text: "",
                fontSize: 9,
                alignment: "center",
              },
              {
                text: "",
                fontSize: 9,
                alignment: "center",
              },
              {
                text: "",
                fontSize: 9,
                alignment: "center",
              },
            ]);
          }
        });
      });
    }

    orderData !== null &&
      orderData.products.forEach((prod) => {
        if (prod.productLocation && prod.productLocation.length > 0) {
          prod.productLocation.map((p) => {
            (orderData.status === "STOCKED" ||
              orderData.status === "PUBLISHED") &&
              productsTable.push([
                {
                  text: prod.otherName ? prod.otherName.name : prod.name,
                  fontSize: 9,
                  rowSpan: prod.productLocation.length,
                },
                { text: p.lotNumber, fontSize: 9, alignment: "center" },
                {
                  text: p.receivedNumberofUnits,
                  fontSize: 9,
                  alignment: "center",
                },
                {
                  text: p.damageNumberOfUnits,
                  fontSize: 9,
                  alignment: "center",
                },
                {
                  text: p.expiry
                    ? moment.utc(p.expiry).format("DD/MM/YYYY")
                    : "",
                  fontSize: 9,
                },
                {
                  text: locations.filter((loc) => loc.id === p.locationId)[0]
                    .name,
                  alignment: "center",
                },
              ]);
            !(
              orderData.status === "STOCKED" || orderData.status === "PUBLISHED"
            ) &&
              productsTable.push([
                {
                  text: prod.otherName ? prod.otherName.name : prod.name,
                  fontSize: 9,
                },
                {
                  text: prod.numberOfUnits ? prod.numberOfUnits : 0,
                  fontSize: 9,
                  alignment: "center",
                },
                {
                  text: prod.quantity ? prod.quantity : 0,
                  fontSize: 9,
                  alignment: "center",
                },
              ]);
          });
        } else {
          !(
            orderData.status === "STOCKED" || orderData.status === "PUBLISHED"
          ) &&
            productsTable.push([
              {
                text: prod.otherName ? prod.otherName.name : prod.name,
                fontSize: 9,
              },
              {
                text: prod.quantity ? prod.quantity : 0,
                fontSize: 9,
                alignment: "center",
              },
              {
                text: prod.numberOfUnits ? prod.numberOfUnits : 0,
                fontSize: 9,
                alignment: "center",
              },
            ]);
        }
      });

    let docDefinition = {
      footer: {
        columns: [
          {
            text: "SARL SD FOODS \n ADDRESS: 4 CHEMIN DES ECRICROLLES \n 95410, GROSLAY",
            width: "*",
            fontSize: 11,
            alignment: "center",
            bold: true,
          },
        ],
      },
      content: [
        {
          columns: [
            {
              image:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAakAAAC4CAYAAABZ0RPRAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAGe2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDYwLCAyMDIwLzA1LzEyLTE2OjA0OjE3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjEtMTEtMjVUMjA6MDM6NTErMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIxLTExLTI1VDIwOjA1OjM3KzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIxLTExLTI1VDIwOjA1OjM3KzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjgwZmYyNDAyLTg0YzktNGUxYS1hOTcwLTg1YzExZjIwN2M5NCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjRlYmQ5OGMyLWFmNTYtNGQ0OC04YjY2LTYxYjBhOTIyOGNlNiIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmYwMGJjN2QzLTI4ZTItNDMyOS1iMmUzLTQwMDY5OGY3YjJjNSI+IDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDxyZGY6QmFnPiA8cmRmOmxpPkJBNjUwREFBRDlFOTM5NkQyMjJEQUJBQThGQjVBNThCPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZjAwYmM3ZDMtMjhlMi00MzI5LWIyZTMtNDAwNjk4ZjdiMmM1IiBzdEV2dDp3aGVuPSIyMDIxLTExLTI1VDIwOjAzOjUxKzAxOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoTWFjaW50b3NoKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ODBmZjI0MDItODRjOS00ZTFhLWE5NzAtODVjMTFmMjA3Yzk0IiBzdEV2dDp3aGVuPSIyMDIxLTExLTI1VDIwOjA1OjM3KzAxOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4uX3IMAAEaOElEQVR4nOydd3wdxfX2vzOzu7epuRe594qNG2DTQ+8hQCgpBEIaaaT3HpIQ0kgCCb8QEkhCQu+9FxuDwb33XiTZqrdsmXn/2L2SbMu2JEu24b1PPoqMpDs7szs7pz3nHGGMoYACCiiggAKORMjDPYECCiiggAIK2BcKQqqAAgoooIAjFgUhVUABBRRQwBGLgpAqoIACCijgiEVBSBVQQAEFFHDEoiCkCiiggAIKOGJREFIFFFBAAQUcsSgIqQIKKKCAAo5YFIRUAQUUUEABRywKQqqAAgoooIAjFgUhVUABBRRQwBGLgpAqoIACCijgiEVBSBVQQAEFFHDEoiCkCiiggAIKOGJREFIFFFBAAQUcsSgIqQIKKKCAAo5YFIRUAQUUUEABRyysln64pqHp30JALgvahZdffod4spikAwuXrKF71z5s2rqFUcO7UF9rKC6KsXbtdpEs6dpvZ+3WMYGVHLdqdc2AyopMKjBGIP1o1EI34PccjEBrY7p3STnlvcq6BdqAEW0bIvquFGbd5p0VtXXZQEoRDiJ0m6ck0OG8jGWMMUhjjBa+QIi2TayAAgpoE4wxBAjRrbQo169LYmX/vsm5RcVl70jp1nbrWkQu47FuwzYGDx3EaaeOQWBo3gR+RA+71ddqUUi1FlIKbEsCWNsrqk94d4l71oo1O0+pzWwbkcm6pRnXR9kOUkrCUyM/y8IZ8p6EEGyprOPdZTX5H7Tt86bpH7atULL559u+J4yx0MIQUxrLMmgEwlgIY9o1XgEFFHBgmOhFNmiqdtYyd2EFliUoK7HXHD262/0zJpfflozF13XU9dolpIQQ2LbCzbk91m2qveLlOes/sa3Cn5jxBNKyURKEsnGSVqNwEkZiCt7F9zAMAoNjKxxbRT9rryAwzf4/j7bvDWEgl8nw1U9N+tpXrz7uN2s3VavCHiuggM6Fyb+sAaTdbMmmip0jZ87ZduGrc9Zd/PTrW78xZ2HF1eefMuD7SYfbRQcoi20WUratQHv2hs3V1721eNVXq+vUEKMVylbEY3sspfEUEuQPuQLeTzi457n79m27u88IgzaaXt2K1wIM7lcWHNSECiiggNag2XtWUjV+eM+ZZ08fNRP45n+fXHT+r+54865/Prrmr8ePKx00YuSw74jw+G832qR2Oo6isrJm/P/dM/uZZ2dW/bkybQ3BsrEcRSEKUMChhiAMPwXaOId7LgUUUABcfs64x+Y+8Mku06f2mfvS3F3ffnfJxu84tkJKsdtXW9AqISUExBzYsqX6wlvuevPFeeuyp0g7QQILKTyM8A88SAEFdDgKsacCCjgS8eSfL5s0eXz3tfc8tuynL720/MRdVS7btjawbWuabVvTbRqrRSElVdOXsiAegwcef+fqvz209IGcF+te5FgY6eLLAKljSF2IAxRQQAEFFNCE33zjlJNtKeUd97718yWr1lor1m1ixdoNrFi7oU3jtBiTqq3MAiGLI5mweOr5eef95vaZtwsnrhJKYdBIIzBIjPAoaLMFFFBAAQU0x9Rx/TZ85PwRf7713vnXZ+r9k6ZOHv5CNtv2sHGLJtCCBTtYsGAHy5bs4rmnFw/56x1v3SGsuB0XDlroiIIoIiJEQUAVUEABBRSwN664aMLPi+JJXpm1/pog04CfTeNn2ubua9GScmyJEAKjA/nA0/N/X5mhZyyWBFyMMIg2JnEWUEABhwavvrNx9JoN1RN21mZ6N6SzXTw/sI0UKubYDaWpRFXvbqm1o4d2mzluWPfqwz3XPfHsG6unbNxcP7qmrqFbQ9bt4gfaFkroWDyWKStK7SjvkVwxdkTXmUP7dfMO91zfS3jkxcWnrlxXc/TWqpphFVVeeU2t283zvIStZCZZFK/r1sXa2qd76dqBfbosOnpMjxfHDutZ3VHXnjSy99bxI7ounbty+4xNG6tSlmM3aG2AXq0eo0UhJS2XeNxi/vwNH1y6rvZ8J5YCPLTwEToGosD0LeD9jeu/d/9dby2tPjMWt7Kht6BjFbMg0KokSeUzf7964sGMs3Dljm7PzVrz0VffXH/pus1147bWZErcnEEZCaIpN1E05tEHlBQZenYr2nrUiF6vnH1C/79/8PRxzx3kctqFN+atHfHcm6s+NvOtbRdu2pEeuaPGt42nQSi0kCF70xgEAVoLlDR0KXHo3bNo7TETyp48a/rQOz4wfcTcjprP/OWbe37h+4+96VspRwrT5kNOChk4lpWNx2VD167O1lFDus0e1r9k7vBBveYePbL31o6aZ2tw1+PzLn3whbVfXr6yYmrFzrQdaBspJFJKpIiMEDTGVKF1gNEKYwRlxQED+xWvOOnYAfdddOKoWyaO6bPjYOdy7NE9HvvzPZu/tqk6N25g/+LZvte2dJMWhVRJURFaB9bTr676piZBzAgC6WOwkOhCtlMB73tsqApGrNzk90zEO6eIlxcIupXo8vZ+/tV31o2+4/4FN772ztaLqut8LOVg2wrHShKz8nmJzRNUDEaAMTFygWbdVrfPyg3rLn/g+ZWX/+L2OTsuPn3I77/1qRN/0SGLOwAeem7x6Xc+vOincxZXHZPNgWXbWMoi6TiIWBhOEHnFwBiEsNHhCmhwDSvW1w9etLrq+n8+sur6CUPeWnTF+aN/cc0lk/9zsPNK+7pk2WZ/sFAuQrTjqRui8mEaYwIef2nz+UooihKSIQPiS6eM7/fc+acM+fPxRw9acbBz3Rf+7/45V//9vkU/W76+oVwqC8e2SCZLQZhIUTHN9rMCFNJItAAtDDnfsHS1O2LBsmXf/ce9K7578rE9H/7Mhyd/5dgJA9a2d05jh5TP8jJLpG/EmJHDes5OZzpASJWVxpm7cP0pqzc2THXsBFpohAk1G9Oeh1dAAe8xOJbI2rbEsTvHtS0V2LaVbc9nP//jR+586MUtV2c8STJmUZxSsKdAir7T+BMRlQrQSAmWVMRshTY2G3Z4PW+6Y8GN/3t62Te+/LEpn/34RZP+e5DLaxHvLN5c/su/zLzr5Xe3naqFQ9JJUJzKz1ET5ogKBLJp7qIp0UAgkEpgKYg5CYyB+Wsaxr1788x//+uJxT/81ienX3XGjGFz2js/S0g3bguMAnlQiZ8y+nIwBnwMi1ZlR89dunT03Y8u/eLkkV1nf/SicT+57OzxTx7ERXbDmi1V6lu/fuHZl2ZtPlU6xaSKkgihI8Gko9uZ5xLsDiM0AlDGgBJYSuHEJK6WPPrylotenrXpoisvHPubG7986tfaM7duZfFNyoaKHbu6rF+7g0zW4+hBg1r9+RaJE7l0lllvrr7ENSBkc6FUEFAF/P+Dzo+8tu0KT76+cvqkD965654nt1xtrBiplMSSLbsi9/zJvhyWUghilqCoOMnWKln25Ztev+dTP3jsnjZNrBX4y/3vXHvZlx7Z9OI71afGksUUxyVKhvZRczEUwuzxvWUIAYmYRaooxZKVmRGf+NZzb//01hd/3NFzbz8MQhikgHhMUVyUwBZFzFxSfcxnfvbCExd95n9vzHxn07CDvcqC5RXdrvjSoxufn7351GRRKXHHQtLMxduIA+23pvsvDVgSipMpAuFw+z0LvnrO1fe+u2R1RUlb52dZwpNSkE6nrepdu6ipqW7T51sUUktXVRUtXFF9pm3HQw2sgAIKOKz4+4Nzrrzuu8++sWGnW5YqcXCERgJBR6QoRnVrbEdSnEhx77PrLz/t2v8sWbN5pzrgZ1uB7//huV999+bX/1YfxChKSmyTw6DQdMjwgCGWkAhLcfM/lv/g6u/e/1AHDdzBMGjLI+kkScXLeH1h1fTLv/rkypvueP0b7R1x7eZd6trvPrVk5dZcn+JkGXkXaZPwb+dMRVjGzmAQ0iFZXMzrK3Ye/eEv/2/L2vUVbXxw4Tza25ygxS2ebqgdVtXg97NEnmZeQAEFHC78/ZF3r/z2zXP+7as4KUeitAoJTNpBmLbXPGwJoR2jEVLTLVXEu4trRn/iWw8vO9hxv/3753/3u/8u/UYiWUJCWkgTVq8P3U4dOHcjUUpRVJrgsee2X/Sxbz7waIcM3qEILRSJRgmPZNIhEIobb1/4q+t++Oi97Rnx2ze/9NTKzXU9y+KKvGAS0feDMTDyIqpxLC2xjMvpJ426e/DAHu1izglCQdVWYdWikFqzcdeEXM5VQuojJAYVugPyN12apiytsMK6aDRtRbP/bz7zpp83LVkYGY3bFDjsbHZ98xdTC5CmMUTcCV9Nm6zJq7+7S6VgKXcUJEQJ7q3Hge/906+vOub7v535b+nESMhwr2sRoKWLIEAgm2UrRpqvaf5fTYFyAUgjAY1poX+XNAKhLVwhKC62WbwyN+xDn7v35TYsaDf87u63vvzX/y38clmyCCU1RngE0TsmyJ8tAtk432jHivDdQIAwAomM6lXv+37pKP7i6IBkaYxHXtp0/tduevZP7Z37gdBULtsAEoNAi7BdTOMZI3TEpTCEMTeJxgrZ0cZCGIWloLgkxr1Pr7v0I9946Im2zOHuxxde+vybm08vSzpoY0VPurkFFd4vLUwzMkp0lpp8FDA6V0UzkSR0SLIRMvy30dRldvKZy0b95rdfO+2z7btj7T9nWnyjNm2rnyilwhwBVWMNoTCR4T/CKhcoNFGo2Fh4wsYTFoGx8I0i0ApPOwTaIdA2gXEIjNMYPDQRASSQPqGQM0gNSguE7rw1h7pjqEVKk1+LQUMHfclmXwKNwBiJwYrWrAlE+HfhfEx0QBz+59w+5Od++BQpQdiGJtyo+UR3yb7Uhib1If/U9o/v//r5R13tELPCvd5cicorkAJFIPLXVWgR4AeaXFaTafDJpj1ynsFDEUgNxkHqvTlT+QNK4oMRpIpivPz29pO+86cXb27rfXn1nZWjf/d/c37nJItQIn9wNylJBpAahDH40kTuJYHQ4LuGXFpT3+BS72ZIaxeDDAVbM2W1OYSRjcJNGkFxcYp/PLz0+v88seCits69NRARySN8lgGhlSSRBFEVHkDbCKMiZVhhjEJGJ1eoJITrkUZTUhLjsVc2n/PlGx++vbVzuOu/838gLSc8p4WOCCdNvUhFtBuVEQgsfATpHNQ2ZMlmsxjPI8jmaKjPkE77BDoiVpjQEFDGEBhI12k+fem4W2684Yx2ESeEEWAkxoAxAtNGS6BFdp9ty96+FsTNkeHs040bFDASNzD4WqE9CcJFqVospbGkxpIGS4EU4THgGx8/UPh+nIyBIIiDiWMpg1IGowCVa7aZdKcd2XlNR6NQBFiBha+ykXbbMVdoxG6LCAsAh+sLEEKDiWi90n+PC6rDC4Mi0JqcW4cxzh42fEv3NPxdEGhcJeL7G/tTP3rsnpXbZc9UqYBAA1YL8thgRIAwYAWKtO+T0/7Cvl3tLUPLu6wsK41Xu4FxNm6pG7B2c/XgBl8ck0wYVCufd7I4yZ33Lf7qWccNvePEyQOXtupDwI/++ObD9cYmJWXYdFkEewkXgSGQAiMEMhCk3RzgLenfM7FhSN+y1ckipyGTIb5uY82QDTtqBhljj4snrMhrsv/5W0KCE+eXf337X1eee1RRa+fdelh4bhrfl5GyELrEAJQjUbZASY1lAoS2w3WqLEIrmmyDSOQagcQiWezwz8fWXzd61JzZn754yh37u/rzb605euHamnFOwkEYGyN8zB5nlxGhe1EFCTLk8Lw6po3uMeeEaSMfHDm065yy0pIdbjoXX7epYtzs+TvOee3d7RfvqvOJJxNIKTCBxm1o4LoPj/v9L7/ygRs6/h62Di33kzJWjyYG6OHSVEPNUBhFoMH1LTydI2XXUN51F317VDOovJoh5bvo262WkpI0qaRPPOZj21ksDNpYuL4kk3NIp2PsqkuwraqIDZuLWbO5jC2VPdlWVUp9Jo6QcRzbx7YCMM0osB0IIQyBa8h4MbSUKGMwOHREY7BwfGh040XtvIQAYRyUkEjlhdxnoRDSQwqDNPkYaN5pdCSoJa1DIwesY0Ib7YLnuYweUrL0msuO/Z70lQaNluEp1NKdbHzSgcaxzT4p6C+/tXbc48+vv7w4FUcFBoyFEUGU77LHfjEGg2KXm1k4bnBy4ScvnXz7xy6c+MqeY7729rqBdz2y/ONPvLz6PM9WU2PqQO3kQkqyl3O46Y5Zd504eeDUA3wAgFvvmX3dwsX1I4pLbYTxMMQiS2j3O+ILhRAexrdJZ7JLTpjc9ZWrLx5/+wWnjpm355iPvbJk4p3/W/SpV+dWnuIkYqNsmY+Z7HPmpCyLTRWZ1NdvfvZPv/7aGZ9vzdxbAwMEXsDVl4y7acLQXq9qjQo0qrqutsfajbuOWryy6tjl62onV2c0iZSNUmEKj9QOkGc05scKLUBpDDHhIZwi/nD73NtOmTLo3yMGdN/n/nhp5vqrstqmdDfrydDc1M7vk4zI4EiXH11/wic+dcmkf+w92rDZn76COxau2trt1v/MueWhZzdcqVUC16vhU5eNv+WXXz18Agr2IaSyOT/yrx2+2nzGKHKeIvBduhVXMH38BqaO3c60sWsZNaiOLkX1OIldYLlNbtjmh9VujniaTmxpQDvkMiVU15WwZmMR7ywewFvL+vPO8h7sqCpHCAvHASn8djNS9obECzQjh29lXPkmXCOQhAKxE8Qhxgi0Nni+RdaVNKQdqhocGhoc3EySulySrBcPNTsFSllYlkGK0HXxXkD+vdSmw0zRNsPzDAN7xJdedfbYBzty3FvvmfcHT0scEQogLX2kMZEC1QSBACPIZOrmXnrmkAf/+sPzfravMU+YOmj9CVMH/eTfjy586Xt/ePXnOV+eYFv7v3XSaFKxJG/Or5zy2MsrTjr/5BF7Cb89ceeDC38mU1bk/VAQafR7ylaJjxcocBsWfPWTE2/+1rXH372vMc8/acy8808a87mf/vX1a2+9a+4XdSx1lNzP1PNR7FQ8yUPPrr7+6kt2fG/soI4p92MwaO1x1rH97zxp2pAWySVvL9pQ/p9HFn374WfXX99gBLG4jwjsKITS9H6FgjsgEBYSC9vx2Vod2L+98+07/vLDs6/a1xxWrqk52lGRZ0b6LVqXAtBG4efq+N7np36qZQHVhPHD+lTd9oPzr5oxaf4DP/j1yw9cfOH4P9/01dO+1Mrb0mloUUj5JpAgo8Cl6cQjq0l7N8hwM/sxsp5AixrGD1nP+Scs4bTj1jFm0HpkPA1B0JT354JxWxhuD3JA+HaYKHFAIHCJqUp6da2kV084buoicGOs21zOG/P78/iro5m9aAB1Db2JxQXK9kJWZ2Pwse3QgJvVXH7qu3zqykfBDQ8XWghgHxSaC+f8xjXguUnS6VLqMzGqG2yq61Ks3V7EwhV9WLelJ+s3d2VTRTH1XimWsLAsgbJC94EwGiP9cPVGIUwULJbB3ifPocZhvrwWEhf267ZrK2Yu3Djs1blbT03EY416V/NizqLRPRsGuOuymYUfPHnQY/sTUM1x1QXjX0s44oYv3PjKn7VOHKOEQcswNrK3bSIjl7DNXY8s/MH5J4/4wP7G/sdD8y9ftamuZ6qoCG3CJGNBS4QkgTE2bkNu2bc/Of6XX732+FblZn3/08ffkSBI3/jPRT9KJeMjlFHN+tk1XUQaTSBBKklVjc9/n1j47Z9e/4FvtuYaB4QRaCHIejq1rz+ZOm7A5qnjBnz+4tNX3/LNX898cvn2mqFFMQHNPBdNp0l0jxAIIylKSZ58df2V7y7d8rVJo/u2WE5pR3XDAKWiNZuWjQmDwQ0MA/oWVX3uimP/r7XL+8h5Ex6cOKp3l3HDelW39jOdiX3Y+yH/prPtKN1YZskGAnwXXF3NtPHLuOa8xZx93BJSJbtAe6FAOlDx3MbJ7iFWd2MoRkI3H7f2ZBh0FBkGla9i0KC1XHX2O8xZNpj/PDeex14dS9WuniRjFtLKoY0VsaracXcE+H4QxhdyHDpDVYAt6ygtqaO0FMoj63KGAnQcPIvqXSUsWtuHuet68sZbg1i8egDbqkuRIo7jgNJJhEiHDCYRvmzCdF787r2CJvZkx+GJZ5d9JpvTxFJ5TaPJDGksbSM0CIObg+F9i5ffceMFP2zLNS4+a9w7767Y8fdb/7s4WZyMjw8Pz73d3CZS7py4zZz5209dsHJrt6OG96na17gPP7f0C5ZKoRql0r7vTSaX5gPT+jz91U+e1Kbk4a99+qR73lxWOeOVt7eNSMbjLc4bIZFGg9HEE0mef3X9VT+9ng4RUqHi1rpX94RpQ1fc9btuo6/51pMLlq2rG5WIW42vfVP8UjTbRwIlBHV18L8nFn9r0ui+LVoy9WmvixAqmk/LMwlVyYC4cBrauESOFAEFbWwf39EQBJELI0ddBgZ0X8fvv/wYD/7yP1xyxsukYhUEWQ+To82MkNYjH8MRGE9gMhoT1DJl3AJ+e8ODPPabu/jkuc+TNNtoyNpoobBaEbjdN5q25iH7yrNqAoHxJLgSnZMEaYXJZjGmnrIuWzh+2jt84fJnuefn/+PxW/7KLz//GKdMehclaqjJCDzfwQoU4CFwD+/meR/j1be2XRyP2bTsw8iz2ATaWPhedu6nLz/qL+25zs++eOrtA8tTa10/cse1eL3QxSiloLpB8PLMjZfva7ylqytL5q7cOT3mOBzoaNHGELP1vC9dO7nNzEGAb1w77adFlpztm3zjoL1mHRESDLaSrNmcK39y5orp7bnWvtG6M2BYvzLvzz867bhuxaoh50cEEiMjQbf3PdcC4rEYT7y58VP7uXIrcpUElqVZvyk74L7nl5zTqskegTis54zEkNGKBj/NVae/zL2/+zcfufAl4moXOgsmkMhGb1gnOR0brazIHWjCYKbOgXHTjBq8lJu+/jB3/uq/nDj+HbLpNLkoGfFgYA552CcSWUJHdFUTehq1QAQCHUgCT6KzGiF2MrB8Hdde/jR3//Jf3P+rf/KZ8x+mrGgj1ZmAwEuBPDKYn+83zFqwadiarenBlmXv4QEIYaKcF4zCuJJBfZNrr/nQxBfae71Lzhj2gJsJorH3PvdERJcWCKSjeH3e5ov3NdbM+esvrG3wUTLA7JdeL8jmPKYf1fvV6RMGbG7PvKeN67/9xGP6v5TNeI35SC1dR0uDEOD6MHPOxgv3O2ibNnTb3CDjh/Ws/vwnjvqS79aHirmIbKkWlG9hDMrWbNmejT/92vJjWhqvKGVXa7M7CWNPhNVWJW7M8JM/vn7vC7PXHt3qCR9BOCxCKkweg6xvkRQ7+MWnn+FP33ycAT3XoDMBBKLZvT9EU4y4/KGGE8bH0BYmp9C5DDMmzeeeG//LDz7xJHGxlWzW2YfmeWQj5JcoMAIhA4wMSffCgAhkyBTTEjyJqTPYQTVTxs/nF197jEd+828+e+nzFMfXkakXUcyheRCsgIPFO4s3n9bg+SgMQu9/77teNSce2/u1g7neBacMf7i0OHjNi/LpWkYYmHdswfJVlVP2NdbMhdsvUkZFsZZ97weDIQh8zpwx9KmDmfvZH+j3ONJfJrTa601sSveQGOETs2DBsp0nHcz1DhbXXzbtjjGDy5Z5XhbQ6JZlVHgOCY1w4fW3t7aoFPToFt+kgzBBeF/IJ+nGLIuKapG69ttPvfv1Xz/zp4WrK7p1zIoODQ6hkIrcXCLM93Cziq7J9fzxB4/zqcueB70T7Uf5UDKvaAQdTyzY5/QiK0MGICK2jPBBaKQR6KwgblfypU88y50/e5ChfRdTnw1zj7QwLWq9RyJC/U033leBCfOmhEYIP+Kd6FATjnQF44LJ5Rg2aDk//+JDPHDzfznv5NcJ3BqynoMWIPBoW7WF9wsMSu1G3zkozF1eebodVTBoudqLRhoLLTRaWEybOHj2wVxv/LA+tcP6dV3pBV6LricAGdHflVBU1wclsxduGtzS323cVDvCsmyaahfsDmEUAoM2UJwSb089uvesg5n75WdMfKN7abzC13vHRgU0UruFESjbZs2G2gn7HfAQ6FkXnjbitqwXumvzpIm9YTBCYFuKRWurj29pnNHDymZr349INGYfLGHd6FaM2QoPmzsfWHX9Bz93f+XV333ooQeeX3JmR66ts3CgRIkOhImqLEDO1ZQlN3Lbt5/mpOPnoBs0Qlvhxm6W63NkIG/Wa3SgEPUuJ059l3/dVMXnf3UOc+ZNxClS0PYeaYcR7bi/RqBdBcJl3PAl3Pm9jdz38mpu+tuprN0ymGRRqGD8/wZbWuzY4Q984rU1x0uDDpMqm5OjW4yW4Pm+M7hf8aIJw/vu1lRuW0XdAKX2L+xDUqimJKFeGzO4x+KDXcPRY/vOfWfFYoSdYH97Q0hIp31Wbdh59DHj+63d8/dbt9cMtpQTznGPvWAwkTtREvgwsH/JxqOG96k52LkP6lu0Zu6y+hOs/d4zgRRQn87F3126uc+k0eWHtAFhc5x07IAH/nj3/D/4GtitXFEziLBqhrIUG7fuHNnSOGccN+Yff/vv0m+70seOSC9NVTBagsGSEqsoQdozPPZy5UVPvrj1ohv/MrNqxpTyhy84ccSfT5s+dG5HrrWjcAiFFPhCILwkUm3hF199mpOmzyFo8BHRDT5y3WemGaPbYBpgSJ+1/OfHj/DZX1i88M54Es5hnmInQ5iQUWYQ6JxCyjouPes1jh21ie/eegpPv34sTlKhZHgQHVmKRuchFjMsWlN79Ce+9fxrAFq5qLybrqVbEFmn6XqfL1w15vcTvt53t0TJqp25ciEVYj9vQyDAeJpuPe2K8cN61B7sGgYNSK01hLXv9sdPEiasabBhc93oPX/37qItfWoaghRqX8ekiQ5lRRD49Oqa3H6w8wYYObjbsjmLaiC2f8EupCCbNVTuzJYDh01ITRndb3P/PkUrVm7MjbBsGcbM9nrQYUqOVJrqarfb4jWVZWOHdK9u/hczju6z4pgJPV5/ae7O4+24gxBhZfkDQRhDTICdEBhstlaIbv9+ZMO19z6x5tpRA4tXXXTqsD9++Zrpt3Tcig8eh9g/Y0i7tXz1yle46JR3MQ0aqRVCC7SQBKozElsPHo21sPKFF6NEZ9vJYdsBYDWr3PD+RHjuSqSWSPyQMVgv6V++hv/70WNc/5FnMX41vo7x/4uAAgiEhbEhlrBIJAQpuwgnnsCJx3GSMew9vpx4jFg8hpWyUY7ay01YV+d2kepAQl4TaCgtLT5oAQXQq1vJNtmKdy90BQsqdtb22/N3VdXp8qwHorHFw56fDavHgEZrTfcuxRUdMffyniWb2a8Fkb++IdCSrRXpg+7fdLDo3SuxztcuzYnoeyJfijHnanbsrB/Y0t985RNTri2RPn7g73OcPWGEIhAqqpWosBwoTtmoeJxFGzPDfnT7u38Ye+7fMz/844s3tm91HY9OFVLhds0HNQWZjMPpx87j85fPwrjZ0OcexZ0EGhXsm/N/cDhIJt5u/xBI21Bb15frf3Y+T74xgaTj04l1aY8IhHRZDSIgyDfCFBqdk8TEDn746Sf42Wefw9bb8X2JFmEZnPf5bUFpg6Ul0qhIgQmQUXROGbD2+Mr3bLU0SORuPuJFqzaX1afduJCwvz0r0GgjKEo69R2xhq4lRTulkJhWsJqFgIaMX7bnz+uzdNG6WfnYfcRoBWFr9bISe9fBzTpEaXFsVxjnPvBO842horq+vCOuezDo1a14Y6DDyi4tR6Rk9HNNzkBdQ1DW0jjHTxq64ovXTPlaOlNPoGV0dspGv09LYwt8pAmQOqyBKExYF0RiSNmK0lSKnWkT//2/F397ygdvr7znqUUXdcyq249OFFL5jRoG5ANfUlq0ne9c/QZOvAqjm5e4bEaP7kAtPJ8ndLBDhtXLbUAiHU11th833HgWj75xPKm4BUb/fxKPCZ+PbLypIenCBAKyaT7x4Ze46UtPEhOVBK4TBfcP74w7GyElnIhsIxuTbZv4Zbt/NX4ujMDuZn5nA5PSpqmTzz507CinKSBmi3a1n98TyTgNSkBrjgOBxPX2Lozr+54dhpSbJx3vDpM3DwzEHZE5yGkD4Dh2ZI0e+CU3QDrntrmzbEejOElV2NFdRtVb9kS0fwQYLfByZp8VTb569XG/+crHj/pJNtNAzvfI7ywjIGjB/ZdvhRK244jeYWgqMi00joLS4hQbdtLtSz996aEf/uG5w2pVdZqQCjXpfLKuQ9bNcfmZcxg/ZlWYAyXoZDZYVMInomESlWhpD4wJs9eFE1CX7sMNN57Gg7OOpygVdojxpXzfH8b7hYiShRuyXHbRG/z4+uewgx3owD7cM3tvIZBhbzRg34duVC5kP66itkLK8MhsLXQL+pg2LfDA94Rp4lxLpTpEq2tqonfg+QsjIDj8rmipzP5nsVv9TIM5QAXl73/2lB/+4pvTP5ZKBtTXZTGBitjJuXbO0CC1IGHFsZJF/OHfS7795V8/2eoWIh2NTpMS0ojQlJSCrLbpVVrJJ85dADobMvmMidgoHY28RhC6XppUuta5BFoeUiPsgNpMX67/1Tk8+vp0ipMCZQyuisz293lMav/IB8UF1Ll89KI3+NI1z+Jmc6Dtpr8pYL+wLOOFfK9979UmzVviB6ZDiE+uT8wgEK1IozCApfZ2Gygp3d0rfLfsbMp/+W7QIXMPgjz3+sDvtsBgWXvHAQ81cjkrJUSkPLcw790I/MKgrAPn4Xzyoil3P3LrpV0+dEa//2qTpq4hR+DbUaWePe34/SNsAhsgRBYbKCou5u77V1/3t3ve+mirB+lAdKIpk2d5+ZDOcPoxyxk2dAPGEyB1h7W9zkMAQoGIGUTSIOIS6TgIFUM4FiIFIqkRTpSD1QbImKHGLeeGX5zGY6/NIJGKIYWHLz0wFo4OMHgdup73IkL2l4Rsmi9dMZMPnzmbdNqlKRJTwP6QiNkNMUex/3IkoQsdATnX65DCtnX1uRKtZevOMWNwYnu3GHHiKtv0Xu3rBQvrDSIF6YzZZ3HWtiCbceOtLZkmhKakOLHPuoOHCtXVuR5h3b39W8vGhNT5ZFy2iiAzdlCP6tt/esEV9/7h3OGXnT7wP0nHpyGdJZvT6DY0CmiMJZuwM6+UAU4iya//OffOlZuqOrSYcmvQaRT00N8qMEYRsxs475QVYDJNQSLRlIHU9sElQpjQxSRA2hpUjO0VXVm5thcLVpWzfENP0umwXp0jY3TpXsnYkZWMH7iJEf13ESupAldjfMLy+Y0pWqHmEe77kCRRX9eTr/7qDB56bTolKYM2LgaFNGEP3JAtc6jzeZuVuBX5TbXHbQrTuyKpHHWQJfJHk48fdOCkI2+O0RIla/nR555l5epuvLN2PCnHoPPzbAUb670EocELBFoGUbxu32vLu4WzOsDXZrfEhZEDezakUvHazE6/RKrQ5bJnQq8RoYdCiYDahnSHxFcqd+3qbvJNFQ8AjaCsNLljz5+XJu0qZSl0KINC9ljz3kY0vlooIdmxK9urI+a+Y2dDL7PP7l1NMICUhj5dU3vldx1qbK1MD7ZU6JILKei77xdhBCJqZGk7grLS+F73e3+YPmHgqukTBl61fH3lp557bdVHH315zfWLVu8cl84K4nYMGdrNSG2FhQhabPQqMCKsQIOQOLZgW7Wv7rx//s9u/PKp7erQ2150mpASgBYa37cZ0Hcbk0ZtBs/s9TftgyQQGiM1lq1Ys344dz02niffHM2minKCHASmOHwAKkz+UEGAlFniRbWMGbSZC49dy4WnLaRP3+2IXAbjizyFLQxaGxCOpj7bly/fdA4PvXoMRUVh5W8l8i0Nmg55eUgFVF7Wh7W5cOJN3sz8oSYMQgIyFyYaa8DTmCDfOl6gUTRVdO8YSB09+0DSrdtWvve5V/jod3rj0iXsVWXsTmJwHh54QhOLCXrHrapACFsaqcMeAi1DRyZlSUynyhJyr8Ona2li247K+pJ96b359uhKCSp3Znp0xBq2VLjlGvbpfmoOozV9e5au2vPnvXsUr03FFLk8G3qPg9eQd1WGxWorqrMdMvc1m6qHSQ4c+zQGbCXo2T2+oSOuezBYv7VulG2pFgUU0Pg+GiMpSorgmHHl7RKsIwd2bxg5sPtfPv+RY/8ya976YU++tva6599Yf9W6jelyTxgS8f2Xr2oUXpFhkYw5vPDG2iv5Mu8TIWU0WkLOE0wdtZGuXbez7z6kbUWAMgasYh54YhI/vvMU1lf1ImYnSEhBPOHhyywYFVLgZTrMYzIJAi/Ju4t78+68CfztiXF88ry5fOyid0kmd6CzAiNFWBkppqnP9OaGX57OQ68dQ6pIoUyAG3W2tfThrTAhMAgLNu0o5tf/OI2sX4yMGM3CCCzlk4gH9OlST+/eVQzokWXEoAq6d98WStScQfph7b52W7T7nFmo8Zv6gOMnL+Hq897m9/efSVnCxpcmOqzeH4LKz2hOmFr63P9+d/kZHTFer672+kUr/RHWPg/eMKlaSaiu1mUvv7V+8MnTBh6UdbBw2c7xQqgD2NXhc43ZhqH9S+bu+duRg7o39OhqbV2/ze+jZJ4OvXe2lAGUJdmyvWavXKv2YOX6ihG2Fdai3J8rwxhIJiy6dStqV0HbjsIjLyw9cXtVriyRiOFLjeOLFhKoDRiJ70N5t9LVHXHd4yYOXHXcxIHf/OkX+ObDzy859R+PL/vp7Le3TcdycOzWvIsC2xJs3J7r89KcdRNOmTJofkfMqzXovIoTQiOMhSDLhGGVgH/Aj7QWRoFw4tz18DS+9ccz8GQ5pUk30uJ9fBG6GS0ToEUAQehVEWiEcpFxhUlYbKocxXf+OpAn3hzOTz/zMhPHLMVkNCKmacj05gs3nc9Drx9LWVIjTICrFMIE2MGRwOYTIAV1DSU88OIM6r3uKBlEh4NAGA/wwyCokiTsOgZ128pRw6o5dcYSTp28gW49NyKyQUgh7yBfZWhBm6Y2BG6aT18xi2feHMaGrSOR8fdXRQpjIGnH29yvZ18Y0i+14NlZ204Xxmmx+oOIKMQKQ85l6oJVOyYcrJBasKJygmM3tq/ex18ZtIZUQjKovMuilv6iX++yFas3be1j285e28lgkEahpUZKyY6q+l5Pvb563NnHD21xrNZg9uJtfTZXZgZYdny/AtYIgw6gew+1dcyg/VToOARb8tGXV3/GGNXo9Mi3O9wd4Wo832dov54dLgwuOm3MixedNubF+59ZfOZPb51177ZduiTmqAN4VEIWZc6D1RtqjzplCodMSHVaNNugIIpHDem3eS/z/2AglWHBikH8/G8n41p9SVo5hBYg3Eh4hFURApFnqhi0DNBCY7AwQiCNR8xyKUo5vLFwKh/5ziU8/NIxiFJocHtzw03n8OjL00glnKhasQYjsLUkkMFhb0gbbieNFIZYUpBK+BQlXFKJHKlElmTCkEjaxJOSVEwgRTFrKkZz7yvTuf6XH+KiG67gtrvPpTrdJySadNh6whqNEHZ71VrSu9dWPnXxbHI6CwdoL/BegxYBPrrDqJ1TJwx8Rsp95wxKY5AmJKIIR/LyzLWnHMz1Hn1p6YQtlQ19LUvAARiqga/p1TO1eczglg/6kUO7zNF+/sjdY0OJvDdaIIXA9e1xM99ZfcLBzP3F11ecUZeWE+WBYqtG4nk+Y0f2OqiCtgeLecs39Xhx1vorEnELQZjQ3ZKya4yMwg4uR4/v9VxnzeeSM8c+87dfnj2+R5HJ+gH7FVImoqVjDBVVdQM6a04todOElDAST2hSMcOAXjUtJ1e0F9LhvsfGsL22P3HpQ1QJoSnTOgzQ5KNGEhNS4oleEiMI8ygFgoDSuM+OhiF85aYL+Mf/zuM7N5/Lfa8eRzKlsES60W0YWmahKX64i56LxqNAIU0QnQnN8mdESPFXBCh8lAhwLI9UMiAeK2bl1hF896/nc9mXP87zrx8HsRhGyaj+Ufu3RT5JUBC69YQAsgEfPH0x44asJeM77xNHXwgRtqboMCE1ZkTvmWVFNjpoWa8L93hIfIk5NnMXVxz9ztLN3dt7vf8+Nf9KrcXRoQXc0pORUTxJ4OcCpo7v8/S+xjphUvl9ypbR+7L7+y6MQEd9zEATj1k89eq689o7b4DHX117QSymkGZvayTMUxVhhX4hwPeZNPoAB34nb8xf3D7rrrq0QMqoJ9i+hKsAX2tK4g7HTx74YGfOaero8g2Xnj3qN5lsJpyTsfZhwUdpJsJQ15Du0plz2hOdZ0kJA4GiKOlSWuTTUQUZhAA/F2PxqiE4lo0iaBZ8zH/fPbd/j5k1+4oSioVP0s6SM3359q1n879Xp1Ecl1gmCFmKe75wHbOUDsX+YwnNCxQFSCBuGRLFDvM3DOe6H1zKb/9xKlCGsHWLXJ/2zkhoDT6Ulu3gijPnod36Tk7iPhzoOI1lZP8uDRPGdHsl7boHHNYShpqsOuEv/53/ufZc64W31g5/bVbNCbGEE+3xvV9SLTRGaLTQBNLj5Enl/9vXeGfNGD67X89Yte8feAc5tmLt1tyQ3/9r5iXtmfst97x58cpV9aMSlh21/9l9T4UFFAIEGk8bSsssPjB9yN3tuVZH4Be3vf6N52btOCuZjB3wbyUBWTdgwqhus48a3rPTKfMjR5bNltIjwAop5y2kBxlM6FEyFlKoQxqQ79SySEJLEvEMju113HssQBsLT3kokSNsp93eZYRWlUccLcCSLiJmY1t26NYTigCbI1MstYRW3ORIG5J4qEATixtcu4yf/OMCvvu7s/B1GcrahxrfDmgR2Xyu5sKTljKw93Zc32q0cgvYG2cfP+QOgtapCqmkwxMvrj3vwRcXTW7rdX7+x1e/5xr7OCGb7PI9EXofLHK+ZmC/VPUHTx+zX2vktGkD7splM61gcBoSTnzUrf9Z8uXFa7YXt2Xei1ZVFP/prgVfseP2GNlImNiTqg/5gshuxmPimG6vjBrYo8Nih23ZvTf+36vf/u2/5/0qkYi16lMGg/YEF5898vftnl4bsG7drnEENhLQ0tuH2zffJczQpaSoTZT4g0UnxqQAY7AtDyE70NWnwYnnGNqrCtfL++3bO74B4SKEG1GjNU4gUAS4lo8RAXGda8wvel8gEj5aSBRhXo+SAal4ktsfP4Gf/OUsjCxBdBCnPqwVJjAB9Oq9jTOPWYLnBY0bvoC98ckPTbp7UK9YtdcKrpESAUh76vdufuMXr8/d2L+11/jo1x/++fxVDRPicY3ERIpei/5FpJZkc1kuOHHIbQca95Jzhv8mFTP4rWAWSctiV62e8aUfP3fb2q3VrXrJVm7a6XzxR0/+taZOzpAOGNGs8d8e88aocO8Zl8vPGf2L1ozfFigp9pvBP2fJxvKrvn7fIzffufDGhBPDamXgN+saxgyJbbj6/PH/bct8vvGrZ//wv6fnn9+WzwA8/PTaL8Ti8ajfn2zmdWlCvuStkh59eyQ7hHHYWnSiuy/MVg601RgI7JBxAUyaD561ioSzCz9fYqmpjghhXd/WXTAQNpbRSGMIhGjyyxuF1DaBEATy8NLNOxL54qVahEFbjcAYG0tmSSaT3PbwdO566DiIx8gXA4X2G8Jh6wYRtqYXLmfPWE/SqkYbFXUnff/Q0TsSl5w7+uZsOhsmxAsgyt3bEwaFsmPsrA9O/+S3n77zjgffOX1/476zeHP3Cz/93z8+/sbm85NF8QnChNWw80ScEM3sXKHR2qNXmcPHLhz3wwPNe9r4gRtOntr/sWw2rBtnonJZLc1dS00ibjN3de1VV97w8APPvLZyzP7GfvqVlWM+9pUH/zdvff0VyZiFwAqJBy0kUIcObkHGzTJ+dMmqS84Y98yB5t56CCSG+oxbtudvFq3aUfavR9794NXfeez+S7/4+KZnZlZdUJyIE/bBbNlSbYohh2zRwPW47qMTv9mWGX3pxqf/duv9K7749V++9ujP/vLyD1r7uYu/eN9rK7e7fSxbI0y+mn9L550ADcm4YsTQsrfbMreDRafmSRkJWTdGEHSckAIwHpw4ZTGfv6QPN/3ndHSyCCW9MKFWhC2TW3usynwpH5GvFhAKOBm1WDfIQ56o27kIhXjeosoHsg1hFQ9blfCrf0xjyujNjB2zBJ0VYXXv9laojwLYCAG5gAmjNjJ8QAWLN5RgORJMnmhRQHN857rjf/7gUytv2FLpd7OdfAmdlmKuYQzDicWozcoPfOfmN8r+++jCy886afgzo4Z1X1pakqr2fd/asr267wtvbD7jpdkbT6nJmhNSyRTSBI0Hkgxz3sMCA80C+sIoanP1fPKycT8ZOqB7q2p/XX/15C+9PPeR83UAUolQEWrKCm1EmGdvSCUSrN2cvei67z7df9qEeW+eduKgp4f267IqlUzU5bLZxOpN1cOeeWXD2bPmbzrRM/GJRfEU2gSR4Gspzyj8eUAYD73+yilfat1dbyWEQcQtfnzrzP/97u+vVxljq0AL6eb8eGWtLq9pyCkhJPG4QyqRn83e6wcIREjqQiu08Mikc5w+o98zHz9nYqutqC/98sm/3f3Iimu7lhQTGIvf/WPpj59+cc21Hzpz9O9OmDrgvilHle+VG3bHQ/M+esd/3/nFqk1ueVEiDkbvt2KKQZALcowb3H3p5NH9DmmuWSfmSRksIWiod6jLWnTrSCGlJcKr4+vXvExgSf5yz/Hkgi6kYhrXMhhhR8m27yvp0mloElQaR1lsrxvKL+6axl0/3gJqF0aHlSTaE6YKWUE6tKYDQWnpLqaOXcf81YNwbCuqlu9BK7qK/v+Gr35yyie/8LPnH7KtMiQC1zIovecRkhdeGsu2sFTZ5IVr0pPfXfHuNTFloZREY/C8AI3AjidIJiTSeOxlfTS6gsOyVcIo0lmfcYOL1v7gc6ce0IrK49hx/dd+/MJxN91295JvFJU6KAJ8IVAtcJjyqlLMiWFQk1+bWzH5lXe2X29bCiEF2hg8z4ClicWSxABhWtP3SlDXkOaDJ/V/+NLTxj7Z2rm3BgJwtMX2Hab3FmRvI91IqVUICamiGELnRf3+z6DQl6CRwiKdg/49ktU/ueGki1o7lxt+8fjt/3hk/bUlRWUhi1l6yBLJyh25AT+9Y+7vEv9+93cDeiU39+waW+/YTjaX9VPrNtaP21zTkJJWklQi1opZhkIq62Y596S+h7waeidS0AVCQDoTZ0NFlw61pAQCAoESu/juNc9w50//y9Ej59GQzeFmHCy/Oee/oKMfGCKk1QsXI3Mk44Ln3zqa52eNQjoGofP0/naOTdR6XhrAY8bR63BkWI4p1OTbJ6Aan/D79BFfcc74hy87Z8TdO9MNIEDpMNVid+RdcwYjXIz0sGMOqWQRlhMDpZDKIRFPUhSPEyNs1Hjgqv0aP3BJ2Tl+8ZVTz2rr3H/2xZO/OXVil/k1GQ+DwGoxlawZ01aAETZ2Ik48mcSyY1jSwVExksk4SSeFFXVW2D9CR18m6zGkT7z6B186ofXswTbotIHQyJjGjgfELUlMxnCUwpKhDZcnKB0IYadrqPfTpOIBv/3BKScM79e1VbV5vnzT07f//ZF115WkUmFr2SiXUwUOcStOKpUEili3OSifNb9u+ktzdp76xpK6YyrSpIpiJRRJC1qg77cEzwsY1Ku49iufOOH3rZnbbmi0otv3onaSkIomJAwZ32btll4dqigbEYSvpS8JvDSnTX+L+3/zP/7wtfs5bsxbBH419VnwfIvWVkj+/xkmcmuafOcH6WKCUv7++AS8XBeEFO2W9eERJEOXoRYQBBw1tJKupbvwTL7ZWvu2YWPigThwK4P3Km793rkfO/Xo7jNrGzIIVAsknlABEMZC6rAhoojcaEZqhAAhfbTyo2KiJkxAbpFFHP5eoDCBQWfq+OHnj7vq+CmDVrRn7r/97mknDulhVzdkfVpOFM2vJSBsjhqgTJhLZSRoZdAqcjOLsHqMFvs/UgXgej6pmM/vv/OB6YP7dOmUgLIgbP6pdJiXqZXXROJoSwcVoUnnAkocw60/OGXGyVOGtKoCxw2/eub2ux9cel1JqhiFwQg/oomLKEFYo4yPI3xitiARt0jFLYocC0eFaTda6oi+vz+ERAovV8cXPzb5861fWMehcynowhDoGMvXdAPR2LOzyZfczpOvyWMeuql0BortrVxxwUvcd9MD/OPn/+Ojp71Br9K1pLNpGrKKIFDR5gk1zzB5MZScwoS5UAITxbP+P0P01ufbTwsDVgLeXDiCecsHgnMQxAmivmHCDzW9APp0rWJA7x0EnhNp9O0tmRUdqu9XUyrCI7ddPmPa+C5za+uzBNGhkme05Vm0RESBfLJ6WJkizEiT2kJq2STUEaiIcZBX9hsPfyHwXB8v3cC3P3vsl6750KT/tHfeYwb1qP3rz8+dUN5V1NbkMjQ596KuxfmCtpFVl09wFYSxYqVFNO+wyobS9h7uTtNIzAiVYk1DTpO0XP7w/TNOPnHKoKVtmnArmydGfwwojLEiRlx+Rs2QLyBAVEjWyCg+F3JbtZbU1OXo3ydedfdNF44854RRM1tz5R/d8uzP/nLPsutSqa5I4YVCEisifWmM8CNSVFRtZ7fXIxL6kSDVIr8WGd5L0VQIIZ9/Vldbx6XnDPvPtRcf3a48szAk3dS1oq1nSSedyOEDwRgsWzNnwRDS1b0ayWIm3zriYGJGIlQZpQlvgDYSk9HE1HZOP24Wv//2fTx5y5384YZHOH/qbIriO0hncqRz4BuFMQqlA4QJXU6BUNFr/v9fHCv/IjVp0iClpj5TzHOvDQQpQ597R0CDU1zDqMG1+IHb7CUpYH946v+umHTe8d0fy+3yCHwIVBCxI/NHyu6KWwgZpQA07enGluEGlFaNcUY7sLC0RUPGxbE0v/jmyVd96eMzbjnYeU8d22fDXb89d/ikwSVLa+ob8KPeYqFCmBcu0Wz3rJweveN5sWZEENWRlWFdUBMKX2k0xmhq0xn6dhO1f/v5ORPPP2n4Kwc79wMjJFeBaWzy2vQehQznAItAWFHlCw/LCLSR1OU0nlvHh87ud9879368+4yJ/VptrZ5+woi7JoxJbq1L1xGg0MKg8Bv3gmysiNMk9EM0O9siZUcaCKuDBEgduh/zfaS0MVTXpTn3pH5P3vaD869q/10yMr8nTbP701p0ntkgPKSRWJZk2ZYSFq/pDZaIysjI9kXhDwBD2DLUNCjINdCn5wauuug57vz5PTz6+9v5+ecf5qQJc3FUJXVpTca38YQdFuzU4WYL3l9UvnZCIPCxLJvXFowgW9elw3ZKqK0HDOtfCSITMiuP2K7GohVfhw5333zpBV/77ITvOCpHXb1B6zwZITz4DTLq0H7gPawleEo3voaZQLMrXcfE4Yml/7n5rJHXfPDodltQe2LCsPIdz9/9kTHXnDfkL342TW3OxxeAscI6F9IP59xKL4YRYQ6jFppAaNJeQDqT5vxpgx978I8XdT/12CHzD27Gotn3tnztDmkCFDmUCd2AXiCozabJZhqYNrZk7t9vPH3G3350wWVtnd2MowetePM/1/W9+OR+D6bT9dT6PhorX6KLJp9I686yMFZsEMbGIAlUjnTO4NX7fPKigX/5168/dG5b59gc2oTbVEgT5l+28YztPHYfMizkiqEh3YVHXhrD1IlLEdolL6M68hVv9MMjMCoslSQ8ifENUtQwYmANI4at45MXlLBoVR+emTWSh98YzcqNPch5ZcRjEilBFjrsErpkDZYtWLa5hFUbejFuVCV0VONtA/167sSWWTClsP+cyMMCY6RquVDQHn+HPKTMjW9eO+MXp00ffNcf/vnWbS/M3nx+VVaQillYlrWbznwgCANGCzI5gw4a6N/bqv3IB4/+ydc+PuM3nTX3337v3M+efuryu2/7x9zfvrWo+pgcWRIxm7BLrWzU7g8EYySBMXi5HOgMI4d2X/uZK2Z87apzxx1cnTtDE11etM4vtbt4iixaA8YYAiMIfNCeByJH964x77TpfZ+49IxRvznvpNGvH9RcgTt+cdGHPvDE/Ituu2vebxevTw+2LUnMsaKcrNYLAuUnMTKLJ13cnMTzPEYNLNr8tatnXPuhs8cedH6Z5xM3AThxFaSKEii7be79ThRSAi0CpNEkHIdHXx/BNZf1Z0iv1eBFN9FAR1ZqlSZyz4vIrIzGNlqFXXg9g5C7OGrMLo4av5rPXDKLV94dxAPPTOTFBUOpy3YlZdtI5bF/NkpbfNfvRUTV/qQhXd+D1Vu6Mm5sBw6vDeW9K4nZNtr4rT0PDincXH0809AAev+vSDbt4maTh7Sl9uTRfTff9cuLLnhz4YbB9z+15Ksvvb358s3b67t5roWQEqUEUkqEEI3y0xiDNmACjdYhkSGVEBwzvvucs08Yd8f1Vx3zl0Mx97Onj5x59vSRxz792rJjHnhmxVdnz9t+zvaaXMr1FUoJLCmQUuwWZ9TGYDRorQkCjSUMZUUymDSh5/MXnTbyzx8+d/xjHTG3QAcq01CHsQyyFQ0ggWY0esLwgxAoS2DbNkVJ4Q0pL5s/akCXOVOP6v3k5R00z+a48twJD1957oSH77jv7Y/e/9zyG5asrD26vh6EspA2OEIipWR3dStKNcjfUy9NYHLEHMGEIcWLPnjGuFs+d9Ux/9dRc6yr9br4gaZH9651Qwb1I505YoQUjYlhyvLZsqMff79/Cj+7YRP42VDr61BTSu920DU32PO0XRGqSpgcCHIUJ7dx3qnbOO+kZby1dAD/enwcT706iZ0NXUgmFEoYtPAjH3ikJYkAjeKA7QHe4wjX6OFpiwXLunLhaQ4dZkoZ6NaljtJYjqqMOCLLzX7p6uM+++Hz/cFKSa/5PjV7OD59P3D69YwtP9TzAzh2/IC1x44f8Hng8y+/vXrc7Pnbzl+0svK4bTvrB9fVud2yWZPygsARAhxbZYsS1q6upYmtA/qklk4a1/f5iWN6vjhxRN9DWoctj7NOGDX7rBNGXQbwxKsrj39r/uZzVqzbNWlHdf2A+jq/LJM1JYEJlBQyiDlWtjhlVXUti20d3L9s0bHj+z82YVSPV4YP7NZhbVQBjh3ff+0fv3/2B7XlyAMT3fNBFhNyEYXAtkQ24ciGVMqpLitO7Jg0qvfWjpzf/nDtpVPvvvbSqXe/vWjjgDfmbL1o9sKt52zYXju6cle2vK4+q3SgwuRmQkEqpaEoYdG9a3xz317FqyaP7fbciVMG3nf8xIHtYnLuD2s3bj/KtgWeK1YsWVGB6xmmDE21+vOdKqRChI87nlT865nJnDdjLcdOmY3JtN687wwYCLdZ1gKqmTammmnj1jD/gvncdu9UHnttMjlTQtKRaOFFrZ4VQpiwNcYRebR2JDQYhZAB6zb1Bj8W5lF1hFwOoDhuKCmupyLd7i4TnYrTZ4ycA8w53PNoLU6eOnTRyVPb30DwcOLcE4e/fu6Jww/a/dURuPKCCQ8f7jkcDKaO679h6rj+twC3AKzaUmVX7Uz3q6vTZdmcm8Jo4o7dUFTsVHcri28dPqB7hwr6lvDags0f6tHV2TawW3yeyLnY+oiJSe0OJQPS2Z5877YT+N9Nm+jWZTMmJzvU3dcehGVgJNo1IOuZMHoxf/neJi6YvZTf/H0G81aPJha3sKSLNjGEMeSL1Lx/LamwMBQCpFRUNZTi+2B1oOWbsDWJZD1GQ8vdSVszy07h3xRQwPsGw/p284b17bb2cF1/wYod3WYv3HX08WO7/69vj9LqrNv2dJNDag4UOT5z14zi6384g2yuL8I5/DmYkohZJEAEAp21MEEN58yYw303/5dPn/syMltL4FpImY2yuttOo3xvIepBJTwUgtqMFZam6SiBYMBSPrGYizY2ezbIK6CAAt4fuPVfb9/ipzOce9Lov1oJGzsRw04cuKdWcxxSIeULQzJhePSVaXz/t6eTC8oQdvi7xoS8PTKVOrv0aGOuiVahoMpXX0gbupZs4cavP8LPv/IwSbWTXC4RWhjNbKn3I5onigohyORi+IHdoTFEKQy2Otjk6SgA/P9lBnYBBRzZ+PdTCy6+56l1Vx43qfujQ0Z0f0lbEhW3UPG2OfAOmbsvTDIzeAJiyTj/evIE6ryAG294na6l6yED5LvgRsyefGWKznQJNopEkTdDoyx8CcYD4dfz8Q++Sq8uOb5601lUZAcRt30OXEPsvY6w+rmWmiAA7XdsLpOQoKRB4NNe6RdWJgBhWmglWkABBRw2PPDc0jO/+avXHuhWpDd87uOnfql7z27ksu2rLHPIhFQ+5qBM1Iy91OLel09gw/bu/OILLzBhzHLwXAItUDrMePZVKJ8OX36tCKm7DZqzTpmDJeBTN55H1uuJfcju3GGAaCpWKaIvEzEmhGj690EhZEU1Zuy3R1Dl91Rb8oMKKKCAzsXPb3vpB7+7e+GPi2LBlq9cN/2KkcN7r5PCIum079A8hEJKoKXBCsJeTVpCccLmrWWTuex7Zdzw4bf4xAVvEkvsgmxU8sWADMRhJNKFh6A0At3gcdqJc/hZVYwbbvkg0pRgCa/T3ZGHA+GqNWADAiUNysozbjtAQAmi3kVhlYSDGUhrsGKyo9KMCyiggHZgyertJc+/tu6jdz+1+AeLVtb0nDSq25uThzmfnjZl+ILiIhvXhfZ6TA6hPRBWCw6kbIw+aSAZ96irG8wPbuvJC68P4for3+XkYxahaMD4QdjI6DDDCJC+xGRcrrzobeauLOefj56MSuVjU+/D+JRRhNLEx3Y8lAo6dJlGC4IAwvhe2zLk8xAGHMfiqVfWXFtVUd3H1UFcaOuwM0YLKOD9jfDMS+dEyYbNDaPXbUqPXrp267iaBpf+PZNrrz5r+DcmjO7zp+07t2Ua0jl0nmvWThzCmBSEvUuiYpE0FZl1LI2lEry0aAqzfjiMM48dxScvmM8xE1chEzVhvCqQ6Mjv13gGRYUQm5fX7BwYjAyL2Cq/nm997CVmzevPsh0jSKpQ+AraX9X9yEPY6loIH6MVRYksdgeX1wu0hetFXYKBdrn8hEHGBU+9vumcZ19cdY6vAqSJ0VjpuYACCugERGe3CnQylsykYrGtRw0vuad/ednjE0f1fcox1i430Hh+xxgYhziy0rzKeLPKzIAQAak4aFPKYy+fwDNvj+eEo1bz8dPncfy05RSV7UL6PrgCowkj7zIS0UY1i210xqxD+rUEcAXdem/lU5e/xddvLkfEi9FCoox+H2nw+bYligBJaVE9li077vYKyPmKhmwyKn/T3mKtEieQDB/ATxp27XrcJxBSOM2UlvfL8yiggCMH+Vhwj7IS76wzj672dbDNsnQmkxVYjk2uzoMD1uxoPY648L8lPERKoHVXXny7mJfmDGPM4G2cd/wCzj5hM6MHrkI4DeAF4DenqB+KA8mEhXGzhg+dtJC7H5nAojUTUDEddph9nzGhDWAC6NttJ8LJQAfmpjdkJXX1pWGLcNoXdjQYAgL69um53C2z3l69dgXC6EjwmfeR0lBAAUcQIt+dEhCL2RhXkHMzeL5Et7GaRGtwxAkpV9hIDJbwsR1wRSmL1paxcOUA/vJANceM28BZ05dz8uRNlPfahlR14AWYAA5V4VejIVWykwtOW8HcvwwjpmMYYRN2GH2/QIJwUSjGj6wCmeu4OythZ12KuoYEwnIRQrfrsYXN5AzG1U7fnv3QvmH9+rUgZZsKk2tzZDhqjTFRUdgjYTYFFLB/GEBr0zFkqv3gCBNSImwfLTy0iGGEj20CbBu0naLeTfL0m715etYEyntUMX3CUs6bsZ5jj1pN1+7VoDPghdV9o0wrOk1oeT5nTlvBrf86nrpcL5Tlv49q9OSrx8dJxKoZPrCq/c1zW4KC7dtLyORslBM2WjtwG+uWELbKDoTGDXx69umHFoKN68MqMC2d9WE1cIMONMYYpJIk4jGMMR1Tl/AgIKUkCHxyubAKvzFg21abhJYxBt/30QYsJQkC3VgR/fC6P0VUzTycT14gW1brg53hMzKRtm4ItEFKgRTtI950JIwJD2ylRLQ2iVKt9w+E69KNlog2BillR3rN2ohmrRKNjsrHAZESJQ/hxI4wIZVvga0AHebnQJjPi4ctwI4bNEm218T43/PlPPJCNUPLt3Hy1DWce/IKpo1ch0zUQi5sCpePd4SV9zswbhXAsPIKJoxYz/Nz+5JQBklAx5Z2P3wwIiDwYvTvXcWI/pUdayQKwcYdJbiBRbFuyodr8xyJ2l9LA9JHa58+fXoh0GxYvy70+Il8WwKN7wfE4zFKkgl69uzK6BEDWb1yE0dPGkMmJ8jmdPvDYwcDA2gYUN6L1auXUFlVTbw4xa6qXaxZt4na2gYsW2Fb+35dg0DjeR7xeIxhQweSjDvkAsGIQb2prKiktjaLkIehuaTJV7nUlBUn6NG7J6s278Ctr6W2LktF5c7ocFf7tH6DIMD1fJKJOMlEnNLiIrp278qQft3Ztn0XNdW1IA/PUaZ12G69rCRO1+4plq2rwMvkaGhIU7mzOtxzMWefioYxhiDQOI5Nl9JSunYpomuvngzoVcqWjdvZtSsNsp0vSLthyOfHGwOlpSXEixI05AKqtm1je0Ul9fUZXNftdCsKjjghBTRj/rUMgcTHURonITG6J6u2FbPwwSH886ljmTpmFZeftoSzjl9OUekOyIZ9dDp8lkYi4/WMHb6LF97OQZz3kSUlkNoh5/lMG7uG7t2qINehw7NuS3cC46CFCP2nBzdcI1kiCHx69+kNGDZsWIfWhlzOpaS0iBFD+3LUuJFUVO2ib5+uDB7Yh0xNllQygbQUUgVhb6tD/BjDBoRQUlJCcVERyUSCXv1707UkxfKVG4nHJM88P4vNW3ZgO9ZuwioINLmcS9euJcw45jjK+/dg8KB+NNTU8sa7qxg7aigbYpJtOxqQ6tC/7vlDzJiA8p7FDBo+jKyl6Fc8kB59BvL8i6+zZt0mKiurMcYQi9nN1haQzXr06FHGSdMnY8dsKndWU5YqRsViTBhZTtLZzBZLIVTb6sF1FIIgVEz79iqm38Au7MxCr+JiEkmbopIUy1es4/U35pHNZonHY43CyhiD63o4jk3P7mWcfurxWMbGifu4VoxRA7qTQLBR1oBlIQ6xkNI6iOYJfXr3oKhrGTU5n15diunRqyu9e/QgU59FCPA8H23aG1k+MI5AIdUKmKh6uvBB5rCkoNiKoU2Cl+d259W5Yzjq4TV89pK5fPCkd5F2WCBWiKCDFRKPccM240gXODwvSefAoNFYVpozjl0L+RYdHXB4Cwk6k2DZmu4IyyKQPtK0zxUlohJWorEyRvhzHRj69ClHB4btOzZz8olTOeeMGazfsI1s1mN7xU48z8d1PfwgiNwsAq31YRVSQTQX3w/nlsu5FKWSnHfWFE6cMZlXXp/DMy/MYsvWCiyl8P2Arl1KOOes4znlpMkUJ4pYu2kjvg7I5bzQAnE9PD8gCILDkiLRXEh5fjgf3w8tI6UUXbqUctmkEfTsEufeh19j0dL1AARa071bKR+8aCpnfGAaxVYXnn/jLSp27sL3fYxS5FwPz/cJAo04TPHgvJAK1+YTBAGe75PAYdSIQZx3zhTOOONYHn/iNd56axHZrIuUAidmM/HocRw9cTSb162jW5cyanelcT0fzyhyuabnFrrYDp+Q8nwfz/PwvSC898YwaOAAJh01HGVlWbB4PTt37WR7ZQbfDzCBRgjVYVbWe1NIidDExggEPlpIJB5SGFJxiSHG4hXT+Owvh/PE68P46WdfpLz3WnS2Ayt5A/gwfOAOUimPtJ8C2ZGBm8MHAWQ9hzH9VnD8pDXgBhjRPH3g4Aav2NWT1Zu7E1MQBrva74Zqij3u3pkw8AN69uzNx646lwnjyvE8WLlqY3SohLBthaUEMcdCowiCUIgeFiEVQDxm49gKY4JGn3+gNQ1pTSIR56LzTuCk4yfz4itzeOPNuYwZPYQzPnAsvXt3J5dzqd3VgO8HxPLlKIXAsRW2JbGUQKrDIaTy3wW2JXFstZs14fuh9XrSjHFMnjCMmW8v5dGnZjNsxADOO2c6ffp0IZsJqNme3e3Z7bk2cRjWBvmSXC2vLZdzyWZhxPB+fPWGK1i+fCMPP/IKdQ05ZsyYRr8BfcllMqxftRo/CBoPdSkEjmM1rg0l2kQE6gjoxnWAbUlsWyHcJo+H53l4HpSWxplx7Eiy2YDtFTVUVzewc3st6XSuwwhA70khZRqFlIq0aYkhiBKGFUZYJOL1eCR44OXprN9cxF9+9DjDy1djdiug095DNzyuhYEuqXqSqQbqarocxFF7+JGvACIQaCPxvTRXnDOHktJKTFbBwbbTMCKk71uGVZvK2FbdHVvI8HnR8WEgz/MZOrgvo0eW05DefXylJI4tWL+xctrmiszUdS8tGeUap7cXmLA04SG2OERIkhDzl27KZut3ru7eLbWouFvpK7GuxTvyL3oQaBrSkEgkuOj8Eznz9OkoSxAEAel0djet1XEsYjGF73vlK9bumLhta32/6pqcLaR32NgFxgQi6ws3I7dt8T13nmM7m/KkCWMM6UwObQwnzxjP9GPGop0Yvh/QkHYj5m4IKUOB4Pten6WrK47euKWmfNeunCM6MU9yf9BaCxBkA+E1BGZL4PvzbFtsbE6ayEWu8lEj+/OFz3+EFWt2IAS4OQ/Pa1JslZJYtqTadXsvWbHt6PWba/tV7szFUB7i0NJ6RFNMyohsUOsm6vxtRSXJBUqKtc1JE1qDDsCyFAP7dWVAeVe8kZBuyOL6wykqSuC575GKEx2Jpgrk+QKj4fFqwqZQSCAQEoRPl6TFOysn8e2b09z181oSTgVGS6SJUtLaZUabxm8x25BwcmEA9T2aJmUESC0Q0kOgyGSTjB+ykstOX4zx/YjO0n6BHl7ECt2zIsabc8upz6YoSXiELSQ71lVjTMiUmzRxeJjrbUKmnxAQsxU7KuoumLew9qurttWf6Aowngw14sPYKRoERmuwApRooMe8yi3HTup726ihPX4di8lczg33uDbgugYhIJfbvWShkpKYY7F42YYz3pi17jNL1+06vi6zq4fcq+n94YHWOYyppksyqBrVP/7kWcmeN9m2bOwmbIwhk3VBSHLZaG3R9pFS4NiShobcCYuX1Vy/vTI4papB9NTKQyEJg6aHj+GnTRphKihJUDWoZ+65yRN7/Coes+Y1NyZyOfB8D98PBZMQTQ/FsRXbqtNT5yzZ+IV122rO2Fmre2lhhaQJ9CFWm5pDYEwGoQNKU6q2e1eeHVKeuMlx1NvN1xa6BcN/SwnFpXEE8VCIHeRr9Z4UUq1BUwEmQSqleXnBeB59dTmXn12JyZl2VeHZc3w0OFZAzHYPY6X2g4fUEl8awILAQont3PCRVyjrtgM/o5CREtC++noSg0FLg8IQ5JLMWjQaZfkIIQkkWIEIG092EHzfZ9jQfgwc0BXfD18aJcGS0n7qpeW3vL1s12dyfhzHjmNLN2K9SQ7aWjwoCISx0MLDCMm2BtH3vhfW/XTyxprjx4wccGW3rmU7g/zbbkDZareSh7alqHNziYefnveHF9/ccZ2vLWJOPHSFiSi+cFiZpwYlNWiH6qzT7fVluY8u3fTKBROHpj41ZkT5vbv9pdldqFpKYYKc/cbb6375+qLqL2U8pZR0sJwAG4XQsci7crheQoNEIdDUuHR7d21w+bJNK88rKim7YdDgnn/zoqmFBsjuz0AIiDlKPPfa4p/MWlDzjbqcdmLKQlgSJSQi0rAO17ML33qDFDGqs35Jxebgko2bGs7u3m3ztyaOG/mnljIbTOS+7ii8b4WUQWCMDTJHPLDImhJee6c/l58VR4g0RsiDjLNE9atE9PK9x6nn0miMsKnNwDUXzuaCUxZDxmCZ0P1nZPu0OSN0I18TBxav7MPcFT1wbCsqr9LxgkEIwbAhvaira8D1woMgHpO88tbqP724oPJTRU4xccdDagGBQ6ACwpSHDp9KG6AJVAapJUqHTEM7GWfOqrozb/7TC3/99JWTL/cCHRgNRhv6DuxDUVkKrcNcL89z7T//66V/vfB21cUlsRIcO0ASoIUmEDJK7Th8C4yqdCJFgCMMypLUpO3SV+fX/+voo+vSjm097vshcUUbgYkouUpKsrms9avbnvvbi3MrPhaLJ0laoXNaaIURoKWLPOzVXnwEoKTAjvl4XnHRH++c939g6k4+fvz/stkAKcANdt/vlhJi+Zqa389c1vBF20mRcGy00Ij8esIYxmE9XQQQSI0UhoRReFql/v3Ikj+WJBL1115z3D8y2fbsq9av6H0rpECjMBgTIxABFoLK6lKMZ3dMiq8RIAwaQaCt93RxWS01SkvqGjQnTXyL71/3KsLUYIwEEearHZTlKUAGgGXz0tvDqKvvSqwoAGNhBQYtOy4NRGtNSWkSK2HYUlUZ0podxSNPL/rQc7M3fSoZL0ISHgJGuhjkXu7jwwOB0A4AWvhh8VztUBQzzN1Yf8nr76z78HkfmPgf1wsD7E4ihrQshDQkEjZ33D3z6y++tf3iklRXjMjhi3wfNtnsAD986wuVQS+ymCXSgLIkDX7cvveJZX8+efrYN8vKUpWBNrhuwI6KOgCScYdnX5z3qWfmrv9YSbwY24QdvkUU48TYKBN0qCXeLpgwvqaMBhyUFZATNv+4d8Hvjxo34PU+fbtu9n1wfIOlw7uRiDs89fyyj8xelv5izC7FMQG+aO61MNEaZceQlg4CyoTvqxFBKDVMjH89/s4fpkzr/9qA/r1Xu17QtuOhW+vZ0IdZSBk0EsuAqySOrzFC4isfSxsMMi8L2j6yCOvPaunhKjAEJONpsAx4YESeKtDemQuEDP2wGS/WYUyWjkfThgcwQiKMRhqJFjqUPdqmtkFy9Pi3+ON3nqFLais6qlAervNgrJ1Ig1eaXG0XHn9lGMK2kbgQdWHuSA3f9zV9+3Rh4IAeeFHsBgLrnYVV3waFo20C6WKEpLHa+z4OAGFEI8tJmNBqNgaM1I2HUijEafxvI8JCw8KI0FITJtSMo4RyLWTI5mthUzfGVvNbSWgkEoVmzoqKr588g/uCQHpBYOgVl5SUCJSUbNtR3fepV1Z8LRVLIIyPQCK0ifY45HMP87lk4Z6QjfUmm/9caoGnNFIrtAjQgURJgSV8gnz8UBjyLVGEMWFcUYRU7FAE6X0obbJxNvl7lVKKdduCAf+4d/YnPjB99K/TGZfi0mLKundHSsHO2oauj7yw8ptJO3zHAgGgMTLc04KOzhkwUTEBgRF+43uCkQgREAgVCf89np/QNPlTNEYYHMtQVUvvp19Y/tmrPzzte76rSWcyrFqzLlyL7yefeXX5d4VKIGWAKwKkEbunZOy1TZr/TmCQBFJgaz//o/2vLtx8uyvqkbUWNps1tOQXCveSD0ikBmFJKutkyf1PLfzyNR+JfyGbbXqurUOPVv/lYRVS4S0Ob1bgGeoCTZElURp84lgmQBi/2cvWhrGNIhAgtMBG4/kBY4dVIOwsxhWRq+9gJh/S2b2cJJtzwvpzRyTyGydPYAhCK0KEWpoXxMhl05x+7Dx+99Wn6dtjHSYnEDJcX0docMIACXhx1mgWrRmMY5sw162N27o1kFLgux5b12/F8wy2Jdi8beeYdZtqJlp2Ai2CZody8+97zRoQKOMTCItAKITwEMaKWKU+GAut44TEDz+KHahIGPkEKowzQXggSxGVOxKhZdryDjSRZRcqUQZwLId1WxvGvTFr9oTePcvm+L5mzYZQgXMsxcp1O07dWed3iVkJhDHhp8Tua2t6jvkeaB5KKwIZoBEoE6qMgXQQniHnZnDiAb2KMlTWF1HnSizHJiF1+HciarMig8ZUEGEUWgg0ViRw97y3eaJT40pDoWZZLFq67Yorzzn2D3SVLgJ2VW7AsSWLFm48ZVt1ZkDMKYp2SyT+Gu9Rx6cM5ONbAo0vBcYoBAopDNKESlVL12z6UfgMNRLLEcyZv/7DF54x6kapVNrNeVgqgW0p1u3YceL6Km+kY9mAadHiFXv8d/7fgRFkclmk0cTicYwKQB/4OBdGII2FxCerJelcjpgQyFRT+S1hZKR0tLTC6BkaiMdivD1v7UXTRhV/Rym7rk15UePeI0IqdMgJslkYP2Q140dU8N9nxmI7JQjlAQEYh/YVjtORT97G8xQ9um3kvJOXg+tGjLKDPR7D4G5VbSkN6UR4qB+RaNKcgcYXwTOKdEZSltjAFz7yNl++6g2SThXaDQPyHZUcaQitmSDXhX88PQYvKMJxOleg9+nehSKnBF9pEjGL+Tu2T6rNGpWI24BH6/yWBi1CwofUGmUEnpF4Xki5VdogVBbHqUdIFxAE2ibrWpjAAmOhbINt+9gRKSMgLJ4stYiUhNbsmfBAzGWxfBInlPfvP8f1AqoqKshk0iAM23c0HBvgYBDIRqt5L10YQxjDCQ95Bz9S4tAWgRQY5SFdTb8eG7jszKVMGr2JIf22smJtOfNWlnPf8yPZtH0gSjlINIGx0FKiCMv2SECaAF/SqK3vf2mhomJbim1Vwbg5C1cNKC1NrOrStYyS0h7EHMmWijVTAx2+r7tbgp0FiY7ukdQWgS8w2kUbibQVCQS+8mA3N3HLEIC0JVuqgsELV2wfXN63bLHvGZLJFPGYYOs2d7wfWDhW286OIFD0KtvGJ86bj5QB/3xsIuuq+xGT/gGVSiPAEwbtGUYPXM2VZy1m044kdz5+Aj4KZGhRHfgeh7HQmjr61jbI0X37dHnL8zsnofowW1JQ6waM7bOaP3/rSUaP3Ezv7tv5039OJfCKkDER0pbbC+OgRUA25/LZj85l1OANmAyRhXBwtE4BoGDFur7UNzjYiYMYrFMRCaiQjIgXCNycojhewYXHLuNzl89m2oRV4GcJ/Lz90HECVwAk4JU3RvLGO6NIxUJXSGeFEKSSbNy8nZ27doWxG0uxYUtVL6WcSLvX0ColRYQapa/IZSWSBrqW1jFqZAWjhqxhSN8a+vSop7TIxVJhFrDn29TWSTZXxlmzuQ+L1/Zl1bqeVNV0IZBx4g4o4+PLUPAcSK+J6AEIoXGsOAtW7BhYuauOTNbj4gunMmpED3QAz765aZwKBMIKIgVsfztbgwgI3Dhp35CwGkjG09RnivByKQI34PpTljJ6aB2vvZXgpGN28J/HhjBiZCVXnOHzo78PQvgGhyypRD2BnyCTLcLEBbZl4xg3us+tyRo0IAwKSUPOs0u6FQ8+euLAVZs21XDHP2aipGD11qpRju20YqyOgcgnQBqF6yuG9lrB9z79OrX1gh/dcQbVdb1xAodAHvhADj1FAi8QatPmbeOErl8slUWfPt1wEpJMoEe1tb1PYCQ536a0ZBefu+oVpDQ88uogzI7+CEdilB+RLlreXNIYtBFk3ASD+u7g2iteYNXKvtz96BTcoAfScqFVNUgF0kAQ2PK5WSum9Oq+6a0gaP1LffUFo1v9t4dNSBkgk1aM6bua//vxo4weuQwymm9f8xwjBlZy4/+dxPotQ4mlBEo216LyOtX+qQoCcI2NW5fh6gte4zMffgncXFidwkT09IOIIwkjQAoWrelBYGI4h4m+bIzA8y1c32b3tHQTVWYW+FqDyRF3Ghjcq4bpR63k0lOWceyE1WDXoV0QWiLzDph9uDPaAyENWbc7t943lZzfhVQ8X228c6SUQFCXbsD102DAsiTpbMYKhW+eit2SnZH/dPjbwCgasj7dEjs54bg1nDtjFdPHrGVAvyqseA5MDoTevQlw3gMlJQQx3GyMNVt789b8/jw9czAzF46kLltGLCEaozP7RTRRYTRSws6aTDzIZcjkPLR2SCZL8X0QMlYEaQQCLRR7RBwiWCByGJNA+zCg5wpOO2YjMyZtpnf3nazZ0os33u7No68PRwMvv13OghUJ0PN5e+kINlYYhg3cRZIaLjl9CTOmbGVgr+3kAsUrbw7giTdGs2ln//Ct1A5G+AdWAkUARiGNIJABC5Zt7lWfzlKxo46VazYgMNR6MiF3Kx6bVzA6av+ENzkfswvPhNAtm/F8LjlnPmd+4GUgwRsL+vLPR7tilcb2sOryyS7NRxToyD2oJMyavbDHu8onVZRkwoTBxGxJRWVNsaVavw5jwDIZtKhH6XrSaR9bajBppKxGIgl0klARaXkMjUCKahwBImgA7ZPNeqBqsXQYp9WiCHnAepqhAK7LGaYcNaTLpy+bSn3aPcBn2odDKqRE5FXWQuKlDUPKV3P7jx9jzIglmEzo+5Vemg+dMYvJoyv40z3TeOTl0eys64llx4k5uejeh6wzgw610SjAnfdV+0aScTXF1jau/8hMvnbtGzhiFzoQYc6PEI3irr0wwhCki5i/qhtCOUg6sN9SqxC+HI5qoLzHGjxvB0KGGpBAIEWAZft0L8vRv28Nw/rUMW7oGiaM2knXLpVABuMBuWg/R374g2Uphmy5MOakJagYPPTIUbw+fwSJWCgAO7sOmZAKJSXGhBTmpv5SIiQ4tLBEaSSBNAgtqM/ZlMS38rEzF/LR8xcwedRmhFPd2GiTzB47J2JBgsSYfKwmgyMzjBpYzaihy/joeaW8vXQw/3x0Io+/Npp6tydFMRGx1PKloVoiU4TPWQsQ0hilQKmwTYXrQVgpqFm1FalbdkMZECiU0dTl4JpLVjO4TwXrttRy1ow1vPl2io9csJp4LEM66+M4ELM9EAbLNiQcF+3ZdO9axXWXLOS/T/bmhNGbyBIwrL/glm/X8Ynv29TU9YuMKAswGKlD7V2YvecVWRFaGAQK4wsCVxH4Ej/wo/PCkrvrkh2tDIbVaoxQkaDSgIXRipioY/ywjaHM8rJ87rK32Li9J7MWjMZybAIZILTAzwh8JUlaGqTA0pqg0UAKY37ChMqDMBYisDFSErI/WmdJGcDzDN/4+EucMnURMe0St2pB+PzuhidxzUu8uWgYP/nbOdjKalTjNYSuWGPQWpFIVPPrLz1Mv27bKU3WY3IeA/tu5d+//BdxleL/Hp3Kvc9MJxFvSdFpjnBPIgIcK+7EnASu3znupEMqpAwGLRTprGRY79Xc+cP7GTN8BUFahcQDAQESlYZBvVZw89c2c/V5C7j/mdE8984Q1m7theeVIIWPUAIjHBAhm0gEihwG3/h0tSo4YfIaPv3hdzhl6gLwsuhANpnyHUEGsA1r1pSzaFV/LNtr+SXsRBhhMJ6gf69a7v/dQ40JsYawTJQUBsvWFMfqUfF0FOAOwDeQa+kOHIhI0JpJAQK0DO+1cgI2bRrGb+6ZjpIptAyZUqozytLvMQ/T7KsJ+3nxRIDWFum0xynj3+Vr187i2InLgDS4oH2FEXJvDTOin5rdshpDBhVGgAvGBSNrmDZ+AdPGr+Syd8Zw8/9NZ+byUTiJIuJGhy/8AdCkve+P7NHy74z0EEaS9QA/x7I1igefH0xxooFrL9zCv54bT4PeSSpWTyaIRcpK3uEIgVB4+JQWadZvT/D3p8bxyQ8uY/6Kbvz0b1P48/cXE5DDjm3DUT7ajdOQS4HtEFN5xtyeAkbs9m9BXsUKexZ1/tsUOuSklgSBxNcGg4cxcbwgx0fOmsOM8etCxcQYRoxcyacvncNrC4YhcVCBhS8amDFhHb6Bt5YPwDYpfKWR2grJKJFCFjazJCInSAT5uE/rVmlQaJ1j7NCtTDxqOSAhFyahj5mwDhBkcsVoo/EkxLRECxG2DzLhWrVR2MIwfeJ6evRcHwWoJMXFmmMmrQbiDJw9COO3Le/TGGMCTRu78rZ+/EMmpPIWVCZrMazHMu740WOMGbUcnQ03pjQRq8YIAhk22ZJeA+NGLmDc6OV8sbIri5YP4N01PZi7vA8Vu4poSCdxfQeBIO6k6dVlF1PGbuDEiduZMnYlwqrHZImCuKYt9+XAsCSvvDOYyrpSimOEOUWH0JYSOjyQlJWlT+n63QsmNJuGIfRMIWg8ePZmDHXUpML7nKdra92Vn90xnTVbhpJKaZQO0CJPhz6Edud+lYdQe84ZC+PW8oVL3uIb1z1PMlmFyfoYI5BCILREmGCvPWSERFgBEoHxooMnn8cDocUvRNjYMa0wTgMnTX2bKcM38aM7Tuaux47FjaewhGnTIxECRGTARXyzRjd4SwMF2iGbznHqtHlcefYCCCRnTXMoSWzEzQRYcRtlK4ze050W6uMGhSagJJUDP0aPuE9R0mNXXZyeJYKa6hTlZTX88Atvk824lKXSLF1bxk3/nk5VRT9iKZoa5+0D+aaGHdujqPk9EewpyA0Btp1hQO8qSktrcKQgkzGcf+Iirrv8LSy7gYZdZfjCRmmbd+b1RuMgjCCXa+Ca817jZ199CuNb/OSPZ/DXR0/AiccxxkHINNCchHAQCrIw2Lbkrw+cxLOzhoB2CXAwxkaSQ0nYVNETW1oYIwiitIcQobWmpE/WTfCd359FWVEtQcQGFMYQSIUlLN5d1RcnHs51/+k/Tczczn6XD5mQEhjcjMXQXqv4+w8fZezoxZi0jCyhAC0UAQol3Ij9FLJnjA8In66lWzlxxlZOPF6CX4ybUeR8QRCE2p5lG5JxiUzUgO+DJ9BuqCUhwsMxnEcHrEVCpqE7D70yGiVSSHw0fhS0PkQQzTaJF1bPiPpWNP5JGPqJRJMJD1TT5AToBDTbrPE4f/vvsTzw0jQSSYnSOvTRR4m0rbEcDg0MvrHBree7n3iBL3zkZfBrMWkBQiAdCV4M4QQEnr+Xc0ZamtqaniB9SlK1aBNECkRk7aJQlhO6AVUGsgIdKFKprfz6i4/RvdTjlrtPRsdTYSuZtky9URHf/6eMkcRkLZ+57DU+fPoaRoxZwl33TuEfj/Xhnl+9g1AGxxfNjp3mH5aNbVBEIOhWVkdDTqKcBpIxzaZt3UimPOozASdN28C6dQkeeqkL9//2GbqXFTG4f4Zb7pnKrHljsA4d/4HmdidGYZonbIv8wSpA+/TtXcPFp6/j3GPfZciAHUg7B6KGXH0pf/nX2dz74iikUkgsVm7uQ8oWKB0Q2C7nn7QSRQ1YcOnZc/nbY1PwgxJsK0ukGXbIUjzPx89leOqNfgTBQAQyVPhE6FqXJsBWAXHHxXESyNjuSo8AXC9LQ4PP3U9OwZc+UktEaCZisNAGbMeQdHIkZAxL7WNPHGJ0opAyhP7e0P1Ul1MM67WcO370KGNHL0Gnw5bWJiIwGGlQQRBx9A3CRMG/iM6qA4n0I2tA1ODY4MRoUpAiJcU0EGnOoQvRSB9j8jWw2rmSvEaR5+/G4ZUXhjF/+RBU0iXQEoN1aK2DCALQEsA0zbHZ7/IaURjmNAd1H1q+Oo3POH8tmRQ8N/Mofv7Pk4lZxUjhIowI/fSBHdUCPNybXxKmLUqyWZfrP/QaX/joi5Cpx0R12HCSPPzy0fz9wbFcfMYSrj5nNvhuk3JgwebKcq77/sUoJ8edP36C7iWbwvsd7TlhJbjjwck8+fJYrr18HufMeBeRy6E9C2nV841rXqB6p8XtT5xKKpGnUzRZmi2RPNoK11eMGljBlZcu5ZpvHsvPPiOYctQuvvWnIbzx7nBOn76UMPeLSJtpfk0RKTg+xgR0LWugpr4Iy1LYjs/WihSJhMGRWSaP9rn9/qPo07sGJWNc9+Pz+PBpqzn3+DW88M4ISjok9SN/shB5VWU+0o1AEBibwA/rN2oCbKVxZIDjZJAywBgLP5C4vk3gJwi0YuHqPixbW8YdDwxm0vBNXHzKMo6ZVMl3/ngMj7w4FeWUogQYmUPYYU5ZNrDp2b2Cof3CrtXGF4wYsI6bv/Q0P/z7GeQyPRAyaOrYcBDwvYABPWKcftJIEo5ABCpKKJdN7kQjEUKTcyXPvbGcDdtclBULlVkjMF6GSSPLmDppKFLlsAIbLfMWv0KSC/PbpKSmpp4nXlpDddbCOgJSazpNSOXlhpYGNw3Deq7grz9+gvGjFxNkQq9smMsU3gSp9zg8m1vIeUdGs98bw76LZwtD89wq0WJiWhtgiOqEhVZZtqELf3tgIr5JYeNGAd5D36hDNH7Xu/+gxb/b/9+0D1GsQZjw3pgAmTDMXTyWb990Fhm3Nwk7dOFqAZYGRHBYxVO4LzWBUChjyLkWR49cyteufgX8+ii2FIADr88Zxpd+eR4VtYPIujZXnbEEW1ZFt1KABS/NHsaspWMxQvLi24u57JwtkNFh8q40ZF2Lux+fxpsrJjFvTTk9f1XLlHGLEDmBCQRC7uLr177JzMVDWLFhBLGYi8ZGEFaOaA1V/UCwVcDyzcWsWdmHRLKI+58bzR9+8AzjR+zgvhdH8YHp6zEyrHYQiChOY/LvW7OcLuNTWpRlZ20RtiOwEOyqtykt0QzptYHq7CAWrSniy1e9xeoNXVmzuTvl/ddx35N9sGXHCKhGmDCHLcDCMj6BUWQyioRVzZB+25gwbDNHDd1Jn55VdCvxSMZ9LMvDaIuMK6hP21TXJdhSUcT8Vf1YuLYXm7d157FZ/Xn6rXEM61fJpp19SKRstDJIHaCjQq8ZX+C6O/n42XPo1WM7uKHV7dhZrrx4Jq/M68d9L51IcaIDBLIRCOPzs6+czBnHjWjVZ06e1pOPfPMZjAnPVz/QdCtx+PNPz2RQ726tGqO8vJif/uld7KRNkw/q8Ly5nSaktFEYGZBNxxjUaxl3/OgRxo9aQpDOF2prf2XtQw0RWVBGamQC7n3gaF5bNBqVEAhjR872gCOiH8IhhQg1xUBhLB+VECxadhTX/fxsNu0cTjLpok1z3/gRgoiVJLTC+Dk+feHrFJdui1x80fZUSR58cSi7suXEHJcBPWtRlttMMTIgJDurixAKpFFs2lYG2Ig809MIrJhH3+51JNd67KzvzX1PjWPK+JUgcqHw9iRde27kExe9zTd/PwBjrLDmpDStylZpDaQ0VGfLmLOgjEs/sIHf3T2chvo4l56+mt/dNYHNW/thCTeMB0fOgtB7oENhIKIkcKNIJXwqqh1KS2sQ0qc2G6O8Vy3jRu/gLw+MJ+kYjhm/mb8+OJkeXTJ0TWaZvaQftqMweB2yF8JWPFYYTzI+WdfCUtVceMIiLj9jKceMX0FpaRrsLJggfGZ7HjN5Lw0WaIdstpRHXjiOH995PLvqurFiU1fA4KKRbi0JmUYphZdN0r2sgi9eN4trL3oDRBZihMn8EtAxsp6MNIuDP9+MgXhc0b9fGRBEcT3ZoptXG4MUgn59i0jYBjcApEbrgNKSYrqXJmmtbT6kX1cs6YZFug/z69t57j6pSWcthvRYxd9/+CDjR68ISRJCIwOBloLGumdHOLSQCDTSgVVrh/Dbf09HWd1wqAMj0UKFZZbeA2vpUJiwura2AlQK5s6dyBd+djarq4aTSgqk8Q6Lhbk/hARPgTKCnG/Tu/9qTphUEbYjwjTFtg0Yrcg0+Aztt45PXjYPKevCGClNjs4hfXfhBj5xEXDUyK1gcgSS0CUTSCyV4dNXzObtFX1Zt7UPOSND1oNp5kbOBpw2bTW9u+2ioq43jtSNLU465oQwpFSMp2eN4Ndfm4nrxXn29QFcePISfnPHNF5d0JV+gxowxidmwEXjCSuMG8omUSkkJByXqjqbfiVhSaR0VtCntJp4mcdzc3pz0qQNJEuzPDO7nDOP2cyarSkqa8pIJlrPZDswNAiNpW0asoax/ZfxvU+/xGnTl4GsAZeQVZmN7nVk6RshQqKJzrPuDDLhk64v5a6nR/Pfp0exqy6Fl/GxknWM67uZwYN3MmXkDgb22UksniVdZ9O/XxVHjV4PxmXL5oG8vbQ3IhAUlWpmzR/MK++OozSsdHTQsVeT/59vCEMYYEx0bu6R59n4X40dXfIpESHNvk3kO1+AsQEVlRLbR2rDIUAnCSmB9jTj+63mj995lPGjl6PTIqJd6tCfShwRZpF2zhQ6EMKAcCCd7cX3/nQOG3f2pziWBvLtQHyktmi53tX7GRqUQcbjPPfCRL54y/lUVvelxAkwZAmwD/cEW0SeBecbn5G9d9G9a9XeCq+X4XMfepcB5ZWcPKmCo8euRLvNYkUGRM7wgWOW8ckLXiVu5zh+4np0LqRaS+GjpQRXcNLkxfz7Jx4z5/Xh/FNWYtxcGCM0AAq0pkdZHf16VrK1ug+WCuu4CTouqdqyNUs29GDp+iJGj9zF3x8dzonTtzFk2E7ue2YIZx+3ncoaQU1tnFxgoxxFTHug80WeDVL6FMUlDdWCvr1gR00pNRWCwBIsWDiC+fO6cOkN63lnXj/eXlzKpadV8uBLPci4CZLJLK2rQnFgGCykkaRzAdOPepc/fudpBvRdDemwjoyJmKz5q4V8IhFVOgmLWAsMImUze94YfnzbycyeNw5X2AwrX8/Z5y7h7OOWMmFUFSXFOwiD4TJ86FKDb/AzpTz56nHc+I/jWL1xKFIGKNtH+zYq7mBLH43qMLGcLzzQWCq4hUIE+dp78XieoRIpOUaSb2TQqF4Zs9+i2HbMRqMxIkAgGkt5HQ50kpAyZPwYE0ZVMn7MJshFJIoogB8yvNwDc1IPF6LAd16zlipAi2J+duspPD97AqkigTZReFv4oZbRQUSeIwWNVbNDHnWkfjaRIwQg4gbf78qt/zyem/59MoFXRjKmQ7o2Ck2+xcCRc2dC8RQSI3wTUGprlMhhdNMDNEKAbxg+dA03jF4Pro/OyT1cVQITQCK+k99/5THAh8BDBwIl8qSMMCYrcj7TjlrEtEnLwfUJfNmY0GwIq1aouE9xqgGhTZjfYvIGV0dYU2FcYvignqzeeDHjhkDNrmL++fBRTBhVxq66OJW1u8hoC5FSFAmbZavTGOdtkAG+bLKkkgmfjAl4acFYBjwxjpOO6U06M4mHXk1z3hndqKgu58k3JB8+vSvbqwYzqHeKC05O8eq8SlQH7QMjfHKuYmi/Ndz6zaco770mUoJpZLISuUyb7l2oQAZSII1GxJL875lJfPcPZ7K5chiDeq7nExe8zlVnLaK8X2gR4xHmuBkBwkdqgZYgY5J7n5jADTdfgHG64BSpqNO3wFZe2F3ANIsVHyTyFfTDxYdu5rpMjtfnbMD3VZhLDmA0Uik2VuwCNCJPQxcGaaymXWRACMP2nfW8sWALSlqoaKqBMMSE5K2FW5EqTLQOiw8f2hSb5ug0S6oo7vPA86MR9lnc+NkXSCa3o3Miapkc+WqPRP+YIXK1hA9FWgGoEn75tzO5/fFjcFIKpYOQkUh+c8gj6BjuGOT79ZiIAZRn72lslPQgYbNq9SB+9tdTefzNUSSsrjiOG7mxQqWk86juB4sAgcGWNqurutLgdiNVtLEZ16bZ0/TCgoZyr6K4zfm96eg7SKtJX92L7Rl4IMMk53AIEQorC4J0ip27ykDJqI2J1YF7ShC4GUYOKOMnX75itxXsS/y9NX8nt/ztTZAOYSaiR4mdpmtpQGWFz0mTj+XL1x7Xqqs/P2s1L856EhlPdUi1EaFjKF3N1z8+k/IB6wjqVYvkqGYk9BBRGwyRtHjkuUl861cXUpXpwQcmvclPv/g8R49dC7k0ZHc/jkWkrIbvvAblsGRdHzzTnZQTdmqAkC+KCOvjdbT2vedo23el+fwPn6ImI9EajLbRwgpd2SqgKFWKEn6kIkbvMNBUMkmyeMVWrv3ag8TsUnK+hS8shPAR2sJ2IJmMRz5pv8PX0xZ0miVljAGnmLseP4Xt28q46SvP0n/AKqjToQBodFEfWce7EWEMSukAbEMQdOXG207lTw+dSNxJIQkzutVh7HJ6aCAalYhQQPlgGZTjkanrxd0PT+ZP905lS8UAUkkfabJ4OKh2Vaw/xBAGNMSsgKXr+vCdW07iY+fOoyQV1mzLozVPuPmr21Jsvul3ZrefhrTfAAlUpZM89PRYlq7vi22JsK8PB1+iajfYDkvXNlBTn6a0KB5ayiZvFYvGgwxCosSUCV0445Qrue3fW9m23SFlG3b2sNg6rwvjh03k69ceFQ2sMSYsKNvcfWQaCzhL3l60kZyWxDpIKc26hmljVnPejMWQ0QiRryaz/88ZYZC2YdHyUXzjz6dRme7N+SfM5tZvPUJZ6UZMfRTD2vNJRgd8IE3YQ66uiHkre2A7BhUIiFx7hxJCgB1P4gAj+68jaefwhMDCI5dNsmrroMiTsSfCcmFCgLEkVqyM0hLJ0PJlCG0RqABLQFV9VzZu74FjHALpYIQbVQ059Og0ISWEwMJQmvR5bs4ELvlGKT/+zEzOOv4thM4Q+E2JtkcSQiZfAAlDxY4hfPfPH+C+V44mES/GwkeZHB6x6Ahpz0v33hBu+aC+MCZsepg0eA3defbFUdx6/2TeXDKCuEqSSGm0cRDCxTJBh/f26VDk3XkYwEaIAEcm+PfzJ/PoS1OJJ3NNf5jfBx2OyHVmFEa6yMChPpugzk+SjPkoshgTCw8FTGTRH3yujVJQuSvLtoo0pUXJxhJheZEZksWCiPIcNsb82MWnMWveCDZVLyed2YmbncGooSP4yqfHU5KMhdUhoqRyYQLqG1wyniFmC0pSsca4yaqN9UjZUcxXga99Tpu2Hie1A9MgQz9kK8qdCQmBX8Jv75zBum1DOGHsPP7wjcco67IRkw2JFdKIsBlkMzR2x9UGacM7CweyYPlIbNuP9vuhZ/UKBGhJiazgj994lpGDV2BcjXI0C1dP4NKvnEfa9McyuT12TkQOEiKs0O4JhvZby32/+heOyOFKSTwW8PBzx/K5my7AsuPkmx0eLnSSkJJRBWCPgATJlM+6baO47qe9+Nj53fnih+fSq/cGyPmYI0tGIRyDsFK8/OZ4fnD7dBauGUtxAgQugTAYk28//94QNu2FFEEY53Ycqmu78NLTw7j78SnMXDQYo8soioXxOEsbNJpAhh1kj8wg494QuBhpEeQEgZ9hlxvHpPPZ4dBYSiv66w5335hQM5dGooSPkFlQMYTto/PxBG11HHFCSKrr0yxbt5ORg7tjhKaxFnveK5Cvs2TAMyEF/biJAzlu4sDdxjIYdKBBhpFLKRTZwOe6Hz3Fm/O388mLx/G9z54ACDJZj5Xra4ipjiHRaKMocqqYNm59FGZqXg9s/xA2vDN3OM/OGcv/Y++94yw7qjvxb4V778upc849OUozI40ykkBEgXECDDYGG4wxmPU6rL3r9Xq9wfY6Az8wNmCDyUmAJCSUw2hynumZ6TCd0+uX001V9fvjvtfdM2pJIzSS8K7OfN706/du31u3blWdU+d8z/c0BJfwhx94Cg31k5BlHYQ41aq0zwbJe8UcBZgiAEL4/H1bkbdDCBsCinBIannAqVdYBKFQzIKhZaBpOU+bcgU/TwPUBnHU2rHyaqyuxtTOiISuW9BoHpoCwAGdV0CIhKQCCqRah+6nKCZFFPVy95Yf14ttnKomIPIqdJHCp9sQMoT/71uvx2MH1uG3fnY/3n7HSfgiS4DplZTwQBWq6ipYyb5fub63CD7L1/ycrfCErka3EFm1FC+Fh1ImAYNjaqoHn/36tfiXH18L044jbhDIWtlkVQMU/CS1qGpWsZdPQRSvBnblT7gjeyGpWezVlpJaiQysWOikFoetunqY9EYE0aAsP86OtONHz6zHvU/1YGisHy4C8OkSlLrLV/DKeQuvj1+Gu3h+IVjmRlPMuxkFPOfKXr1fWs2yF5ZCazPFG2/eiKBuPMsltyxX88ZWT6kqMIIQiopp4r6HL2Iqp+AjHoLtinxYL+KyjmI4dX4Jd982eElAasVNV+1PAnB2Oefc6llHQC/5HkhlCjh2NonFJRdNDeHl7ybn8pidL4FzjqvRkUoBAZ9EIpb3Bl+tQvCVCGF45GgLkoUY3n79Gdxy7RBgKZBqxeQ1y8IDVU5RCgQE9h0cwL1PbkfYV0HAsFC0wuDVar21EimCyqo79WXMEFRV0A0YIBggCKRnN1T5FzXPnUtXPaXl+e+trbU2KyivkicBakQ/TtUYh/IqKrya8rKr/9oAUqDgVCDq13BhfhAf/btWfPH+rXjv247iTTcMI55IAq4AbM/VIpnyUGLSQ6IoECjCqm6YK6PVoVVFJKswdyIZQKkHUpNejR7oAIiByakWfONHu/BvD6zHxWQ7/D4fQroDlygoRZeZMV6yQlHUswBp9R4IAXlZWMGr6DHqtR+Ketxw1U0BIdIrYcGkt2Ny/Mhk4hiabMThUx149FAPzlxsw1IhDoNz6DqFTp3nuNYafvyfUiHweE6kouAsj7/93bfgxmt7Xu1mAQD27GzHB//TfVCcAjAA5V5FcJECJwTj02kAwPPBj4EVU7D22/O9A4CxyTyyJYlYlGPb+hVWg/HZAkplC7peTRx6iaKUAueAjytAKSgl1kJjP0u8MlEBnBltAlUatm0cB9MtoIIXbBepInxzuXb86T/fgnSuDu+540m87pZ5/O5f3AxBmkCpBQWvoCetAjRe/nmx2lhebdCoy34+n1Rraalnf1p792rLcygptep1tYRAQQeBg4BGIHkIx4d34Pifb8Rney/ijTcP4a3XXcCGnjmwYB5MCMAVkJSsJKEpr0rpcq7As9pMLvnV2znV5rny6i0xgHAAxEA5n8CpE0347hMb8aP9g5habIOua6gzJAQxYVMGXRAQCAjyk/tka5trKAlN89BcJCirula9rOOAVOGmnmYOAS6DaVJkTYZUPoTpqU4MjcRxYSqB06NtmFxoQtEyQBiHT1OI+Lk3+ahZDZz+9Cik2s5QSgUpJaSs7Rafu/z1MvZOuvBHAujraAQgIBRAr2S1e1nEy+rZ0htHzO9HwSagrAgiPHTV1ehtRSg0zjA8nkHRNBHyGVfhrCsyOVdCxVJobQigrT62/Pn58SQcF9CMq4X2JJBKQCq76oX1+BevaL2SGizHD0bKCPizgHohii5P0RCqAM2Pv/y7W/HUqW1obRzDb/7y49jau4B//dYAnj7XhqjP8daaKteoN69fXnQrWf7/xY2Qy9dP9aw3a13p1XPlr6mkKK3d+NVzN3ikogI283zdhADML6EUxYWpjRj6Yj++8O1FbOqfwc07J7B73QI29k8jHs0AugKICbirHvrqzdRyM5f3s964rcVTqQZAA2yC2VQ9Tg434/CZdjx+rBvnJptQLjXCbwCBgISiNmzFQeCxEgjCQF4iYq3mKNE0ggOn+uH/zu2wba/WC5UULlNXZ+lftt6qvypAuBwVl6JQ0pHJhpHK+LCUjiGZjyFT1pArabBEFExx+LgA0RV8Qa9wm9ciUeVtq7lrfjoUFOBZx1IqMMYU5xqIVNUkxec3KIiSkNSFdKlXtRgM7NU3GGE6NhxpgahItQQH9eJTV+HcCgoap5icr2BiOo9N/Y1X4awrMjqVhHAlGuMM8Zhv+fPj5+YAcNCrBKqhVKFiaUgXG9BDZ1ZcVC90bgXAqKAlmoeAwth8G0ANELjPO6IJlYARwV996WZ89t7rYDATf/TeA9i6bgwQEm+7/SAmFmLIV+Io2xQaZdA13Ys34ipuhP8fljWVVDAcKEmZwdXUnKqqOZgU1QdHQagLojQQvQJhMJTdNuw72YQnju+A38iisymH7tYl9HeksKlvDp2NWURCJsIBFyG/hKY54MwGpV6wVygO1zVg2gylCkexxJAt6RidTuDsxXaMT8cxNhPH9FI9bDcInRPoGkUwZFfbxKsxWAUvBqUgicDVqH9ElIKmA/fu24LvPbERVHEI5uVUXLXN1CqE0wpCnlRjYZ41RAgBZRKMUjDoMDQThi5Q9UECAKj0fOqSAgpewLiWN/XTJgoKiXjUbG6IwRVV17IoQNWKaK0lBAAxUCyW8fnvH8IH33EdGK/REK22UF+O9laboFDNQVNghKDiCHzx2+dQrBD4dI+536vYe/VQVYwoFG2BmcXcVVRS3h2dG81BSoWBrjACVcaDiuPi4kwBnOlXhQ0cACiRKJYDOHKqE9dsPQlpE1AiX9CcVgAIreD6a2fwhQcIHn96A0ZHu9HXdwYorz7Ie0sIAF3Btevxt5+7Dn/95TfBcQ186OcfwC+/8yko0wVcil972zG89eYpzM37MDzZjX/94Q4cGe+Fr1ro8eViaSCoxZsvjxfiWe9f6DxU1ZhNVtyFtb2Wd4VXl31zTSVVNvPTnDIQRSAhrlITvQW0lgENiOVqnaqqEEBtMF/1SBXHxbl6DM904YH9LhhVMHQXQd2E3yjD0CvwGzb8hgvOPGvKEQRlS4dpG7AsH8qmjrLjh+XqUBKgjENjDLqmqguz9F6qthCsdh3UgBVXJ1ulBunWNQlNW3F9XL29ak3WOttaMTyBqkMeqwdnra0rgeTqBPhpNAkVgSsd7NjSktkw2A7bdkEZxbHj55BMVsDYZXkdVWNAEgFdKEjuxye/dh7fuHcCOiNVlNsy3AZXPtVfvHjl6r2ANFcctnCQzlvQjRAUsapKqgoUugrN8MptcDiigqHhNF6/96WcrTZPPCmZDibnPJh5X+eK8lvMFDCXLEFnGiSRL5nN3RMFQgP4/hPdeN/b4/DR1JXtpADAAe667iR2DezEMxc24vf/9kb83e85aOsaAZxlwjtvVXSiOHCqG3/15b14eP8mKKXjN+5+AH/64QcBma+SEAsQUkRrYxGtLcA1u86hpaOEX/qPzZA0XK0u/PK5/FTVBaeo9JLEq+OVEemBgyipVV65TFaAMqSaNOWlQNVSEQBOrOUaXB4SVOHVslLXVFKDvXVn9x9ZAkfwlW4PgKqVQBR0zYahPKSKIBKCaMjbERRMQCnPESLVijKh8FiAWXXnQ4kEZQQBDhCsUkqvsqzelf0Ubk7+3YgEYDCIxcXZGc4qcF0PcluulJ/X5SdBYXOASoKQ9GM+q+DYbpUpoEaZ/fI+GYUq6hQKilL4NQPc5wAQkEoHJe7VLw6pOBgMHDm9gKtzj945ljJFLGVL0BlBV1t8+dvzI0lksxUY2tXlcNQNgUNnN+GTX9uDT7z7ICitVFvz/PejJBBLVPDHHz6AD/yvRjx27Hr87O824l1vPoHtfSmEQhUUKz5cnEvgxwdasO9YL/LFdvhDeXzo7ofxe+97GlK6MK1INdhbPbHjuWYV03HkZCNcaDCqF3y51nVBFCQFNJdCiAggghCSgioJExF4Ra7opeg+rxeqP70KBpJ4xLFSBKEAuIRBE4ANPwT1VlUvFUK8dNDYTyhrKqm+pthhwyAe2+6rtop6E6BmTVLFPM4/YkHxmkpiVWyKV7OIQFaPR5XCxMuhINVyEa8m/9RrcvVFSIGGuH+puyM+R6i3Q6aUgNPnh6BziSoLvwNLUPS3TuL27ReQiLuXYaReTkSL56JiAGbSOh46sAlL6XYwvQJJdCipgcKptuPqXA9wwTkwnSyg4rrw859UeXgGgFQAJcDkbBaZnIVQgGKwO4ra3B26mIUjCAzj6sZmKAQM3cDff/UuPHlkIwKhMiAu51Z8ttRSWxjnCOsSFb/EyNIA/uxzndD1AjTmlfUo2RFIEkSIC/gDNjTG8eTx9Xj88ACEkh6TQ83VRmqBDALXAi4mY1CGH14C6Ms3fpgi0CVHwfXjY3/xZvh9t8EhXulVsxKApepAibnGmkeW+0kqAp27OD/djZ/5j78KSm1IoqArHelsAj5qgBIH8lV2+K2ppBoa68+HgkYqV1J1/NXTUlWpumBWtWN5E01cQNWqS9ZeVQSaWo6weDlJePnRNq/JKytCSsTDwbH6RHPacxF7oJ/Z2ULVdffsset9QkElQUVwdDaN4Uv/49sY7D7nmdrVseMd/DIaNDVXqmKArnDw8BDe/1/ehVylGUQ3qw2t5sFclesxQAGMUcwslZBMVdDZ9NJ2OLWF68yFNEo2RWuTgc7W8PL3o5M5SGhQkKuKKL50cQTgmkU4hOOhQwOA8qjMnrOdy89TQnq1LhBkApRZkMSLRxfsAJSi0KTy0LAki7xDQSwPvPJ0uhlUaKvihJdCnQgkJBh0QyHik8sVg1+u1VNAwnaLME2GI0PNUNCWC1NSQhAKaatu/PJx7M0NKgSUW0IuH8O+4x2QhENVCWU1Dvj9XqFK8iw84CsrayqpkmUt9bRG9h0eyr6VG+xV3nzUwndieXdEFfEKw9UgDaQGkQRWp5TWwuBqLT6u1+TfnRB4vHJQ3MO9SaCtOXqoYipUTA8U4rgu8oUK6PPA9ST1Kq0KO4TNXQsYbBsDyjU48is1TrxsfyIVqO1i96ZJDPZOYt+JFvg4hSAUTNb48F466ICAQFIBLimWshWcOb+IzqZI9dsX5/qrGQA11oqL0xm4EmitCyMRDgIgMG0bZ0ZmofEqQ8tP3PxLEauucNEQ1XDbHb1gugYmicc6TjwQyvMJVWRZtQhKq2U7FIji1bFV89p4hrEkZJkmjSiv+raXB+W1a3WvVTmVMT1fwf6js7A0CvZysVAohaZECJ/507d4jPpMeKTYRIJQgqmFEv7nJ5+CrfTnhd1sXteKf/0/vwDCAKYkoDgkUeAEeObkAv7hK8fh07UVb9WrpKbW7MVt61owvSN976FTS2+F8dNQtM4bDssU/Cum0bMWlrVtl9cU1P8dQquP0oUiCpw42L2z/YGGZh9MS4JSAst0MHaRQDyvt8XLxAe1IJQNSA6PRnIFBfmyY4drbATV3b0QFFTpUNT12ne1Y6cKAKkWyhHA6NQSgP7VX77Ik63MtIm5NKgEOtpi0KpglWTawuxCGRozQJZD/C9FPPViOhY++qvX49fetuUlne3lEgGJd/7Wd7DveAqa/tKLHq4pCgj7dNy5t2fNrycX0vifn5ZQYq3nuvJ7fTyEN90UWvMcrmKAOASPjX8totpXTtZUtLmSxPp1LT+MR7WM+Cnj1ntN/t8VL7LIQIgLy1VobQxMbN/a8pQvoCES1RCNG5DKhmU5z8mo4K3VFBIaKHcwvViHcikBumyw15LsXl5RtGrZVy3wTDaAybkEiOY1pAb9vVpCaqx0ioAQDcPjmWpD1ErttCumFwJQrVWUypcwMlkGZwLre1cWvJnFPPIFAvaSu7KGuKyh7yiUrCp26UAsK3T1gq/V/67k+Bfzkkp67ZIKQlbRcM/5+FbiQi+tXy7/xOuXinVleZ3PZ4bZtovnCu2+0rLmEFKUoaOzcWbvjubvW6a11iGvyWvyigtBtbIqOKQpccvunn8LBUN501SwbQLHAdKp0gph6vIfXu6bF6DKgUF9ODPRjocOtgMBzx8vaS014OWdoURJz8rmEvBzfP3B7ZhK1kMnl+5SagUmPZGrXmstMSsehjVFeXBlnXOcupCGaTtYTTF2xaTJqqZGCWYXS0hmbfg0hsHuFfj5sbPTqFgeEZzEi92Y1pTSs+9Towzf+O4JFCuWV6IDuCwm/dwvrHpdyfFX9FJYLnBIKMWDz4zhyMklcENfc39aI+SlhL+IreWlwIdLc5ouPTuA5XTJFzr9C8FMrnwOEEUIPMj9Fb5ejKyppMJBHwJ+A6+/ddPfGZqw5f+FRf1ek3+HojxXnCMJ6kIiuXUw+smFxTTS6TzS6TxSqSyW0oXnnQSe64kC4ODEAkgQ/+0Lr8fR4xtBAxoYlx7H4cs44gkBCAVoQICwBL7yvdvw11+9AVQ3wJSCIjXX9tVz+dViQgoEjBEspE0spkuoFaeshtKv5ExYvWhOzaQxny4AkGhrDCx/fnY4W91tVbeKV6SlLo0/rXVtTec4OpLBfY+d9xZ7uHj+PcHLLN7qDEIoJBT+6Rsn4AoNGn7Ky9a8KHl1b2TNmNRkMgsCgnBD+NjeXa1ffeyZ1C9rQQpNwrPG/q/p/Nfk349Us+IJhVsq4g3v2PA3zZ3Nc8Wyt9MnlMAuOkgtZQB4LhcAoFJBKkW85FgvwOwNXwFJAD8nmF7owPv/8B14z8+cxM/eMoTelmkQnwVAeVDi1Tuzn2Q99BL/vDeEAi5DPp/AwcPd+Ob9G3Hvvs1weQwGc6AUW4Y3K0IARSGoA+roEIQQwQCXElBOoXEPAq4IJbUyGx6SdW0qpRpogFKCXK6CiZksOptjXk2oalLnFSlnQlHjptM4xc/e1o/Geh96WuJAVeFNz5fBGa9e97mRlqTqfiMKUFInSuiQUvdgz0pBKnKJTU8JBed+fOpLB3HT7h601IW9bn3RD+VqC8XX7zuCZ44m4fPrqOUpESWhqIBUhEgFCCXhkjIooRBVTpcXav3qhFzPjUiq9F+XHVf9KavlVgQBWBXkIZYrogMvPIhrT6VmtKwg/C49xjs/YYRqGvATZzS8gKyppLraEgAUdJ3iV3/hhv9y8sx33pgr641K42uWaX5NXpOXWwgICHFRsCR2DEaffvvrr/kbvz+ISEB4USRKUSxW0NFqXrKTMnSOTHHGhMhWtxOXEp0qKPgMggWrA//785344vd2YlNPEuvbM+hqy6KhPo1oJIuAJqFRj4LHa9BqF+Klk14RzYNFK+UxoTgU2VIES5kYJhZCGJuJYngyjtHpdlSEH0GDwyASXtr/pa4dEAmlGJQCfLrhBgMcjLvI57KYneaQErDtcnEFql5zk6298Hn6UqJgExw/t4Sbrule3mbVCiG+sHi7IyUl7rihH3feMAgAEFVlPruYweh0CprGq0vw2uckyw5GLyczEmZOXcIPBRtdbQ1ghGBqqWyVMwKgtb5RMHSKoQkb7/6d7+JD79qB9T3Nnj1xBS2/WqKqMTmqCEzbwUNPn8E/f/s8hG54LlvFPW7JqqERMPzCZxiIR0PYONAJn8ExPD5WcN0y9CtY3EP+6lJdhdo/n8fM59e82m4Ky3mjnAD+YI1U+IVVut/gHrpUUSgqIddyHxKvuO1SKl85NzqPsnnlT6C3ueWKj11TSWmmp4iUKTHY3jj1sfdc91t/9pl9X7d5FPprSuo1eQVltZ1ZcSjiupx9zzu2vz8WDpkV017hv1YKjumitaX5EiXlMyhm5kvDgAPAh1pa9yVTjkgYoDD8QLbcgsePt+GRowKACY16pKGMCRDqenDk1Tk56tmM615l1yoju2IQAhASEC4gFYciIXAOGNxFiHNI6lRX2MsnuaouNBxCWhjoaM1uWdcCyxHIJ3M4ksrA0BgSQe28JM4tXnJ7jRD4uRaiqlKlDKPjtbIdbNUdvPACVguJEHIp8pdV+318wUQyY0PTfNWzrb141SAMUAyKSPT2RmY3bapHqRRFX18j/D6K795/5PT4Q+Nv9vl49VwSTDIEfH4MjVXw8f/+OPyrGd1fKU1V7WNCCFwhYVoKuhGEwbwwn6SAIi6U0qFcEzft3TDT292IStnBzJQFQ5MQprpA2fPnwhHiIe0+9+2zaE0E4EqP1otUa+QBuOSeOVWYzxQhlAZWJTOgVCFTtPG3XzwEQ+eQy4XlLu8sAihAo8CpsTSgV6tOKFY1YC51PytQ+Hwc50dnU3/z+UXIF1Fy6A3Xv+eKj11TSYUCK6qdUoI33rH9G4fOje6495G5P5CBEF6LUL0mr5R485DCcl3E/W72Dz9y57u3buoedgWgafryUarK/aikc4mZabtAX2/wQCJKc/kyopTXuBovd+F5QX6NUHCfqH4WWebzc6o1zai4fEF5dnB/JRvHm8iEUlCqwDS3ej82arlDRDngUlZz+S6VmiolUFDCxHXbm0687saNsB2BVNrGxFQaAb+Gng5r31Onzv06UQFPBb+gniHwGRRHTs/iU18/CCq9XYqXg0aXj7m8Ncsut2riag2uL4mAogqaoGCU4cj5OVDCrmhXpggAAYQCMJPJqcl9B5KghCEWiMDRKZpi7Cijq7jjCIHLLUDq8Gk+rzWSejuWK4d+vHRZDvIpEErhDypQJZarKUvi7fCVUvBrytE1dqZUtkFA0d3RAE3jsIVz5vETU/CK2q3dckoAoRg+9dXjoK4CwCCZA7JGDpbXAxKEAkFf0OPyUwSUEaQLLv78swehsEKk/FxKigAgnEH3acvjf2VErxJJQGGrX3z73iPd3Y1wnJen99dUUiKwYikKAJwTfPQDd/xhIfOD4L6Thd9SurFce2cZLLtMRviaAntNfhJR1UV7dfDcI2RxXBsBWhn/jXfv/aU9u/qfLhYv5dcjhEAIAXAHnAOXT6e6xuD8QFfdYwePZ+8mXALwVcECtcB+lTKLuF6BO+klbSrielRcoMt1okEvh/c+G2xQU0+oEn2uAAK8a3kVUSlUdYGH0pcTS72/JKvOruC6DpoSvvlgMPjQqfOzgALyJQepfAVamcMfMp7w68gLoSKoBvDZGi1aLZxTjM07+MO/PwAuGFS10OgyCexamq7WPiI8d1btNqsKjinApYDGabXS8eXAD0+p1UAapHpO4bpoqg8f7O7dNCUVoGsc7a0N4Jwi0ND21DcfHEtnKzLBmUd9xIQGr/S5l+BP1Qq56isnK9cjYFUuUc8bJ6kFKM9dZroWBjrCp/fu3jypQGE7FhaX5iEFRSxOnqwLsel0RbQz5rkOZXWYXLY3R8hngCrmjViir6rthpUdjvLci97e3qve4CUfc1AiwYIBXHratZ/xsttXchC4kLRKBbU8fr3zukKgvd5/oaM1MQTpJQG/HHJFKdGuC7S0xNVv/PLNH6t87pHsmTH7v1guhaYxKLhAlf+hprJek9fk+eVSu6y2KFOlQCWHpC4ACVt69aI2dvgf2L6h9SPhcGDMtuWzIeYALNtBpUDXRPZJneOW3d1/dejU4bulotCl9JJ3obw4EKnxP1ZVUa2SczXofKl9/uwdxlp3531F1zhOVZlTahOeAaTKdqGq4Idq4NtbiIFy2ca771r3yV27BjLlsgRjFJPzS7CoV3Il0dx08ZotLd957MDcrwT8fjBJqgvXauV4WRuVVyI+5g8867urIc+djMxA4JVrh6KQkkBKF2+4secfQgEqTNOBRhVcswAXQGtCn71lV9uXv/rjqY9FA97i7CXIeuAQ8lOA4qqlKnuLuAsidRAoT004Cnt3tf2DIy3btFxQULTWtwIK6G3j2TtvyP/LF+698EdRfwhEuWsAFFa8CYrUgO8Ea1K8kRVlXTsHqW1VsQYo5rk2FLXLE4/LktaKOKI6Vok3Vxy7jFt3r/uHaChQsW156XB/DmGMgNIXRxBxxbwdUgKm5WDXtvY/7mkrnTh4PPdXE2mzS+cMjKwuiFelj3/1x85r8lMrK1gl7/+aU0tAEglbSkjHRkNMn968Pvp/BtrinwKlruOsHQ9VSiEQ9sMfXrvaLCEEbV31T54eSX7ynofHP8oD3nmo9PjO5LJSeDWFVHOiFIgkkMRzYZnlCvZsrHv0XW+/7v/ohIH6vAm+vrsZm3pbAQCaBvTUx/707IXvvGWpIOoDnMGtJst4OzmvJM4rCy24VDx9L0GlBqJ8UMSFSwDbsnHjpvhXrtnQ/i2mAE3jIITArCakukLhlhsG//e+QzN3LxZVl27IV/M2nlMUwfKC7vH4KZiOws6B0D0/8/Y9X9J1DUJ44ZNA9RlqGvCLv3D93+w7OvVzEwtqUPcBVAnIK1+WXzkhBFjekDCUzTJ2rYs//va37fpnX0CHpj//QyHU2yFncxXs338Y12249Yovzf7kT/7kWR9m1sjf5QyYn03j4tQS2loSQ9ftaf+6Vc7Yhay7Ll92grJKHQ9KQar88K/trV6TtWQ5d0bRaml7BakEKsKFhIv6ICZu2d32yet3NH+4pTH840rFK/YTjQTR0d4EIS5D0ykgFGKIRhgCPoaA/7KXjyIQoLhmU8vD4xdGO0cXi9sV5R5qm1peO14BlokXEk9BcQhC4UgJxyli50Ds/l/5+Wve09vZkndt4e0ilQeRoPDyqYQLNDUEs03R+LH9x869veAQQyM6CGFVQtRXfx7WOBYIcSAJYEkFIV1saJX33LKr6QONDY22WbZh2y4IYWhprEPQ54Nf19HZWl8c6G449MyJ0buzZRLQKfPGzU+R1HY7AIeQLoRw0Rqp3PeJX9vzK23NiZJyLVBle25dpkMqjyg34Ncr5eLCU0Pj82/OmzRKGa8Cc9SzAT6vgtTQl1R5yccWcWGXXGzt9T352x95/S9GI/5sxbTgCvc5X1IJ2LaDp54+jx/cN4SpiWG88y27rrgNP5HKdlwJ3dDmtg7W/eH6PvbpdBHvPXlm5s3JlL3LEly3pISU3raUUrocv3pNXhMAEEpACAFKKChcGJpE2Mfnt7Yn9rclfN/q7ojdF6uPZIqlCorlygufEKjlVIIQYC0qL9cFYtGQ/Yt3736/5jt8ZOhC6ePpCu2rgIJKF8LF8+N6XzbxEHyEAkyjkC6BwRz0JtjZTYPdn9q8qe0fAwG/6zjuJc2r+S1qUjGBrVu6H/r937jhDV/42v6/mF4o3OSqICQR4LRWpPDVnIcKUnosG1QqtEbJ9EBv9O/720N/6wo4SikQ6lm2lBL4ffryXxIAe3b1PP2hX9p653d/cOavJ2edWy3llQph9MUzGFx9UZBCQcIFpUDCh/k9W5r+P80w/8Ln000lBaTwko7JKq4hAsB1FTSdH3/H7e1vGB51/vrY+eRdpksBQuDF4F5lUYBUAkQKMO4iqsuF3XvjX9y5ueO/JeLRiuPaz9v/lBIIV+L8qUUceGYUljAQ9uvPefxa8hPvK6VUsB0Jw++bvnVz9/+q91v/a6C3b9OPnxzbapqZnQ60zY6giULR9tuO1JQCeRWLU70mP0ViaH67LqoXNWKPa4ZxpL2j7SRz08ebmhqTjmNCOASW7b4oSKvrSJSlhO3YaKgPwhWeYlotHhRcqZ7O+n/oaPR/KVk2XpdKZq63bKu3vqEuIavK7ZV2VVMC2JawFmbmlxpaw+cGNgwc2twZfCq1pEpCAEJcGfOEZbtoa07sv/v1215ng7754P4zb66IwNZCRUWkeNWo2GpQMoQDRlkn5bPrNrQ/3NFg3F+pqIViIb9mjPHyz0wLSETDx958R/ftQ+P2G+Zn598mlW97ruhEhBDs+YpcvqziMcKrSMhXjvjckXhD4sFwwP5RR31s5uL0Aly39uyeu/cdR6AuER66bVfvGx/aP3nn9NLCz5XycmsmZ4VdUU2ee8U1saqCJQUJB0Nln1EZi4ebH4xr9IdbdjTPliouXFfg8nqWlNaoorzabq4rMXI2hXzWguHjcM0XfxtrKqnLLTZd89x9a4mUCqblwhVAY1PdmYb65Jn6oPzqDTfvgiM1nDw9xpPJPLNtQSh9Acfla/J/tRDiOTDaWmPiht3r3ImLo7hwMQMejKOUKcJyBIQjPXfxixAlBUo5Ace18c3vPoaevm7ccnM/mptCcJxLlZVS3qLAuZatr499pyEgvtPdG8fP/dzNKJdWjnklRdOAxcUy/up/fgEDA/UINiSg64BlF8H1SyceZwxKqedso+24AGHuhoG2ezQrfU/vwEacvDBlVIo2Ia8gQrsmNa42BWDHtgF7auS8SrQ3o1QswM6Xn3W8R3xBYOgMtnMpSMYVEq6ATMQj93ckxP27dm7DsVMTejaXo4z61tJ1L7soKQmjXF27c73NkFLnJstI55ZgO2JN5ftc4goJIQnq49Ef33pzx4/DgRCefOqsns87hFIC+QpbTjV3qlI22b5lgy3dRXn2Qh5W0YVpuc+6N0oJNI2hUKh43jNGIRyJ0aEUchkLjP/kRsSaSmp6ZHZVYwnm0gUMDLRC158fleG6AkJI2I73cqSAK5QrpHKFXE7de03+HxVSjVO6QsJ2RHWcCBDx/BOaEG8SMM6h6RSySm0kJWBbJqQQIISAMQrTcvDww2dx9Ngodu8axI17+9DUGIAjgGqhWwCepSeEhHQlHFfBtDxr3fvu5eyFZ4uQgGULCAnPO+EKSHnppGaMQtc4ZuZTAFFoaayDfI4NllIKtu16c9CVEEJZQqqXvfrIWlJzwSp4YQLHlbBtF+o5dsmaxjC7mEKuaGLnlj4YBoNtX3qjQkg4ULBdCVcoW0jP+fnqKKlqHp0rIZSEs4Zyqo3fFYLVtceYUh6s27IFDG3l3hQ81+YrKStKqnpvjoTrPhtZSwiBrnPk8yb2PTOB4eERvO6ObQgG/TDLLvI5C4yRF6WwL5c1lVSlaC6/1zWGgwfP4Z7vnUZ7SwQ8wCGfa3a8Jq/JVRJKCRgloJTAtBRUxcX0yGk8mpuCFApCCkRjddiwefuz/s7v12BZDn788DkcOHQRu3d34+Yb+tEQe3ng1i+3cM6QK1Rw4PA4njxwFG9/6zXo6apHuax+KpFuVyI1g1Wpavl1SiBcoK4hgdl0Fl/8+mM4cGgGN+3tx5YNrfDpr1LI8CWJAucUUgKlso1KxQHVDCT0IDROXxWlejWFUgqlXOw/MIyDh+eRyjiIh81LlDCtxhlfiqzt7lsd3KMEhqGhWCzhwoUUtl7ThJ7uNuQrl5ZE8AgPPUuB0qrlcNkW1TvcQ6wIIaCUNwFr/stnteM5LI6fWKopI7W2Pu9BV3AuJV/ExLmi0659UJX789mf43k83c9xvWVGlLXOpwBKX7jPVz+XWtue71nVxsnqPvfGSe1FPaXEKJQgkC5BoWAhm7ewlC6hWBIg0oXwTSM9NwqAwHEdtHX0YOOWnViLLZxSCr9fg2nZuP/h0zh3bg6/+I694JpnZBEl1xz9V3L/K/f1wsfS1QxK8MbMlYqUCpRSjAzP4tvfO4pc3it3zquFBSkjkOLKFJWnDMjzjsPnmxcKVTLbFxobz316AN764Bm53pGGT4ctHCylc2hqqUckFgYlBIbOMTGVxvjXD6CnO4ob964HADBOQaiHaqztSry2/6Rtqh5zBedZ7j61Mu5Xj21a3TF5uyaAUR/OncvCtuOoOClUSgLKF0EiL7B+oBGcEyhJ4AoBULXc/5StnONKx+Ja91j77ErmaE2W5zUUhCuhaWTNxYISAikFhofOY9++8yhbQfgMA+ylFxB7llwxcIIxCk4YKCWoq4tDpCQ4Y3CFN+A4ZzBNE7bloigByxIQAGjVh+64AoYOGLoGqRzE43EYuo5kMgVCOSoVF44rqg/bKydwOdR4dVepyz9UCpRQ1NLgL9/sLef7E1JVjBK27TEOMF7L3iaAEi+8tSYApILGKSynSuC4xsNxXbmssOVzUB4uNx+okvd6aEhZjTvU6rTYtgvOWTUwqSCVAmdsOaheO652tue6HufU4wNzJRxXQONsGaCgaWxVoHfttta6hlECV6jlyXT5s1r+GwJonIFQAseRENWicEIIlCsu8nkbPllEIWsjlU3Ctl04JQrTdeDWALCUVZUYB6ceOJdQCn4FtMuUUvh9GioVB3OzZSSTabQ0N6BSzmMh74JVZ2VNmZTLNqQkl2n/lbwurw88eLDPZ4BrHgT88snPmHfvpZKz3L+ce1xnSuE5XXU1cYVAIKBj/eZ2PPKjw8gXK/D5DJjOpeOMMlKtwLq2KAXPpVpdoWrjYvW4A7yxo2kcQgoP6Qjv2Yrq/NY0esVjw1P0HoxaSgnGvOevlEDFMjFQl0BXayP2HTyMkg3k0iaS6Swa2xouOaeuMYAA41NJjH5zEfFoBBE/gYUAGKdwbAFXKEipoOsEFctdvi9NY5eMSW9+rLB6A154wlu7yDIidPW6szzXpAJjK3OYMwqhJCxbwKd765vtOFCuQj5XQaUiMbaQh2VpGLVKaG11Qbi3hhJOkcmWcX54Ef09CUACLY11YIwgHPbDsReRz5rQqR9CeNd1XFk1IKtIxhexgWasNjZX35fHcK6k96yElFBSeS5lg4MRCUZ11CXCGB2fgBRu9fl565DnKhcYOX8eqWQKPp8Oy335gCsvGt2nADiOi2gogsGBPixlMlBuBX3dTViYn0cxV0HWJvjO9w6hzmdBj0Sga34MDnTA56MoZouYyyxg795BtNbF8L37H4HPH0SAG7AcjmQqg76eKMYn5nHqVBpc1yFBQRWtUr1IqFonQ0ERCQUB7tqIMKBpoAVzyQxyWQdE+eFlpgsQySClhM8fwI5r+lAuTqKrqx8XLqaRXEiDUQki07BME7lCDCAMgjpQqBFbquX/CQFglXHXLT1o6+jAviMTmE+VwKgHG60N/uamKNb1N+GJx05iMSPBOPESR+ElexPUgMFVEhOSREudhpamXhw7nfYoUFQZd791FyyH4OTJSZQrNkIBA53NMVCp8MSxUVAFhDWJroEwYuEIzg3PY2mJAMwHQjz2Bo9VQWDn9l6A26iLhmFbFOeG5xAO6di5pQOzs1k8sm8EPk0DqfLjeKUSvBwephRcELjCxYbuECLRMK7ZOYAHHz6G0ekSmMZAUVOaHspH5xK337oJekjD0QNj8EV82Ly+HRcnp/DgE2dBRQggeUhICCJAQaFJHYRhOXXhamymaxZuqVRBS08H+ro34ukDo5gez0JKhVLBxPxUEvfcdxxLaer50YnCcgW5KkMCkxQOsxEyKrhmUxP61g2ipa0NXPPcVZ5RAiwtFXD+/CROnBzD0pINxSi29EawfXsfGtuaEQz5IOWzlZUQnvEQT8SwbkMzolEfAIDR514ECCNQciVuUVtYbdsBCLChvwXr+5rxjW8+jMWUAGE6uKQAoZCsBCEIIqEwbr9lMy6MnYASGioWQbHsIB71Y+umJkxNp/D0oWn4uA+1QomXjw1JKVxpor9NB9f8KFkc8XgE5WIW3NCRyyWRKaQRDPhQF/V7fSxr7r7nvj9d43CIRCFvopxVILCR5RT3P3gGlhRw7Qre9eZuGIEIDp+eQW9fK3LZFJ566iK4psNxywgHFGJBPwTzQ4HBdQUaG6PYubMbTz5+CBcnTUAx7N7cgmAkhIm5FEplCz6fhp6eeqSSKZw+tQRLSuxc146b9m7A3FIG7U1R/Ms3HsEjT+SgpAbLMsGq5LOUUGgaXQaO1IQzimyugvRiHj6D47qdmzzD0XGRWljA8Og0DO6DdIu4+81bkS8qLKZNtLWE8cijR+DYQUiqoJQAUR6FlyASDDW6LW9tdKWN/mbgrrv24sJECg88NASDUzQnXPT21WF+iSJbUIhE/KhPBJFOFeCPSuiUI6iH8bpbtuEv//4U5mZnkGjxo67eQH1vC4yAwvzsFNKpChh/+ROPf+IrCCEQT0ShcYFysQDOPaun5u4zTRtFqwCRSWHHnt3YtLEX8wszKGa8HYI3GVG1KhUCBsfOHRtQLKfgunlMTHjHUOnRi0CpZWVxyT+iPK4yqaCkA417n0vp1aOpJcWRqsWllIeQIpDo6W5Ax8ZeDJ0YwfFnHgCnAkoZnguFqmpparW2khICnALbNjShqzWMc2MpHD0zh2S6hOaGKNYPtqGjLQEoCSklhFAgFBDVgCRVK9YsQZXRjAgwomBonhtHEkAIF5GwH1u2tWPdulYMnZ6CIRWiIR9m53NwhQRXBIopGLpCKEi9RUrAU0zLZTq9fmDMo9qJRg1sXT+Aa7Z3wypXEIv4sbDgnU+yWiKht/B5WTZefwp4wAcChbbGEDrbE1XLSlWL19TcHzW3iIKmcXBOoXOFrVua0dPdiPmFedi2g6Be5c3zEmRAVJUb7GUKthBC4LoCQZ8Pv/DmHThzLoZyuYipsVkIIVCpWCgUPeva4+9bUVJEUXBJYTEbTFnIpFM4tG8/EvV16BscREtbKzKZEoaGxjExMQ8pJSoVC8WiBcUpTNPAzOQ0Zqfn0djSiNbOVgTDvuVdXKViIRL2obuzHgPrOiCEwnOxbFwujAEa86xiSgmCAQPbt2/AQH8bYlEDjuvF8YTwxgQV3piQREFUS2ZpmgZAIhbiWNcbhi0ourvqEQ4bmJ1NeWODrijuy8eGhDcOCBQCmoWO9nr0ruvFow8/DcBj3665+4R8ca58Ai/0wAg8nkGlUDEdSErgugqGxrBnawc6upqgfD4c2JfzPBnMA8gopQBZAdwKmBbATbddi/UbWuDzUTzxuPR2jIqCEYK2hijiQT8ylTLqW4OIxwI4lE3DdSVc5Z2rryOB9f0JpDIVuK4L01Wg8FzWBMIbx89zP6uBFKIK/PHCHp6RKx0HFAIBv451fY0o2hyFQhGu61ZzsqruQamgqIJYpkyqrn/VZ6GUQmtzBHPpogcZr14nElLwaRZ4TwNuuGkHpqbyeOyxISjlQikKqRTcqmdLCAFXSBiGwo03bcbU1DSWFqZfMVT8S1KD3uJbpUG6bMDVYg21wlmuK54370VKVd2BYNmtUOuDF+qK5e/Js9txyUHLfmfvIMfxkkcamqIgnnMSy45nXKpEnnW96rUsW4BSiu0bmjDYncDYbBnRWAQaZxBSLt/TldzLMj3QqmCTN0gkLAuorwtg47pWTA7Pw61OvEvSBVa7kZ7jQrX+8RZAiUQ8gCXHrkJm145Vkcve144Rq54ZudxDdsk11TJsuoaq+0nKSF9NEVJCKonOjgbMztbu3RuzjHmgjbWUFAUFo7R6HAdAkFlK40jqGQSijUjlBCzTAucMmsarx1Go6t9wzuE4AjMT00jOLaKxtREdPW2ghGDbtRtxxxt2IRoLwbbFi+ofBaAuoYNpLehub0MkEoCutcJ1AcfFs5/TqvlALpsXQipwRhCP+z232hWOjdXnksqjOPLOe8W38aKEUlIjRodUCnZVobvOpXNjpd1e3SqDuRgYaAZlFLZ96TEKnhHGGEFLUxTcT6qotkvHuOOiakTK5RDF1WL1WD6fItV10TN03eq1njUhscZzWHVP3t+rS/5WSu85dzYHEY/pGBt7boQtIWQ5FmdX8xdfSdDHK04SVYNj+gwNfl8tRrLSxa804qW2q3thVfh851CwbAFdY2hviaJQUcvxtaspQmBNiOtLO6e6quf79yRKrRhP7MVxXl4ijDMQKGTSebjKt7w4P5d4cVEOIQSmx6exMLOA/i3r8J733wXHUbDtF1+zTSkvnpKIhrxSEQLPWoBf7Ple6ti4PJ+rtvgaujf3Nc6u+hy5kuYqEC9XTmfPY1jVPDn0+co9/bsXV6hLGFpq67OmMfh9+k8Fo8cLKynPgjAYBWMegsUlBHYNLbLsr68GWhkl/urmidm2Ywvh2KqqxQ2Dg0CxYsHcdujIhb5oKKzNzmdm2lt9xw2d51bQMgqMEo0RaNQrXkWoIqCAIopUiy57hZSXiR0JIcIVlpTKZRQGpWA1dCFFtfK4AmGUKI3Tiq55Fq5EdTJJAQUKQhRjFIYCUYpWWesv7Q7vvgnAKHF1jdtyGbygAItcspUHJBglBqXVsELN8lmJSVUdA4ooKAjhmkpKRgnRASJBCWGMlhlfZaVKb/HgjIJSBJkiSkmpua4ouq4QtHr/qLWh2l4CKM6JTTgVmubNvJqFyCgFZ5RSAj+lRJFa0bAacz8IqFKKes+CSCmFUtLUNA7GiE4J4ZSuMOARQpRSCowCukYrus5W5YkQMEYopfBTipW9H/X6hXkhx2VwqAJAJSFKSUtK6QKey4hAgXOPx81zIylQCoMSMOohfIny+hiMEqlzZuoafc7F0esHYlTR71C1gVP7XhFQRRSjIIQo4rquCXhVQL1qv7Wdg1r+SQk0RqApLwgvpZTm6hQOSimsigXbsiGk551YPeAopeCMcEqgUwrFPFyNCa86+KWiqgAQcimqkBCAEg5W7RtCCJjXabVK8IRRInWNmdplRmMtlscZZZQSH6VErtp2XDI2QEEovLHhumr5Pgkh0DUGIdxQxbI3HDs93L4wn/VPziQX/QHjjMbp3EpbV48NIglRUBSgxJtetKY3q9sWRbzvOGO2oWsOrSgQ4j1jShGglChGCSVECdeVpiu8XE7GKBivjjdKdEbBlQShhLqUUotSBcaYd5z3k1JC/B49KZGGjgrl3m6RUeKjhNBav3nrlHdu7vWrBY3DNi8v87ISb60hnDmrjj/vMYJRWmGMKq689YpR+BQlhJAazz2pjlMvGlUDsFTHPaEEklJSoZRQRuFnFIp647zsAVxWxiJnHpemZTrrFucXe3X9XCxbsBabXPeCrrMpq7TSVtcVy2AORuGjFBQgYJQIxpjFGAOj3g60ZjkwSnzVZ6EAXBnfGZ5DSZVXpehLCkwuFP/+1ETxDgpXGY30h93Fym9bdjWgZCoopYMRjmQm+brDI3OfIUojEb8sfuRdN71Z1/ksNQxIIXDo6NivP/zk+K8vpMQ1ZXMeLlEIaBpioeTFN9/c8+eD69d9NpUVmJhcxInh6b85OVV6o8b9EgBh1SCFpEJVh2a1tooClEt8TDl37eq9a9u2/tlHPvfkQ4vpUgulJeUtUS6o4lCKgLG0GllYXGpNkIc3byn/XSgWWYrEEti88yZojOKpg0N/eHgk+Su6rslqNRbUEIO1/xUAablkw0zm9yKnRr5tVRmbQQDdFwYI92Y+JRCuCJ0dz903l7FaGX9WIThFoEAVlCsZjflYcvv6jtv0kNFzZmLhHkfpRLhFMjY5/x/idYHvW7aE3xdE97oOQCp876H7//OZ0ez7XZfRrX3Bp2659foPzs1myJn7LvwgmVS9Si+AwFVEMShIMCUxnTxZ8vvpmbfcjs9tWdf3mCISp85chGVZeObo1H8fmsq8y8e4WK4dBOopCyWhSaIE4cR0KmzP1saPRuKJe48em6VnRnPfOT+V3aBzrihqmS9ehxACNfVvh7JNDfzpvqbYXxaKpdmJmRROn898/MyY+dGAkRUuER7PLBEEUGBSV14wGFU1D3C4NNiO9wd07XEJwHUUJA1jfDIJ4VYLHSrpG5ms/HBqyermGhSUXiVYVUSnOTE+93BGp+WTN93k+8rWDR2PMUrBOMfFqQwAwLLthqMXUvdlCzTOvIrt5BLgBDwlZUpFuhLa9N23b3szoazkHSjhUg1K1z3DDp6X4J//9bEvXhgvXieVg3Vd0f9aV1/35eXxUhtRhCASCkFaohpH9T5mHCgWKpEDp9L3zmXKLRqjqmJWaDrn/CEovn75fksphQMHRlAsmaBsRdEQELhCJE6Nln60lHcShBFQRRVAIakDpQjRaEmMzz+4FAuaD1y3o+vvdI3n8rkizo/OQeMU+w5P/K+hieLP+pghVLU/nj02NDhuhe3esv7D/X3NDzI9BM4IlBRNx07PfuL8fOHnSln0/vCpY1BEQdclQoZvcX0b/3xLc+JP8sWKNTGbxsmhzO+cHa982KelpSQKBC4kUQSKepWblFYrp0IkIYAw6YXxmfcpKp8KJurhCwVw8OTFvzw1lvoZzTCkFJI2RJzHBzr8v2o7ArGGOLLZHNJpBY0Rcn6y8JUz48UdVFCs7wv/Xhdv/LaQAvl8Fk7OhmFoGJtK/t7JqdSvgXASDcx955kjp/8j9xnIFUrrT49m7ilLzihl1YCs49UkUxq0uaR7anpmZvu6hu9v7G/9JCFEKumhcy1XIRTiEFJC4wxz86muA6fm7ik6CBHCFZE2OT+ZfH/JUU+6ykC5XGkfmireV65U/JKTqkHHPPgYdT0DUTEFMKIgYbs24STwY1exD88s5D9wYjzzBz6qKdfx/WgriXyUMIH6+hZwBvgMDZls5ZYjz0z9p4WsfWupIgzrB2PQ/cCpi1Op9b3TX755z8AfUAIzFA6DBQJwhYDriLqTo9kfFU09DqkhErDy2+fm3uzzG3O2KbGUdeGx2tsdJy8u3F8yNV9LTI0AuGst3bOWrKmkulsbl98H/Ro4Ag3z+UyvRoF8nrVXyhymqaBrFK11PlBCQCHxje+f/o25nBxQTgXX3tr15etu2zSbXMghnSppn/3io//06MHp9wmlwQgAsYS/bJuuv2IyslBEz+e+f/4zoUi4dOsNG7/c37PR+Pw3Lrx1Lk06DaYgqQAjDjgzIAkFJIErKh6SRelwpUJrvSrsvn7DwvnzFzunZys3lmwNijiggkNwDxHk2l6EbCFlD5wasa9fyD9w50fef9OdPsNf6OrsBGcE8/eP3J4skF7N5wAmh6IOvD3IqkKQCtCIRF1T67RDgxBcLgMFjpwYQqVSWc4DqphW2/hi+aay48FW4VbX0+UlyqsvZDsVxLrDYtuO3ebIxOykUNxYzDudyvHh6afGbw8o4/uuVNi8YwCJRABPPXP6lkcOp/7YllSjmuXe/sabP0WY38pkZ3smF9VtlRLlgtuABCg4LNeDjupZAVfKbWdHDvy8xgO/eOfrNn47kmhAOlMg44vDdy4V0OOjHqiF1KqLgsKlElRRuDARYBQCdDqVyWN+LlN/4WLxprSDCBee68yj0CJwJIEgEotLBZw65+4absvc/t42322xumBqaGT+nXNp9AZ1Bw719pQG00CIggMXrushxgi8HZKhubjtA7fNNzeE4bgSGqc4P5bFI0+dBOfe9sK2ReP4jHNzXhBNKQkiKoDmPTvlSIwvpkEp9hwfOfhrxWzhD37lF274c04pOtv64DrA7OJiz8Vk5VolA4AE5LIbuPa0PNRm2aZoj7NFR9GSa1fhwQTQfBylYgWABx6ybTc0Pme9brGEZh9lCEUapoqmD87lUG4lcf7M7LNca7rOsP/Q8LtPXczfCJ2DQ6Fc0bGUNbsKJYlS2b70NFDw+SkI0y4hddY0hum5TNfYjNylCPNKkCsBwm0QqcOxBTh3MZ1KDVJB9xby4ze8553hdyiilYOBTlACNrE4cedigfX4qYTtAJS4a46NkEYhmTZddin6u5px5uzwnh88OfulhbQxAJcgEmaoi+mVXNn2Ow6QA2t86kzxD5qalyq9/V1/ajopcuL89M/NpGlvSLPhEI+hXuPe1klQB65jV8EaHozaZyik8mLamMtjT2cbpueSAw89OfObJZv5iS1g20BnU2Lptz9yF4T0yr0fOjwMx3EhXDc4Nm7dmCpoTQFuobExNOc6HsigPhKBoevQNYrvzA/fmszTXsYEKJcXpxcW0dTRinMX53dNJeUgfABcG0xqcKvuX9cxwRnF1EJl/dEzQ7ffeVN+8O137fmoIwVcKcApRTjgh+sqBAMUX/ra8EfOzTnbArruLTdE4cSZi61L6TSu3bkR49OpjaMzYgsnDA73DB1OFRgoCNHgCgUlbVDleYUqjoPtm6NsZCKPI0cXbsjmaS+ows5wk5XJx0CZRCQaxexsFg88fvwT33zs3J87jl+jXCER9FtKKZorOVrOJXVPHix9PBpYYtdsLvyWY7vYvWsr/AGCQ0fHrhmbG7tW4wqAhXS+Ao2EBjb1dswVCi4CjmfkjE4tbZhaUptM4aK1NT7xvFrpMllTST2xf2T5vaFRLKbKc7qhQKWClFTYloBlSfh0ikjMD845ZucWN5yfLL1F13ygvpJ9x/Wdf5FbMlEoU/zTVx75qydOFt4HTUN33D60Y33Hn+y9bsfZVHqp/sdPnf/fx0eytxOq4d6Hh37vlpsGvu4znHAiyI9dMxgbolQoSCWzJmtdSGI7BeD3qXJLa90+Li2XSJ1YrkY3D4SOEQ1mOi+3VCwX0AjiOqabw/nPgRmwHJc0NsXrphfdt0wnRY/f4Dh1rrjn8ceGfm7j+rbPtzRGYLpOdClZHPAxDRqA/u7A04yrvMDydgoAIKUi0YCTZ6R8YWnRXt7S+v0Gdu7cuLy9NQyOJ5+5sKtQSYFrHIkQS3XUBw5LtRIDq/kFXJORPTvqHiRaBZ0dkdLWDXWPzu+b/2WuGZiYL90RiVCNa7rjOBZGRpein/3y05+2CNGkcPHr793+u7ffPLD/2OFpjE/kthUrJmdaCGGNJuti5ueYtEVLWzTguIH1h0/M38V8IVZ2df7P33rmz5rbIvfOLS6Zw+dnwqms2+ZnDIxDdXcFnzEI8pRU8YhKU0RRCGWhPozMHbfuGAtFGJ54+tw1mYod4ZyjIa4vtTWoz5YKJVcIh/iCvnC2IO+aSZENmt+H4bnSlpnJyvs2dqu/iXLn3M71iSJhkkC50rJVaHbRvsFVlAQodVpb+dM+TTOhKBGOTZqaIjOBaOfFguMBS2yXoL8/hL6+ZgAEhkFx4Mjo9rxd0Qj3oSlK59oi9B8t25IlUWRBf0NidkHcnXFIh4APX/ru0P8kyry/sSF+MlFXj2BIw9j04nbHZjA0Ct0wU52NoUOc8ZW9L5FQIMSsOPSGPU3f6xmsh1mpwTQl5mbTMKgAIRScE5RyxZ5C0anj0FAfVqm913UMxWLham7hsmaB5VJY4tJ6T4xTlAql8ONHZ39b6BoiOoGQElxjSM5nfOfOji7XXFoRgkyxDEdcGg/VdYaLE/PbXOmAMIrW+sBkQyT/xbIJxV1LdXQ2NB0ZWnpLtuLvgGHj8Fjp9dsuZO7ctL71nqmZCRQKViSVc1sClIFrUD2dgX06UQVGqgkVy2PDJI0xnrzjlu0TubLA8VPnev7+c09+d6Hoa9G4iZ2b/Z8a7G/45w2D63Ojw3P9B45O/u35qdIGYug4fLb0gfe9O/KX6fmSU2/gzM518QxjAkq50rZUeHrRucGlFEFoTksHeUrXDZsoCuFapLWxYbK/f9N0JGZAD/nw/YfOfiJbYP5I2Cto4jIXpsuC0zMFKiWRtisQrquDrlNMzaTX58qiTqNAPMSSXe2t56OREISQyJZNlByBbMUOzqTNDT5Ng6ZV0NnRdTpeV4d13XE8sW/8WgkdmiDobtEfDajyQ4JptOI4NBqPtI9Pm+/Mm3qCGQHsO774GzftmP5kU2PsnKVcCGWiaNtgDBieynT86MnhXzd8BoIBBdNkUJRieHQqkE3Po78lADdf9G/qif+Ya5qkylbSVWoup3Zly269Ii5iIX20pTE8rEERpTSYNqV7tjR9NxKTdCKZ2sGZDkItdLYbBzs7AmhIhOCUSvjSdw+854vfHf5ragQQD4qFzV2B/3zrrXufyBeL2r79p3791IT5MR4M47HD8x/evvHC3zfWx4YrFQ6Nazh3pniNIhScUkgCOIriwvlcnzIDT9jCBQIShkExkszcDEGgKaC/I/LIFeonAM+hpP7+sz9Y9ZsC0cPCx+vhWBUv70a5UNJGQzyKaCgBjTN8+ZnDH0hbFZ8hJK7b1fSjzu6WU7lCCcdPT779yVOl3+I0hIEmMvTed+5448RUKWUYPnS21Y2/447+jw6NP3NMyYhvJmVtHh6e3bi+N3Hi+h1dbzcdDtcx0d8Vx3Sq/Ov/+NUTn1Uaw9YW/YHdO9p+pmQKGExDxXGwdX0M3e0RfOfe7E2uq8OVNvZc0/Sj67c1/+l37zsCyhXuvHkjujob/+4P/sePn0mVnAbNx3FyODW4kCnhja+7DsWCuT6ZKzdJFkLIZ6buuKHtLbmczBK9VuPFEyklIhELm9d3LRvaCsDcXBa5VHZ5gfD7OObmytdJxSCEi3Vt2jd2bG7/iGmRKp8VlgvduaaN63e1orejCfMTSxhsif3oATL3y5QoLGZK/dmi2dPZGb+gMYav3rP/v03Oqo1SAzZ16T+4dn3i7+YnluAWTMzPV7ZIReE6Fm7Z0fLAru3Nf/Tt7zyC267bha62LgT1R//oiaOlP/MRH5ZyTv9SptC9eUPXOSKx9TuPzTVLRdEUVXMfesfA64dG7BJlXrlvJrlX3hou6uMCwhF45skZnD2b2eISCe46GOxueebarc3/+YknjsK2KxjsjuGWvVv+/C8/e/DQTNrt4ETDyGxu1x0g2LGl6YMZMwTTlmhrDsC2Szd85stnnrJgoKfZP/6J919/+6ETc5ISAsex0docw8a+BKTw4NbpnInzowvLTCV+H8fF6dz1rqBgVKKrKfRof1vsT0bHJiBtG9dsbsYvvaXlM3/9rwefSlZUrOBQupTlP7N9c+vJYFRDMEwwn8pfR1wNLrFx2876f9m9re93ZhbKy9fwooYElm1j/WA9mhpjsG2vPTMLNmYyOXghJQLDIDg1nN5VtEyNcAOGwc4/ffh4UqqV4L5SCj5Dw/XX7UAgYEDJFcUSDFI88NDIuycXrXXBkCbeemvfxXsfuthPqcDkfCp2+JTHzbc8S5WC3+dHX1dvNXi5ovAMnWMhObnXlQwSDnauj/9wXU/rf31i/zCU5eJn33YNrtk++4+f/rdzT5iWFi4KhUDIv/66a3vv6eqox+Hjo9vzj4w2QHG0xsjUB9/ef+e5UafCufTKZawaG3UxgFEO23Lwo4fO/o/FnNtCwfHWm1r+5uZbev/D0dPTiIbD2LYlOhaOhv5i+PP7v8B1HyxhRZdyS5GBvtaF3dt7379UJrCkidamECrF0us+97XzD7vQ0N5pjH7o3XtuP3l2QVEQCOGirSmK265vg00kRsYWex95ZuZ9nEts6mv82txi4fpCqtxVtk1tYmZBE0JZjGsIhUMgUmFmrrDbMgUnnKE+xocqJTOdz5fANY5AhEHXKMans+uW0mY7UxqCOjJtbeqCYZgYHZ3F5Fxms7c0ONi+qeOfqFP6ytRMHlASN+3uR2N8/J7Hj+buETLA3IpJixbd3B1OnKO2AyE0pJJl+AyKL3/98G/MZ51Ycz3J7NnZ8O0fPz73QccErn3d1ug73roVCxOz8LHsPTdc03mPBEHET7FlSyv+9p8f358eceoJc/H2Gxr+qK6p7euZnAnmuV4RDnAsZtyuVKbSrzEfDJ1X/H7t2GI6CwWO0aly171PTvw91wIIcrf08V/c/M6J+fzTlGhoaozjg+/d+/G/+aen7xiddjaahPDTw5M3d5Wzwx1NbWhMMCTT+UGimBcbg4QrOebT2fVbt9RDUwpNHS0wDI4f/Pj8TkkENIMiHpCHX4ySWjODrrUtvvxqb08gEvU5XgzUCxIQSsE4g1nJY25+BueHz9UdPDzxXq4FQbmNG6/p/Btd51hKLun33H/8jwjRwFQRb33jht/fsXNzqqEpAcuqYGpuEfmydbExEZ4RygWIIg8+eKzj2999BmXTgeNKdHbWo7EpgLHx5G5FCKSSaKqPnOuq11Af9aFccaBAMD2XwcOPHMLcQm5dLRG0qSFyoqGxAVs290GB4OiJSTzy+NlRQ1dnqfSBSAa/j9iN8RA4dXFxemmT5RImXAcdbdHT114/kB3Y2ALXVahWyIMChVOFb9cIdV0hYVkCpgVYFoFV/VkqS0zNZfoYJxBSYM+O9Sfuum0TYtEAXFHDtFJIUNiOd55coYLRmTTaOhJP1sWMMgFDsaz0ibnK67t763Hs5NjrH9m3+FtE42gw2Pwv//yuj2ncr06fnYBLTSTzuZ1QFJQA8SiORwIUgwOdyGQL6O4L4F2/sPdLfsOtQElAST47Oe1PpwqYWShvdx1BpWKIhMLnsiYpUYN5CaKEQBEKRRhMW6Bi2jg/NoHZ1AwuTMyt54TDFi56O0Ln7n7Tdrz5rmvhCoVotBWENS20NsVOu0JBQsIf0kzNCCIaq4PjCHS0JtDdFsX8Qulm22VQykE8zs4bfirjMQO2LeC4ArYj4Lo1hKNCKptF2TRRtiyULQvFioXx2ewgYxzCFdixvffI+95/K268ZRtM00XZMhFrjJ5paw0+LFwBTdcwPDbR/aOHHsXYxXksLdhkdqGwBZwAFGhoaNhvuYArpReOrj0rRWCaAq4rIYQH5XVshQvnZyAtC1xKUCnAJLCUrmxRikLYNtYNNpzobO9XTQ3daG5ceTU1diEQMKBzr9qArgF+P0Umnfc/+PDZT7hQ2DZY9/j1O/s+YAkLGiOYnF6M7jt4EgePnll+7Tt0EueGR1EXpqgLAYkgWX7FAwqZfGUzoQAHQUdb6Klt2/rQUB+FK4FUjqK1Y+PxppbQiCMcUCXhD4SlUDrOnFvC8MX8tUpSKhVDLBQ+U3Z5RTMYPG9odWyAQSgCVwJHjkzi7InJzqHh/NuZpiEWJvnbrt/+1yGjHp0tzZhL5bBQsJAqWIRqDiQUNCoKU1ML2RNDE97cEkBHcx06GqOYmy/e7LoMrrJRV2+ciSX8KpEIwnIkLNuF7UqUbBtS2vjej458IpsVwViEFm66pvl/g4gKgQHHcfWp6UVteiaJmbkkLoxN4vzoJIZHpwbBPKaV9QPNhxs6/SrWbCCUCMPna0Qg0IhcnmyxbIcKCNTHI6fB+FzJcpDMVGLT89n1nDMoQrBlQ+/EO99xG6LxCAyfD4ZmYOuGdQcjAa1QA2aFA/5KPOJHIhJGNOhHXcyHbCbfdOjkzK9JCeza0v7tCKPfcaWEkoDuizQFAq0IxrvAuQbL9ljIw/EQBGX1qZw9oCiHrjOhBcOncsUyLNtFqWIjHA4AhOPEidG+SkUGhBKoTwTnW5oap1pbGrB+XQKPPHnyPyRTMuFKBzdf1/aP19+w7ununiZoGsFAbxjNzRG0NidOO8KG6ygwGhi45cZr0NIcB6TUJhYW9hDGvdAAkSCKIZ3P7OrsjKCxPohzJ4Zx4uAZ3+J8dh2hBnRK7E3r2y6+GCW15k4qkYgvv2eUQOUdez7vhWmFkNS0HCgp0RDzIRri+PaBC784s2Q3UuLD5o3xp/dc2/+kUyGYmTPvHJm1r9VgoKsjeLguSu47duIMwiGGYJgglmgFZ9SOPD1dnF4oAyComGU2NVOBP2Bj587N6O9uhFKST8wWrgVnoMpBfUPDmXB9M8qygJJJ0N0dQ2NDGIV8KbS4NLmBUAldEawfbDvd19+Kjs5GbFjfhnSmBEARQmkI0oWjTNywa/PYrq2DyOUWkVxa2iGVAoFEfTRwupDPg1IHc/PjKJdMgHoQ2vbWRlAaAOMchHqZ5Y4tEY9FlzPnGQWKxUp8LmNu50qDrgul+3EmXSzC8EkMHxoFCCCUi4ifoK25Fa4jUTAtNHUkoKBmmyL8aD4rblTMwMmhiT0Tsx1f+Lfvnvy0Q3VK3Qre++7rf2fPtZvG55dK4IEKysINTC7kt2qUQygHGzZ0nt+2rRs9fV2wHYWFRRP5jMWJBAQENM4ru7dvSMcTYdz30NAWpTQI18aWjV3Hbrl9EyxT4itfegxjYwvQGQUgsGNLP9ZtXodEnR9d3c36fU9MXM8lg2BALKKemZ+dQ3d7HL/63jehoaEeSjkoO1aYgUIqGy310RO634e2zjZML55DLOhCCYLZWXMXIRSQDlrr/PvKlQoa6zVkMmU4q7xalAGm5UC4JrrbEt5nFLAsy7+UKm6nhEJjFPVx//FstoDBgQ7cdON2gEscOnMMwSCmufKGvWO7pFR0US6ZmJ1NN8zNFbo559Cpkj398bGBvhbEp7L40X0HPWNEuYhHNXR39UJWbQzKgORiEfUxhpb6yDL6k1Pg27n8NgUNREr0dgaOdHbpqJiX2oVK6pgcz3hJ49W4pt/H8fTBsXeNzTrrGFW486auf2hqCKUVFBzbRXNzXfij778elr2yW/LYNBycGl6AZ056QiiFY1vx2fliD6eAwZkMBPwXZhfLuOmGraCEIxL1w3UqPqvkRBSl0LmEcJwLswtJRBNAMl0cUIrBETY2b+k7vve2jTArAl/5l0cxMb4IxgAOifq6OAAN+VIWcwvF63O26yfQ0BAVw8ns/DRyHGa5gmf2PwnbqcBx5JkwMf+TYyfV5uae0b66fguQYKwMjiIaIkFoRGBx0dwpqnC3tkRgn1kqoqlOQ3JRQPNxdHSGkSuUsJDMdT28f/p9hFMMdka/1dpYf4JB44AL27b06alZzXEFenv70NneASVdkilMXKsogUYkQkbw1MKMhO0oWGYRjl2Az9Bw7NTMVkk5lHTQ3dp+vj7ahnBYYWpqcTBfUK0CAo0xfbah2ThtUwdveOMOTE8sIOgTKFcsn+1KTYIiGNQqmnSG5iZmEApHEa6LQSMKDz5x/iOzWac+5NflpnWNnz576kIj5RxKEMwvpINHj13wGORJABoT2LKuERpXOHX8/IZUxkpQ6kckwJL9g31zgaCOfNbE/HQKTXGCuqCOo+nc7orNQKhCfYwMtTSyStEs4cCJpbaDQ+n3c64jHJDlN9+67ZOFig8bNwwily8imy0g4KcQrpMjREKAwu8LRhOxekyXMphJW63ZLOmSykFrU2AmFPHlD55IbcjkRN/wqAhxzorrOrsxPZvqSaatNigDbQ3+C8H62PhLVlIhf2SVkqIomUWXoFhNmiOwHYVIUEdrRxOUcIzDx2d/nXAdmirh2i2df+u4QkSiOvYdm/klFwzKtnHHTZu+de3uzcKyJObmUnjmmRMeHyAjRrlYCRDq7VSiUcMJBTQwxjDYXw+/jyOTKTWnslY/QBE2aCUWZQfnUlkIKGzd0oBEwg9CCFJpc0Mm5/QowhANkXQ8pp8tlEs4fHwMuayJ1pY48oViZ77orhNEIRTgWabUg4upJfgMjUzPFq4lRINSLrqaEyeY8uGZp4/j2LFDgJRwCIHOOLobB8FFPc6dHQIlgJActjAuyUfhjCCdKw/kSrIZAGIhloxG2dlTZ0bxwI+OYHZuCYQwWG4JHXUUuzeGkE/NIpstwrYd+Ayu1ndF7js/sXAj1zRMLTjXf/qfj3/54ozdR5WDO/a2/dub3rLzK46iYEyhu6UOcwvZ7mxRtINQRP0kM7e4cOS+xzJoqq9Ha0MTiOS4OFnYkzeJ32VAPKSN+ozA7FI2T8+OzewCZ9CEg6a4fmxmZAZf//bTOHToQjUJ14KrynjvO69BybJx6MQiLMtpS+edbhCOeMhvQZJTJ8/MYXZuATffsBVdLXEkU/m6+cXCBkoVYhpxGhvwo7OjYxASaGyOIVO0kSmabGox3UcZoAEY6G47EjL8MLgPu7ZH8MT+UUihQAlQsQSePnAariuW3XDeAm32ZYuySxGGcAh5CpybmMh5YBHNh3Q2C5/O4ViCEwBSCkRj4crAQAM6ezowNZXalKvIeqEE6hLGZE9z4Pzw0AV84xvPIJnMghCKil3CYJcfH/+VO1FxBApLBUgFzC/lULYFaDWZ1GNutxtmFspbNcbAuIIycerUkdnleJRSHldaKBzGaocGoQR5KYz7Hjr/MVdJrGuPjNx0/cYfTs/OradUSakI1XmovinRv1xapKru0FwHdLWbqz19MAyK46cnt2RLZ5oU4QgH1Kyw1OjifAmLS4t4w127sWVDPY6dnFm3sGh1SxA0xchCQ4I8PTO3BE1TfCaZuZ4wHTocNCd8R2dH5/DVbzyOw4eGAQCuKoGjgs19Hdi0+U7ousK50cw2RypoRMF2/OF4vJUmk0l5/MRFtDa3oVJexPDoxYMQOEgV4NcVOtvrYZkWWtoToGmJ+VQJkEKbXMj1M67AQNDd1nCcgyPoI7jthn7U1SfAOaAxhXvuPfbhZM6ORAwubri2+zOcG2AadQkhsB1THxnLc9N2kYhF0dYYRqlsNi2lzU2gHAYRYmN/7ERzvQHHNZDPeQTajDhILmV2KcpApUJni34kEnAwNDyL4bH0RlfqUEqguS40pMoyN5PMYCGVxs5tG9HaHMZDj57alitaAVdxtDQaJ6P1kYu2UND9AYASTM3nGn+8/8KHiNSwbVP9/vV99ceOHT3zNkoAxSmSS9nQ6dPnYTsCfp+BN9y2CYGgBp9OcX4kva1iMzDqoL0xfiIWJBlb2AgFGAYGOjycrcYwn5K7AAYiXTQ0BA8UyyZ0YuDYkem7l3J2mEsD/R2Rx8IRfaxQKoAziq72GAgBAn6GYCAYV9Jz5ylZSTtWDrphoWIX1xXKJCCUi46m2OM93Y1nDx1f+rN0RtQVCkv1fd2Nxfa2CMbnUjvLFjUUBNoaYifconUp4ucnUVL1DYlViy1DyVW2UoXa2CdKKfj8HEXTwVPPnLvz3MX8VkID6O4Kn71jb+/3l9IlTM5lG4Ynkm9glCEUUXZ/S/096fkiHEcgFgjg+ms3glGGTDYf/fp9k3WgHFBS3XrT7mRHaxTliouLF2fBKMHUbHKgWDGDUH7Ux/zz7S3hac/1SHDy1DCWUjkYOkcyXepxFSeOEuhsi5wL+rTFs2encWZoHGF/FNfv2YR7HjjyiVTJChGHYu+ulq8N9HbORiMaQNy6pZwaIIQiEqBWvE7+6PP/8i2cGZpCMMhAmUfMqlEOKMC1ypieyANKQYKisWMzmGYsI7S4zpFMZ/psS0JIFwNdTafCfi39j998AoVCBYahASBQhFfhwhJmYQmBRAD+hmbonKCrVz2tPz0HUIqFrNO3uJjsUwxoi/OR33zvrb8dMSjSGRtP7zsGSghm5lIbHEfprpJoiAenEnpwIRwJI+KLIJdLo6sthIOHR9/lEkBZDq7b3v2DdK7oHD8x3pIvyV5CKRJBbgslHv/UZ+7HyMisl9tGPEp+IhkoCDb3JhDyW7gwUunLl4RPQkNdhE3s3bVuIpN3MDk1i+nZNDin+PEjp39rPuXUAQq7N9Z9p7et9YLtSFCiUHQsMMOHpXSpbynvrlOEIxQgJudsdDZpefRUBOjpaoSoZv3nMln4KAEMbXm3oGsMc/PZ7rIFppREU6Nxbt265jkhAUYoUqkUfMyArjGcOjuakETCcVz093clb7x5G0amshidKmyzlQKRAi1NdccOHhor3v+jAyiVLBi6xyzhKg7KGHSdQ9c12OUKCAAfFSABuqo9FItLpe5sAXVQCg0NZGrbNf1DnGsrdZQI4DiAsD0GeA+cAvh9OvYdOvtz44vlbRQu3nBL96eHh6fcf/jsN1zOo4IIjeZyZuDI0Wk4q1NFJEEwaCMScaFWJXf5DIaRi5NbLQHCmUR9zDihhJM1DAUhSrgwtgjiVvCt7xz/REE4TLoUe2/v+MK27YNLF8cWMDW91JrKu70gBHURn2laztOf+tQPMTo6C706Nqhi4ERHKZ9He2sUW7Z1YmgsI90jJQSCClNL+cGHHzv6hxv76v7MMDQEAkF0d20G0QyMnF/AxMQ8bEdACgXTMVExcwj5NXDOsLBUWLdYFANUcUSCsuj3+YbTeY8cOlHvQ319AATA7EK6/eDJpQ9r0sBgp/HI3h2DB/M2I0yXAkJBCM33C++5y1dXF4VwBDijyE9ZncWyEyNgqIsHxgMRPpQpFeAKBUt5jN4V16lL5631Ggh8uq7qGuMHSzbQ2dSIpw9M77KkhEYooiHfGduhKFVszC2kMbeYheXkte8/MvQHAj4Ct4g33HjtJ5ubm5TjCBh+Dm4o3P/U0IdTadnEqMQbb+39O12jCAYDArCgADiO1LQqATajFAsLJiizYegMI5PFnZJRaBBIxIyjs4tpWLYEUQqW6RVPIwR0ar7Yr3GAKIGN6/tOhhOtiAU5JudP3k0Vg4KJPTsGvwd44YtyuYSTJ09UDTyG2YVUHeUGfFRifmFp5lv3PI0Nmwdx9OT4DY5yQZRCS2PkcCzoDGucoGIjOL8wu9mnWePlUhxHTo1ulVSCKoVoSD9tmS9KR62tpOKh0PJ7jTOkfHlHKQmFWhaMC6dSwMKMwGPPXPiwID44bhlvvvW6Tw0O9NqPP30SR45P7FzKVeJQOprrfcOJeGi0WLIABUzP5FCxXHDGkC867TZInCiFgMGzxbKanFmogFKGeF0zfAbHqeHcHscFBJNojMXONiaaK67wILebBkNwbAc+n4bv3n98V0VYABWIhQJnM+kKKmUXhs4IlGz9t2/s/8jDh2Y+LqWGwQ793Id+9cY/iYQDOHj4HGbmlvpyFatOYwyS6uIL33z0t0TeLOqhOHHhgEiiHAIqJUgwGv/XWH10VLiimj2jEAoQcF1bVlI+g2M2WboFkkPXOS5OL9X/xV8d++OSRcF9IeJUMxJdKMq4NhuNxT8nhJSUWqiv8yZIMNh8rLE+MDmfVJ2cMxBNQaiy+PC793ykIcaWzEIaw2MVgLfC59eQzOX3SOHCkQx9XYlj7/75GyUocPzUIhZTRXzx6wd++/i5pbcS4kNzTGXe+vrtn9V1BspId6EoIpRogKaJRx87+dGJiaWyzxckbm1FBYMCpRXT+ZzjyGk9FMPYzOhNrkPAiERjXeT06MVpJ1dQ0DklSjhNX/jGvg88fWjpP0voaA6XJ37h7df+p/r6FiWkwtLSLDTdhKFrqNiFdSVbGEoy1EcCI53t4QlC+SqAgYFC3oLpuEgV84g3RS5Br/kMjsXjEzc6rscB2BAPXsinlpRpC7guRchfh0iQgFHCTDW7TpIC/IzAsdzhmalZ0MIiJiYvbgfRoDOCxWSh+zvDp//YsSmYHqw9KyWJ4kLos9lc8TOozgUACPk4ivniMiKCgGNmNrlNOBKCStRHAyNuKVmouCup4VIK+HwJ+PTIckIlIQTCqRhPHhj9HaUoGhLaQntb6MvPHDwJ6UBSShVlCqWyHRgaGWWuXOG6d12Jro4YEnWJSyoRU0YwPp3eqhSB47rYONgz3tESRSqTB+eEFkvlrr/+x/0fO37a/mUJiYF2/dj7fvGGPydc80qDUwyUyiLAoEEyKh989NjH56ZSZWPV2BAIEkZ0ZTvqH//189+ee+NbX4e4n9wX4PKPBBh0puPhw3P//cJk8tamuPGpurh4mBCV7+3rw3W7r8XYxTm4hQJcITA+Nwldc0AphaEpTFuV9bYtuZJAQzxwob09OAPCIJXC1NwCLk7PwdApHnp85DeWMirGNIXdWzo+LaRCb0dE+TRqS7iA4sFAqKUhlmicGh0ZRjo1h/PjuescpUEqF/Xx6EShKE3HMWFaFoqmCc4pkqlid7qIegqJSIgshnzhi5AampuiJJdX13lTw0FPa+jxTCqNimPDZzCWSuUGPvdvh//bhWlyg3Bc3HJN0zfecMeur3KuYWJiDjOzC3AcJ/7YvvEPK+rDQBc9v74j8f3R0TmE/IYLCLgORV19rOHjH3kTHBeoVGw8+dRRuK4Lxggbm1zYahAdUhaxZUPD0KaNHbBtiVyugFRyEbqmIZMr9OQKdj8hDH5Dszqa+NmARnDizELrufHkHo35oOslsyGkPV3KlGBbLprbG9DRuQtSKgjh8m/8+P7m2ph93d6d5wbXtWByMYeFrNxKCYXBGaQsHctkyKyhE2maFnVVaFNvz8APpXAwv2TvgiTQNIKAofZPTidfupIKr1JSuqbB78s4qOasCCGo69qIxiIYn0puOXU6e4fiFJ0NfHrH5vZ/O3chj7pIB2xr7nUVl3ocYCG27/TIuFMrGVDImLBtAU2jWFiqtFi2JEowtDYExzdtblsSSqGUL0I43o4jmSnskIoDQqC1Rd+XrSzBNGvMFApEI5DUIfO58o2MCuic49xo7g2fSR58QmkaqRQtfyaf6c4VZV00zMs9LerBd7995+80NcUXRkbmYRgRpLJLu02TImBQmKYKVGTX73JNwIUCkRxUUThSIEQdhBJtXwlEoxBVPhGlANuxYDv55X5zLILFVHkrYQSMuVhIs22UdG4jbIUqhgCoQIJHow9mrcRnbUeCmkA79WD9daFYYWNf0+PjC+PvDRANpuPgPe/Y8Dc/887dP7ZsoFR04DfyGOzm8BkMDzxZ2S7hh04Eyo6T+O6Pjn1QupzNzBfCJ85cvP3ESOGuCgtAsyz5ttt7PtbWFpnIVsqwCbnZNAnxBQUyReZPZ4O/z/1BrAp5wAVBOOBgqSK/UDg/i3TRwsUpcxOjOrhuY3g2e93X7j3/hKs4tayKkXt8pjtdVvX+AK9srFdP/uYv3fE7u7f2XbRtCdt1YVsRBAJBBPwUzxzLbHYdgMBGZ0vjyXg84lbMS3OJEvEwhoYvIrmU88iMa20jgMYJJqdLuxjhULKMwZ6mZ+INjaiYLjgBKsUyKCMolSp1S5liNyUMXLfd9f3RE3UJP8p6PcumR7brEqC6wtSi2kFo+w5vh7vSCZaSCDfFvjMyV/iMtYq6iFNvNa+J31C4OFq8TkgKCYXm+sgpfyAGVCHjHlsIQyIar3KieewfAb+Ox54+e/fQdGk7FQS3Xd/9te3bepNnzkwiGo3KpKUJCsB0hDa9sMSEVMuNcByBjeubkEjE4FQfHKGAkopOz1Z2aYwC3MC+k3NvvzA6v1WCkmK5Esw9dqS/UEI4EFb5nT3h+3/vN+/6j/29sezhI/OYnMni+KmZPa7LYPglckUEstng7zMjhNWeRkcBcb/E29+78wt+v4GWuhi6uzv3TSTlP3zv4fHfYjoFZ36MLcjbJ5KV28fmFkb723Jf3bC+/p8DAX38Z97xOliWjTJxEKlrWCY29fsIlo6ktghXAbDR1dZ8qq4uKssVCcYZGpsawDmwsJBpPnB09gMu96G3kR2/ZnvnfeMzMzg1dA7lQiHjMcsQ8tT+s/Fg4CL6mhk66wM4cmL+GiEIpBBY3xM7uGd7J8qmAKNeHbKAn+EHD568rmJJwhlFPKydNQvpTEbZSCYXE7PpbKfBAU51PHVk7o+PBuY/5hLOioVKOFeYGyxa1B8N24t71tV9/T985K7fb27WxMJiBflCDrrOse/QyAcWU1aLCwc3Xbvx001t9ebkdA6RUNipUWpULCeaz1twXAlXKrT1doIShUwm35ormYMgAQR8RpkquX9sZN4j0xUUyg1CEYZsprSpaIqAAkM8zseoZGMXR8YwemFyU6ViR6XkaGuKTSSaYxfKUgI6xfmL85DK27mVymZ7Jmd3U8IR9DFn5OLcjG4oNNcHtUy2MKhA4OfE6elpnq44xkIsvJhZsK26E2dG+3vaDAz2tkaSmfJ6SjiiAa3Q3dMwousvXGJntayppKLR8PJ7XdfgDxiO8tLqoaSC32DYvaMDf/1P4x8qWjAUEbh1V9/n1w8mck/tm8HYaBpDY0ubqU6gHIGtG3qPD/Z0w7RcUCIR26TAKIXPR/G1e07utWwvcBkNYmh+9qJwXIFcyULZtsEg2dhUcj3jOri0sH6g4Uw87oPjSJRLLpaWTDAGZB0nsJCqtHk8SgxzWatjLks6pKpA2AI+PQBq2Ni+senUm/Z2/2ZXT9dsKSehCweddRwP5ewdSpEqS7kLv0a9JGJFQKgLEBfEBdrqgocD/sBoqewAVeJUXdfQ1de7XIWSMoJyyYyn8yd7wAAiCQJcQHAHROrLfaugoLs2BrqDD7W11qFUtpCoiyOYiMPzo9s0lSm2MOrxG1Omoa8z9ujZ09MwLQGlGPKlChijKFXKwblkZpAxBk4pHt0//dYHnpp4KxQBmAJlOjRF0Bx0Mts2659obQp8OZ+xkEoWcW44tYNoBFQxGLBAfOxSPiAAcBXaE/oBIuUEkQ7q/K6RyhTXUwYQYiCTFa1LKbOVK8ASEkxjMJjChp7G49eu8//mdbs3jigJGIyiUpAglMDHPW6w4bHcLYwYgCqjtdF3OlsqwbxMSWWLCpwodDRFL+FHpyAQUgayBaeHUAK/DhX30wPz04sQUmEpl0O+WIDGOXK5UpdpirhSDNGofyHso2Njk0lk8mZTukx6wCmEEvAzG4QrKFmljqrqH8IEGhPqoXwxs0xmSgC0tzZV+R89NAWnDuaSlQ2UMRBiobUt8njWlrDt6i5KAZGgUS3F4o0EQihKpsXve2L8dwAOf1CYt+/Z9Gm7wlEpOYiFw4IuulJKCUp1/y+/a6/u9+t2jWGJMQXbcnF+ZBKUVosiUsAyncZ0XvRQ5kASiulFq21G6W2SOnBsCR/XoOkU2zclntjSY/zm/Fw2tbhYhF8zsKm/E08cmNkhiIKUFDqxwQyG5boAtSHiuuhqCu/ftrV7CgAcWyLgN3D3G7Z+TFrWyVNjqd+Zm5frCVWgoEhntL4nUqX/PDSZ/8A7wT40MND7A03T4AoBw9DgM1iV35BgdLxwMyM6ABM+zTp+/MxFz8BlOnRNR8Cv4ZFnhj6UKpMmwh1s7It+Zm4+Zd/34H6cOH4G/kSP5FoLJAQOHDoTBSS2fehutLTGWa48upkQwKcxWK7a94Mfn4HtCDQkYvD7fdA1hgtjuZ2ESChF0FjXdMRGHAONQUxNLW7IlKw6SoMQEhhbkNsEcaGUBTgKms4QDGrYu7HuW1v74x8P+aKqkAFSSyU0xOOwLCt84MTib0pwtCVY8rrdg18Zn87B0BmCIUMQwkCoRLni8tm5HJRUWMyaGJ0rQtc50qnCurJFw5K4qIv55y0rMDUxZUMKAWlnwYiErjGcH1laJwgFHImBzubzbU0N7visQrZErrEdQCoXHc2NZzdv6nEtxyMlGD4/jWy2CF3jmFzKbckX4QchiATI9O7dfVO2A5w4n+yZTxZ7QRga6/zDvV1NE4oRJxLC5EyS1Zmm2qQbCodPX+hK561GCo5YkI011zfPkecpy7KWrKmkIquUlKHr8Ad8LiCrJD6exXf82ETjo0+M/yLRFZr8LHfHzRs+NzdfQWZ+EgFaCRZL5XVUcRiaC79PDZUqBTiOF1coFD2WYkNjGJkq7KWMg0obTXWh/fmCgm1L+P1+xEIRpDKl7mxBDIBQBP3KbmyIDOk8AEokXMdFXZ03mCamUpvyBbcVhCNs0FKAZ79WyFLbMBj6N9c3DI3nbyuUUffQ4fk9k1Oph/7LR5tvcR0kD52YgRQ2hidS6xkncB0Hd7++808Naj7g2JLokioFD2IqBUhLgi8F3JLrVuvgCFcgEIhCo2K5KJrOCUbnkltTuUozSBgRn7Vwy+6290i4Fle69Kj0amwOgnQ1qAvzE2cAEPT17EXER6FrwKe+8Nh/PHRm7o6ALwilOBQcPLlvZJddEvdVKjZa2xpQ3xAHo8DFyeSGbAYdhOhgcGV7XSiriFSK2OCUuT6qTXU0+R/u6vD/k99gI5WKA6tkIubXaSZbWq+IxyR9x+7m342G/U9Lx0vaqZaVgiNt0teZWFjf36Hm82XMzqd6k+nyAGV+cOJWuLX0dXBYjFO1pb87upAs3rRYFO2Hzqaun5x0H7p298TtLc3xUaUUZmZTGBmZqZY1kL65dG6QUQZKgIHu+gMN4QAsY0VJEQI4jsTQ+WSVHXzVAGYMqXR2cDFX6KTEgN/HMgGNTpYKFRAQRCJBRBIh+AyOx/aN3FoqEwLuoCEaGNI1vVAfZZiZXdiQLhUjAkF017Hp1+/tfl8uV7IYakX0vCfmCIe84faNQ+2tdcus4pRSXJzMwHRtj3mFKuRLZn0yXxoEJQgaVDXH/MOiZHpUJfBKW/jCITDGIZUElDenntx//m1nJpO7iaC4Y2/PdxpbQxe+de8xmAJIRHwVSnJCeTD4WFtznT8S1YvLxfoocP78AhgMsGpOn8Yp5jL5wUyxEpXEQJ2h56he+GahYAlNk6pvc0v92Ez6znxRi+47nHrL+IXKva6tXh+LhfPbN/UBwuXzS5lNhDBQSXHH9S0fD/r0w0p4daqoR4sA2yrTLVtbF9oagqpYdFCQBJAcluNiQ3/LP+3a1fP1c6PTdxwbmn1PMqleny6UwrpPx1KetHzz/otf3rq1b0djQ2xMSiCXz2FifAaMMSglgguZYh+hDIZG0NkUO8QFQCnDuo098PsY5udyDc8cmf81RSW64nTs9bdu/Ldz41mE6jrQ31dGqqRbpgAqtos3711nXLOlDUAFQxfSbTPz5XWMMfg0y1030DwWjUa8chY6oGsEjEo6vZjdyKgGKU1s21R3YuumRsDJYWoxc41lUaIbHBF/btgtFx8mKkh0naOtN9h15mL+llKF+n+4P/mRxblS/Mbd5vsY11zb8QogPvXUuQ/MLtndigB3XDfwKassl368/xT6OuOIRv0VojzGmnLZDpw9e1FzhHI0BrQFCQyNYezs9LaK5bHCxCPqfF9XyLQcgXAoiPr6bkgpoXOKg0MP3CyEZ2y3xPUDui7Q3hzDQtK8Tiovb64hxo9OTy+hXJFgjCMar0c0Xge/n+LE+dROWwgQEPR3xfcn6rWypvsxvZTaXLbgo6BIxNnJ5MKsI2wHsbA+Atg7MkV7fSLS7BufnN5ZtgQjUkNzg36oZJWFZV3KrPITKalQyLf83mcw+H26qyQBYYCUilJp48lDc+/JZFGnlIubX9f5r5s3tU6n0hXUtdRjYTHdks45bVyF4TOsQrzON6KoAjSFWDAAKr3JXSqX62eWShsIk9Apk7fevPGp/v5G5HNljJ0dAlEUpWxxfclSfqWAunp9RDfIWCqXh1QKuWwBUggYBsPYzNK1pk0ZYQ662vTDm3s7P/i9756HPxjEu37uWkzPZHd9/ksnH027Mjg8Xd5w9Ozw667Z0fX1PTdsxFIq15G6d2QjAUeAEft11w1+dT6ZPDc+Pgc/5VBKgyIMUkgEAxqCfgNCKSipYPh8QCiKxaXScuDc5yM4P7q41XY5QIGWRuPwusHEw5MzGXChVanvBbzaLwyBAIehETR19IMZQVRMF08/c3bvtx4Y+1OqB2C7NjROACYwOWu/7aY98n9QzlygAikYNEqRzmY3lx2XUu6gqx77P/hLt/1MKBiWwizRpqaIffjI8SzTmEpnC7AdF/HGehRgIpUqd03PmwOMU3DmWDs2t30rkzXHy0XLIxetjidXAbrBEUsEkGgOIJkqri/bVAdcrBsMXvj5N77p/Z/8zA9RKBfwptu6MH5xpv/+fUtPZF3VslQmXf/0rw/cWRfXRk3Lwdb1GzDY3Q2lFFKZfEe2UGoCMRAKGcXWpsbzUujwSqdUlZTyFtzG5oZnEcMaBsNC2txesV1GCUN9XfS0Y/iWyo6EYTB0BHVAKfg0huRc5QZFdEAVsHWw4+H6xgRCwQBOnk/tdW2AMhftdeF9fV2Nj54ZmoLBUb1eTUkR+HwafD4drivAOcXivAniBhDRg55i0CiW5hc3pgpunYSOiJ9N9ve0jwdDBqQAKKOoVGzE4wnUIljeBlyy+58493sEBvx+oDEef/ArPzjWmVmqEEPXVRm0VbACASFwXMEmZ5b0cD4IuYq9QkmgsS62/HvAR3Hw6MT1FdcFg47N24NP7NzQ92t//5lH4Nc0vPfuHcgWSrf85T8duc+UMrBQ4nuOnR66ubkx9sP2wWZks+WBuQWnj1MCnVuVnVs6v72QzM+Y5SIopctKSmMaNJ1BYxrgEEjlQiMaIiGOaITDVrTQ2hr/bizKv6sQHHziqQt/d2Fa3uXTGLKmG/nq1x68pS6qj5mWgx1bNmOgZwBQEgvJXGemeKoR8CHo17PX7twwkogGYAR0wGDwGRTfvPfwb6Syqo1rFIM9rU8eP5MMTS1k4z6/D539m1TxwqKGvFfPrbujoW7vNYNYKORx+MTFTSVTBAU4EjHfWFsDG+Pcy7nUuVf5N5PNtc4vFTdS6oOhaY7PECenF2ZRcVycGFvczKgGxy7hTa/r/bLrOH/6rXuOo669Ee96506cPj39wW/eO/05pbH/v703Da70us87n7O8290B3Huxbw2g9w3d7CabTYqkKJKSLcm0JEu2ZUWW5Njj2EmmMonLqhnLTuJMJa5EjlOWEylObGc8immNImqhKJJNmkuz2Rt6QXejGzsa+73A3bd3OUs+XLAp2qpJlFSl+OH+PgHfgHc5z3nP//9/Hixs+z/zZ99+5f8Kh62FB04MQ9S92MsXFv4eoQ7iduDbDn/rhb+aHPR9jZvTge5Mx3s41QgYRbXeCF27cdNquEHw/kdP4L4Te8AocObi2gNKU3BodHXE3yyWSvC8AOWai81KvHlYSJSzkcMBTg2YXIIJdvn1s7MgXJBiVfRRxsGZhGOxqcXFDXi+QCISQn9nO5TSUILi9mz2UcIJiJDoTLafL5dNpFMK65u5o0ISEKUwMtgx3dudxMT1TVjcvMGp+plGQBKlvNdTKQb7hWbgJMDYSPJWWweF9zecUv4HRCocCd4RKZvAtqXATtoj1VQK16VvXV75LGNAyDLc++8b++r83Rqy2SIIj4GaqksRamstEA452zMzG/m3HZ4fe/Awkuk4DE6wMLF1Olfw04Rx9HQ5dxIxZ6pU8JAv1nB3u9HsxprPHFCy6TXWmUzcNigRDTcAIQSpdDcIoQg5FK+dX9+ntAQCgdGR3sn/7Qv3oS3ehe+/cB3pVAqDvb1Xnn1+Zmt7tRLm1ESh4nZsbuURj8WxlinsrbsyTsDRniALK/NL877QMBgHJRRaM2jCoFUzW6YZgd70YfeZA9uOImS9c/1si2K77I9DK1AiEI+3X98uahBiwzDYjoN384r6QiEIJA4c2I/uvgEwCkzeXkx85T+d/5obGFYkpINHTg5/49VzK5/goOZWrnEgEo+P9vak7pTLVWxsZOHYHFPTqwcoOIIgwN6xrpsHd9mZTInDUzYs24EGge9LeJ6P8UO7EQpHoeoUa2u13VVXhTQhSCXtacKd9fZkCIG/DSUVKNlxWgZDw/Vx7vIdWCbFlcmV+yQhIJKgPWrf3DPSjgcfGMOZ126g4UmMjvTN9S01ZovzbjczGdbXsk4u48N1AwwPDoLHmgKwulC+v1olIco02iN8YavqZbMV712RC1oDkTBFLEb/RhSDY3NsV0tHteTQTKE7Zk8EZU833AB2WxQCIYBoZEv1jrmV4gPMMMDAsHuk9zXPk1haXcfU/NY+Ti1ILTEw2DUZbevAgcMmlucXIQPRLO6AAkqBkKYbNaBRrboIfI14jL/r7ymWG0ekS4myFNrC7PKFt65V/EDBNA2UKzVcvjqNT3/6w3jf6cOoNwKEHI433pz+iduzufstKwxKCP6/F+78G0J9GNQA0UCgwNyAhAxQeDIwbs8sRkKO9a6MNqXfMcIFAMukWNzYOsBgA1oj0cEnhseSePSRvbg4MYfrNxcghH8hEsG2VyIDiincurOaKJdr+CnGML1ZGWt4wtSEId1hT3EjnOnqCmFtZRlKSVDSFCnKGaJOFPWSBqMEtsVh8qa9VKqdoeoBxUqAekNgaDAx88Rjo7+y+o3p624gEwZlWFxaDa9SF64boL+/H8NG0+F+YbNwqlEnVvNrwZrLVoLt9WIB6XaOtpiBzZqXfOWNmV9lFgdjDBduZT85cWf9o5Qy2jT5pbrhI0SoAmMaK5vFyJWpNZhhG6sb/rgSGmACHbH49UJeNXxRgxAKnpcD5wy5QmXEdVlMaYFkIrQWdjrmAI5IVPHtvDhBCAVnCgacO8OD3TiwJ49svoLNjQBhJ/GyE9r0pS9MpaBnlrL27pEudKWT+P5Lk7+wsqGHzXAAqTj/5kuzf8mhKSEMWmvtiQwXSoCRENx6zVnLFI1AKKxtbuP2TAJBENDZ1dKepmO9wFC65wZHEopKGNRD1HGbXa2lWk+u3Oik4Ag5svrUU4fuXLk+j289+7pZktEY4w6YZvqRB/at7R/thh9IuEHTV9AwKLKZYu/CWu44IwYijnTH9/e8QKGQ3Wxgfm77fko4uOlhsD/9lhlK4ENPdCOVTNw4d/UVeC4nuVrlyNza+h6DcjDqoauj7XrEjsOkP14UzY/u7mt33nnpHCAcMaXeMS2MhI2KgPn+5bx3RCuOI8PJbxqE3Fpa2sDKahau66FcccPQFEoHiMUi1dOnT7hSalAKmIaLQrkAx6a4dOPux7Wy4OkGThwb+lZXZ8SrexJ9oQTSHeMwTYqJyfL7lAoASLTFzInNvIAXCBAFsOwmgGaOztxC4QQxAOab6EpEr21mJI4eHYUTcbCysgUlVcTzhdmsYrjo64kvjO7qQn6rgsX5zF4vUNAkQF9Xcv7Y4cMBYxzLa5t4/sybIDuO6xYnGO0bBjcIiNTglo1oKgwpa3j7DIoQgEiwu3fzRxm1oaWPI3tSN+4/sQsEDK/81VUszG/CMDWEVOhJhzG27zAGRgebuUaE4M+/denL69viAEAxPtb2ByePD/3G5Wsr7ytWaF/Rd62FxcKTRw8M3jEIAxXNhSG3rU+CUDDtozPddi1XU/CDGhgzIZXaCUTUsG0DlkFBtAuDUuS2s4cDKUGJga52Z4rLmq9BIYI6lpa3m55cWsO2NLpSxyBqBqhHsLoyP05BwSARsqwr12/lMTY6AmZYaHgeAuGj2ghCDARaSJw+Ob7V2x2F70t0dSfgNzyYBsH6xvZ+DQKtKPo7E+e5dgPvr+UpSaVgh+Nw0KzjvA2BBhcEy3dz4+AMUnoYHUzdObRnCEIq1N06lpZW4dgc0wuFpzIV1cmlj4GB0J3B0fQV4Xpojwszl68d0pSCa4nB3shkd9pEsr0dN69NYXVje2eQWcEyGfL5bpicgDGO1Y0GZhc2mo0cAIBmy+6lW7PjMJv/99jw8O0jh/dAg2B2fhkvvHIJ1VodL758FieO7wNnBL4v6LMvXPsNCRNESdT8AErLGCEKCn6zcYdq2LbTnFVUyrx5Yzps8B1rLWhwbmDfgf0wTbMZyU4ApWFkst5BzgiIVAg7zo1qXeB9j+7F0z91H2JRE4VCLfL8+XUbygAnTP/Cp55Y6elsA9c28lvukUArUHCk4s6UW84JDQq37mJ1IwdOGXwhsH93PzoSSSyvbuHS1cVPn7+x9nkNpY8fjj/31KPjv6+URrIzgTcvTOHu4gI8z12J2WSjGiDBBfDwwye2utNh+IFEd28bPK8G0yBY28we1GDQEtgz1Hmhq92Q1VoAGUg06hzPv3jzF9ezqouHOFzXR8MVDqCdZvhN0y3Fdhg4ZWCEI58rhtZW1pBKRXB7ZvGIZga0CDAyFJsZGEzD9RQYJaBEwbE5Xjhz62Dd04BBkGrHzWS7qNcrLuolv7tYbIwQwuBw4g+PRa7190bx6fYTWNssIR4jqDXchCcCLjWFaZLGYw8fqQx0x1AqFSPPvzH/v1vUgfZdVIVHUUNc76Q1NGezKCwnBCo1qGGEfu1XPxNOJROFUt6F9AUKDW+gkKvvIoTDMYjb38fvpNOAkhQ8FIXr+3AsA7dmN07Uan6IEIqOmDO/XdrYHBlJ4m9/5iesf/mn58NKU4RN6f/gtZv51y/OgDGG950+ANvmsMFwYXLjJ8slEpVcYbA3crG/PznT8FyUyl54bSvYQ5hCLGJXQha9ubGewar0UCqX7oZsrkseyKUbm/8oV9YjIATtodC2bfOb65nq/2/47X+3SGnpvvOLoKDKKzcneTRM2xo8P7H5m740ETGJPnWg8yu1UhUNN0CxWG3mkXhB0zW+WWLVSjANEBTyBfT3hZFMxpDZLPRN3Mx9hHKGuEHdxx7a//9yy4IJhampGQRBAEK0mdlu7CE7U/A9cfNiUK3C9wLsGkxjbLgbBBq5XKUzXxSjoASOTWQqaV4pVerNeQevhlu3MvDcoK1QricoMRGLGj6RevHuYgG96TZsbnqnQTi0DtDTGZ1QnOLS1Wk894NXUSxVwYlEoCSSUY6f+egBWDvRI5SbCEWj7zqC4s0BvK7tvD9KCEfEZvXudPxSpVTF8y9exKXLs2Ag0DxAvRGg630jGBnuQT7nIxzi+MYLFz/z2kT2c4Q42NVvT/3a5x/9p4JwPdIfu3LheqlPUwu3prNPffj94t/4boB8qQgpVPtWUe0FpQiZUN3tifO1imomcgoJxqI7QmOif6gXPORAKkAyirnV0ilCKLSUGOqP3Tp2bBcmJxdx+codbG4VYTAGXym0RRQOHxpFtK0LQSCtYkWOUUJhcKEPHRq42NWfhtYUvf2dCPwAddftrlRmhzXl4CRAZyo609OVRCAlnEi0+WVKgEzOHyeEgVEJ06STd1cL74pMf7sx5eDuITiW8U7y8M7mpFyud2zk3H2UETgm9Ts6IhfzdR+RkI26VIi1OaBE4vKN5b9DYMBVdRw/sPfroXDc2y6XsbXdGM7m3d1gBmImrXSmo9eqjRqe+95beOP1KQhOYegAQIDuZATfeTZ37yU7dvJxDA3sgZA7zdhNywiWryyMawJYTCEVtyfqNQ8XJiZx6doNCKkRDjmYm1vDtat38JGfPIznX5x96urs9kPadJCO26uPPbzrT5nmiiqmFSQhnOhyo9Z25vW1X24E3JaCkMWl9ZDJAQ0CJRUi0RBOP3AMpmlAKQXOKHKF6kA27+0jhCMUku6evtTNMDMhCUXdNdDwgWJR9QW+TGmYCJk8n+xIT7UnO+ArYPZu7gECBi0kRnclbpy8fwTXrs3jyvV5bOXKYIzACwSkqmHf/l6YBsOV6bWnz1zNvl8JH/sOpC7s2deJSg14881JPHT/IaSTbSjkK8lX3vxOp1YSBhWNB+7bfXWgPwUhJbKFOnwhwChFNh+MU8pAINHR7lyr1xswuQ3HCqFWq8fPXtn8NcptMOXrn/7A0B8l4qEtFYASUFDSzER77dzSz61tuXtACQqVmrW6toVCPsuKZX8voRwGFwiFzeub2yXU6x7a4mEk29KglGBhpfAUqAIkMNqXfINKoBpoLK7nByv1IKIIkGqz76Y62pcbLkVnZxtGR7vBOUH1Le9AwwsoYRbCjl47NNa22dfXhe88f/HTyxv5MYOFMNzZNvXQqb6/FEJSoGnlRgmR26Xa4Atn735eEwINGs7mWMIXWCXgCNkmMuXtI9W6DGvKkYzZc4ZJFwrFMiilMHUYIAyCEWxmg8PQHAoB+lKpSc91RN9gF3pTijEywbHjcy1BNBhFZquMxcV17N8/hFrVI2fOTn0e1AF0HYcO9v/HbMHXluWjHjSGylXVC1BEQ+ZK2IlklAAC30PYspdsi2dqSnddvbN9Sotmc1lfOrq0dyS5HezMO/5Pi9Q//OIf3fuZEqDuyrptxRBQA1enso8GgQdTMRzYHX7lg08ev6A1RaXmwYrEwBlFZrvUUBc3QJiDUslr295csKt1Ub99ZwlLgyl87mcfxddeuv7FfAUJDQ8fONX5zGBP9Ha1XIPbUOAqBssiKBQqA1ulWg9hDI5NaveP751JtjVdpAk3UazR5o5ry99TrXsdTFuIt7NlStl0dqsCSjS6UjYGesOYmc/ur3kqBA1Ew8bKyEDHct3zsLiyyDK52kFKDVhEYbAn9sprZy/ihZcuwvcDWAZvHnep5u65GeS243ytfSwubaDq0XshcwZnuLu2vbfq+VGlCdLt1kohX53/zvdew/JqFqZhgYJAMQ2DaxBQBL4L047i4sTs2L//8yu/T4gNToX/t57e98vd6bby7Zl1jA62P/fWjdxHLW7jzmz+gbur2XQ8Hsk2XIH19cJgoVLvAKWIRuxMImQsikYdzU4wglqlGT1w8r4RRKMhBIEApQRCSHNzWxxilINzX4/tTp75zpkJfO/Z10GoDcdqdiJqRcG5gu9vojM9gM1sfiRfqwwQmIiEnQqQW8hkSoiFI9gzOAzGNCanVvcUy7JDM472qJFJpsLzgQrg+QKimIdhGCj5fmxppXyYMgpoH0cOpKdGd/XA9999Zk0IsLy61hSHHypJGZxiY7MwUqm7KUgLHQknY5nedH9fFF3JNpy9VEJnRwpXp5Z/fW7NO02NMLo67OzHP7T/j6nvYmV5BcurxUHXJ6ZUAQb7EwsdbYmVr33tW5ieXkLYiYIwAr5zz5vF/OZL5/s+aoUldOxKwg+CHdGkqNUancVyY4SBIOFY1XBEn3v13DlcuzHbDPSjzVeOUIKzb5zFvr1d+IvvTPyGoga4H+DJk6P/4oNPHv5DGQBsJ9FMEIXVu8vOxbfWf77mSbsRSHzysx+J3X98GK4HUKLhegHeunITQjYbSzhjyOZKw76StpQMqVR4sb+3bYFSjkq9gZW1BRgGxcxcbk+tzoikEh0d9tbwULoQCtkwDe5kc+5+ShgsW6jde1NnvvfyBL777BsgLATbMpqbUEpRLOZx+coEAgFs5b1ENGzD9zWUhFsqejh/fgEvnrmIJ556GL2dKbx2fv4TG2XZzjTB2O7IeU9VZ27OlWFyDscMgWmNWt1vW1mr76OMgFKJzjS7rWnz+NmxKc68OvO5pWxjiMPCsX3xV371M4/8eq5YB1EGCBg4Z9jYWsOtqYXRpa1gD6UGCoWqM1MvgUjBKzXHobTZqWhZdoMbDpZXV3Ht1hQ+/IHHkS8GQxOzuYcMxmExzx3ojXxbwEA8ylEoB6c9QQEikeqwZ11J3IYbIBQNIRQJwbIYNrbrxwIFcAj0phMXTSqCUqUWev61xX/AaRzQDXzqJ3b/5skHDny3WvV2ngmKrmQYxXJ115k3Fz4nCCNCETp5ayEacmx0JBgSMRNTsyt7JRiUkhjoTc3E2juE6wpo3WyWYIzCMigyudphRZrzTQf2pa7cf98AvvLVFzE9s9QIJKtS5qTrDWV+4MHdyZHB5Nx3v3sRuc08yp1JXLwy9zMzi7n7BY9iKGHceuBozzcoFWiUBdbuVo7W3YBrTdHTaVx0fVdowuBE2hBpo4Xe3vnF3O1ql0c1OAGkdtGZNq9zg2upBH5MjfrRIlWtvhOaSAAoTQHGQDRDtaEBMDDi4qGjY7+fzWdVw/Nhmhb27O4A5wSJBFkwDK8ifDuaybu9UuuPdKTsZ+i0gu97eOYvX//sK2/c/RUwBymbbPzizz3y2+F4HLYAAtWAGQkQCjFMzW2eKNZViDCGtpg5V/TpZmGzDqU12uMBLJNAaoob02tH64GCYj46U213O9ojjYYnELYdREO9sC2OazeL456QYEwgGo7cXlkrNkw7hFqdd28WK30GDETDJhaXN5Pnzl08xBgD5/ydE34NojWEYZgzpmkJpZquCbGQC/B33AYcmyOznTlWFxoGEwAzCpcn7xxaWl6DZe4co76d3ApQpVXB4GR5u+pa/+G/XPoPxQbvgBT4xId7/u/HHz7wZjZXRqHuIdkZvWQbXGpNWKFab19er5w6nuz+diISxs1y5lQjACMgSLeFFpRplMo7mUVKKMhSFR2dUcwsr95rT2aMoFSu9W2Vqv2EmoiEbe+lFy8lVhZXD5kG3zEN/aFmY01kMZ+bppAik60fr9aVSRhBKmZP93ekNgnhyBUr+P6Z8zANjrVMdZdiJpTSaIvZcxpurlqTSHUm0T/UA0Y15uczI+V6o1NSho5IaLOnK3FNQ4L9tadSBAqm4YAS8q4H3LYYtvLrR+uuBNMKqfb25dOnD8PghlOtNSCFaHvupSufOXNx7XepEYJQVfytnzr1m6Mj6Y1yrYHHHx/En3w9c7oR+GCcQ2ix/f/8xXMHFxaXSdixd+6RfntYikipi0LoZaUUCGG4PbOAfcf3I9zmQCkN0ySYy1T2Fit+lFILkahdvzF9Z3hy8nanbe18cf+Q3Z7BSeb2nZXd16a3H+ZGBMmEu/bYk/v+wjAsVEoVcDQzyDy3CoNyG6YpFPVAqEKhrtPreQLPb9ZnRaBg2Ba4amZemSZDfjF33Peaz2Z7jE83PCE830UyFcWhWBqWRTE9s3VcCg7JJbrayY2uhBKL61ksr233F8tuL6UM4bDV+P73LnQsL66869l4Ow1NayLCtjV9/Nj9crtyfWtqeRW2YeHchfmfHugw/rBeU4WQbSAcMvHcixef+tNvXvwd8AQM38XPfuzB3/vA42PwfAVfALlcDaZJMDu7MVqpN9KCUPS0hTd3DaWmbIujLdYBt+5FXj639HeZQcF8H48/cuLLQjU9HbXUoOBouAU06g1EEzE3QA1WM4Lb7OlsQ8jhMnOnEqCuICTF7anpD+8bDH/Pc+uIhi2cv3g9MXln+4/qvm5TQuHIWOTrlNPpzVwW6Y4QimX3qCIMGgEG+iKXUkkOP6CYmd/Eq2fvwLE5Jm9nd5mcg0KBWva8skK4em32ZxeXq7vh2BhOhifSnc7zd5c34DgRGJyi3vDxxtkJlMsVAsAnxLSUDrC2vm5FQgaeeuwB9HRF8NKbtx+UmkJrgr5O+2pnB4HrEgTCwsZGHYQAIgii8ytbR4hhwVAa4TAmZxfXceTILhw+NOz95+9ez+YW3F1UaPL6+TufrlR7z8/OruDY8b24cOXmg8/84NYfaB0Hk1X84qce/uLxA0P1mcVtuI0AqxuVQwIaoBoD3Ymr0D4oGLjS4BKIOfS2JOQUJ3on+dtEf0/0rUbDhfsj0on/W/xIkRro7XnnTSIEvq/czKIC1xKgCo0gwL6hyORDD42/CBBECUEuX8Hla0tgjMI02PJof/qFK7cqn+Ahg371mRtf2zsceUT7emPmyubJpYz/4UDYiJmu//NPH/hCT2fyrgiaE9VXL1+F1s3OrNXljX1cM0glMdgdvW6gGLh+M6+nUTfRaDSLw3Orq/dxWBBSYSDtvNUeZQgcgsW7ZVxe2UTINrC4XBo0iAkqFXpTqamGiqMn7SA7XRrP11Xc5hRlT+F7b6w8w3gviCbQ9/pHGFypiE3VtCThcVea4u0I91iiHRHS7CDTaO7yitvTxwzfgRFiWF6vn1hd9a8a5hCqAYMm4u2haARBQCuk43c3CvRLf/7MG1+8fqfwMKccB3dH3vqlLzz+zyNtNhY2csjltmBxeqO7jd1czgVHhKKYmFz50ME9qW8zppGvNo4oSBAdYKiv/XK6y9Sut+NiAEApgU7e1XRz38E0CTZX1w67ZWIZNkXdDazJOfk9RnuhBYN6u7ipAV9IEm437+w9cup4sishtt9cGleSAMxFZyr6Vq0WKC9wEQuHwbspbItibr7QB6EB6WNkV//cg6cOwvUl1jcamLi8CccxcGd665DyOGPURFvMuJvNuAUh350qLaXCcH8SXekopHz3HixkM2xm5clAmzAtirnN2vjf/61n7yjdtHEqVd1oJi/atDbhGAL373e+dOxo/59ktn1cu5lByDEwO984ZWobnBmYWag8Niv8a6Y5AL2zUxYahCqtPb9OTj2y74v33bfr97ydawsNbG01kMnWQQCYJse1WxsnA61hcYr1vJ/KbImzjI+R6r13s6l5QUMSJ7Hr5e+/ukQFNxgRJTzx8L5/H4uGt103gGVxKF8jFqKg0QiUDPnMCASTBBwG5he3YkEABDsx3uEQkEzoe5ZIpqGRzVce1CDQ0sfugYGJRFsY9YYEN21EnRhsi6PamN4DrWExAumxN7/x7Vs4cnQMpTI7VnGFwU2CiitD12bVDxjrBwSBou+cufqBJHHTnjxw5NhJ07BlXzL+XSVXf84wOBY3xfiffXvm7K6e8Ldl4Ne++p/eun96qf6Tnh+jTJbxwceH/9mDJ8d+UCkBSlG8dWkRjYaAbXFMTWeOqIARCoKueHjGlJ0Fk1HYYeC5M9d/cSnb2AWDYU9/+HxvZ/sLy3dzACUwOINpEdi2hb6eAVy+ma1BrgOBj4HBoc5f+bUn4Zarovj1s6/On1vbH3NCuHAj+OVqbbI7EiWXar6XWF8v/2Sm5O/1wbCn01j4Pz7/2Jdi0TA2iw0IGfBsrrLX1AwaAmP9ySsmmhu/0YEodvVHQLRiPzg7OyQoBQsUjh/qvNndGeX/7A9m/yFMDuV7eOqR/X8YTdjC9wUsm8BzFX7wygQuXZkG5zwwmeU3pLA8L8CHHjsaOXV8ECurLuZu+052TR4yKIFiPrp64xcKFR++kNBCwrA0DIMhk3EHqnXZzZRAKsa2Uu3pGw3XxOhQOxJRRy/fLX79yszkA06Y4zsvL//6rduZrqhFr790bm7X/Lr7yWI9GtbSwyefHPonDz18+Ls1RVGu1cBYgEy2cowrC8TwMNTTMdXfnYZSBJVyFRQUvem2Ba1KMCVDAMA0pB4cTE8SboJbDD8uP1KkurqS935uTh17wp9ZhScsgBCIho8PPnrqDzpTsaBex44RYQSd6a6mA4BB0JVq++K//MqL44sZOVLwzNibk+Vf5RSQggIw0dXmzn324/f9/Y999P7nK9VmOXx6ZgOKhpvzM5ySxc2Zh2uyBt2g2DM8eOPIwVE0XKBaDbC2UgejgBKEr68HpyrCRYgCnk8vPf/qApTSyGwUUKu6MAyK9Y1qhy8IhKiAGm44EXOxvLiE2emtk16dAKYHTTWItpi+t6DszLVoinog0DaWnC43iOcWmwsppQS11TV4XnMIrlmb0sb0XOFUAy5EADBJGWCjoTQUUWh6ZTFIMJA6wUMP7j93dXr1g//lhenf1tSA7fi1j394/G+7vu0trbpgCGGsfxiRkCGujWSv3ry7csSgFDcXtp7O18U/MCMRd22tetp3m92GfW0dV3SDQe8spGqnphOOh3Z2vzsLvMPxyuuVh4sNFxE0m6E0sVkzM0mD7gwda2h4HkFne+JmzLTcqVvrZOLK/EOBUkBdoTsdn5PagJBAW0cSw/EIbJvjzYntwVI9A6o1hC+ctrYwpCDIbRVRLS2ASAszC3cfK3k+lA7Qn+6cOXq4D3/daYISjczWFibvrN5zmAd2jJqYprNLyw/Al/CJQtV3Q7ksH9B0J/6BmYg7RHSncPFDD4/8XhD43/Y8gfmFFczO3QUl1J65u33Q1QrU98EUo4AN12veK6IZqOYQCEC0g2Q0OkECgImm0BBNwLRx76o6hKO87Z0KagBRHhTRRBPKiXi7jR0A2bkLmmA55z8xMbWBwDfRE7WqT3/gvq92hMKQlkLDE/BEA+EQ39kZC0/6mlQ9HyZRWFpZ7yhXCpCquVsNWxrJmILSZCdOShlrq9VxVxrgWmCot+s8fAamKPLbZQRSwLE48sVCW00EgKehDB7fc2AI/UMJvHx+7pFyLUBMGNAERIExJZo9qfSeuwaB6wLJePtNLmkgicKTHzzwzbnVjWden8h/SnMLa1vYv75V3S8BSFEBIRrJOLLvf3DoXxzc1/PlIAAMA5idXURxewGMUgjFMbsw/1jZ8yE1RXfKmm6LKRDHwtZ2LfWtl27+dqAUSCPAE08c+kqyKywbDR8ggMUthGwLhDgIhwxYpslqrgvBGVayxV2vnL2Cof40Pvb04X8+v7b98NzdxiFtOmRivvFRk+iPSsEgqQDlCkNx/eqv/OyJv3P0yODazEIJV6/eQaVcH11YrhytSxtxQ6AekOkbC2VoJRHhDRCiAaVDbk0OyAagRB1+3Q/+8zfOferm7fw+ahgYTvP508d3PRNvD0EphUrFx9UbG9DEwEMPHgMA98zZWaNWkZC+gtS6x7BtLC7NY211u385kxtuBBRJA7q9PXmn6lqQSqNeyoBoH1oyZDK5E8WyzyTVGLCM1ezWxpYXKAQ9bUA6gdMne/94Ymbp/Rdu1p4WsHB9SXyCcvUJ1wtggCMe1qUPPdL3T0+fHPtXQii8dWEK29sVUKKTCxvF01Wh0e0I17TFjeXNDCzLRsOVoB5gWrhJpIuyb0NJglRM1YrVxuLUXGanAxX40AO9/y1tusePFKlHTw3/0CIBeL6YjyTs39LCgiSKWCZxT4wPPLO1XYPe+aJwbAMdcRtvd8GePDYw96mf3vPoK6/Nfr5UJk+ulkSfZZkiFTZv7RqM/dW+kcSfDw2mtj2veT7vuR5mr99Eo+41FyOt6bHdfd88snfXy5p4pCPOnz331gI0CLxGFaXcOkAoCLRxejz5b08c7QuZkHKov/e8YdpQUuPE4W6EQhqUUizc3f7j2cX6NUZtFTXzd1X+FslvVXRnInzu8x/f91uEuFpDgSgT5N5L+PZhnySe8uj+4Z7XbSsCzuS9lXKs14NlNifSKSVwGz7LPNj3r08rHgYTBBpgkunm3ILYEQoKSTRxYMrBuLx0aWXzA598evfvWIrJ0cH4lRP7+281tsoAASqFbQQyQFlSHD+Y+v1YzFk0qKUI89X0jSuGRlg8ON79pyeOmI4mkowfSL5iMB/MfnsKh0CIKiq57LvusccpRvqsNz738UNFg8mdR4eBKmgC1UwMbi6qRASSHN3X9WJvVxQDXNMnTg/92dHD6rsaipw43P39np3hVscEIOsQPsHJI6k/oU5w14ClklGxtXh7khuGIWr5IkwVQDckju1Nvzg80LeghcLIYOj5THbzb6TWEgLsHu2GbQ9A/1DXxE4EBbu76v67k+OIM00hiQQl0JII4lgRXStUN00urvUNtV3tTLbpW3eWUa/VEOIlPDQeghTa0mrXl92AW5pKAujmvdIUoAEUASGKQBHAYDQ4urvrimUa0E7zmSqWiphangLbEU8CjX27Is8ODu+/RIjYORFjIIoC9N3iS3aynod6xohUHAPp6FRAwptLaw2AECglMDt3Gb7v7QRuSvGBB3v+8cPS7CJKkXSCvuLYzRqZlBrJhINdfYl7prwiECwa2/hyVbBYyECQTFlXCo0qtAL6uuKwDA7GKT70yNi/Guktv0iooYc79fyJPWGyuL6q9w05L3/hY/vWDUqVJDslfE000YAm6t7tCYQg9+3tej4ZoQh1WugYaPc/+hPjP9/VMffc/Hrx6dWN2sGa69rxeFslzNxbB/b3XOhLWd8Y2JVeKRWbXp5SaOQ2VmDqBhgo4AMnD6a/PzLcP621xNhg+DtL2VUwWUa16sWfuH/0D7nmgptB7cT4wDcci8A0mpsq22AgUDu1Q4Xx/alnvvD0/qzBDJ2IqI1kyAfTNfQPjK78/EcOvf/qjeVfWlyvPprNkRHXV0Z7l11KROXEvt70D8LM/2Y47MhqVSNwC3j0VA9KpUZDMvKlAJrELZUf7BQLmpRhcAO7R8bAOYNWqvaJLfc3t3L1TkV60ZUy67UqMz/90/u+RDXI4f3JCz3d7Q3XE2CMIB4WeGg8CX5f5853ti6mY/hH+XKQADQ6QurNQjaD3UMUXW2RwMfB3/I1aMIRuSgrbhC/Ak4IFlcWUCqWm4bVxF787McO/Y7UQg90OJMjA0kIqWAaHEpJgNDGL3z4xCeH01O/dGe58lNrGTIaQNL9/W3LbWH96onx/meGBrpuS6Xguj6q23nohgdFoT76/rHfdSXjqRjJ9HaGskIoxGIWOrsGAQBjwwNvSoH/U4IzqSXpiMrV3iTd1pDvcuj/74XoH7fVokWLFi1atPhfxI9notSiRYsWLVr8L6QlUi1atGjR4j1LS6RatGjRosV7lpZItWjRokWL9ywtkWrRokWLFu9ZWiLVokWLFi3es7REqkWLFi1avGdpiVSLFi1atHjP0hKpFi1atGjxnqUlUi1atGjR4j1LS6RatGjRosV7lpZItWjRokWL9ywtkWrRokWLFu9ZWiLVokWLFi3es/xXAazIDwGjesQAAAAASUVORK5CYII=",
              width: 80,
              height: 50,
            },
          ],
        },
        " ",
        " ",
        {
          style: "table",
          table: {
            widths: [180, 180, 200, 200],
            heights: [5, 5, 5, 5],
            body: [
              [
                {
                  border: [false, false, false, false],
                  text: [
                    { bold: false, text: "" },
                    "Vendor :  " + orderData.partner.name + "\n",
                    orderData &&
                    ["NEW", "VALIDATED", "CONFIRMED"].includes(orderData.status)
                      ? orderData.expectedDeliveryDate &&
                        "Expected Delivery Date:   " +
                          moment
                            .utc(orderData.expectedDeliveryDate)
                            .format("DD/MM/YYYY") +
                          "    \n"
                      : " ",
                    orderData &&
                    ["NEW", "VALIDATED", "CONFIRMED"].includes(orderData.status)
                      ? orderData.expectedDeliveryTime &&
                        "Expected Delivery Time:    " +
                          moment
                            .utc(orderData.expectedDeliveryTime)
                            .format("HH:mm:ss")
                      : " ",
                  ],
                },
                {
                  border: [false, false, false, false],
                  text: " ",
                },
                {
                  border: [false, false, false, false],
                  text: [
                    { bold: false, text: "" },
                    "PO no:      " + orderData.number + "  \n",
                    "Date:         " +
                      moment.utc(orderData.createdOn).format("DD/MM/YYYY") +
                      "    \n\n",
                    orderData.deliveryDate &&
                      t("DELIVERY_DATE") +
                        ":   " +
                        moment
                          .utc(orderData.deliveryDate)
                          .format("DD/MM/YYYY") +
                        "    \n",
                    orderData.deliveryTime &&
                      t("DELIVERY_TIME") +
                        ":    " +
                        moment.utc(orderData.deliveryTime).format("HH:mm:ss"),
                  ],
                },
              ],
            ],
          },
        },

        {
          columns: [
            {
              text: "I would like to place an order for the following products :",
              width: "*",
              fontSize: 10,
            },
          ],
        },
        " ",
        {
          columns: [
            {
              text: "ORDER DETAIL",
              width: "*",
              fontSize: 20,
              alignment: "center",
              bold: true,
            },
          ],
        },
        {
          style: "table",
          table: {
            widths:
              orderData.status === "STOCKED" || orderData.status === "PUBLISHED"
                ? ["*", 50, 50, 50, 50, 50]
                : orderData.status === "GRN_RECEIVED" ||
                  orderData.status === "COMPLETED"
                ? ["*", 50, 50, 50, 50, 50, 50]
                : ["*", 70, 70],
            body:
              orderData.status === "GRN_RECEIVED" ||
              orderData.status === "COMPLETED"
                ? grnItemsTable
                : productsTable,
          },
        },
        " ",

        // {
        //   style: "table",
        //   table: {
        //     widths: ["*"],
        //     heights: [20],
        //     body: [
        //       [
        //         {
        //           border: [false, false, false, false],
        //           text: [
        //             { bold: false, text: "" },
        //             orderData.deliveryDate &&
        //             t("DELIVERY_DATE") +
        //             ":   " +
        //             moment
        //               .utc(orderData.deliveryDate)
        //               .format("DD/MM/YYYY") +
        //             "    \n",
        //             orderData.deliveryTime &&
        //             t("DELIVERY_TIME") +
        //             ":    " +
        //             moment.utc(orderData.deliveryTime).format("HH:mm:ss"),
        //           ],
        //         },
        //       ],
        //     ],
        //   },
        // },
        //=======
        //        {
        //          style: "table",
        //          table: {
        //            widths: ["*"],
        //            heights: [20],
        //            body: [
        //              [
        //                {
        //                  border: [false, false, false, false],
        //                  text: [
        //                    { bold: false, text: "" },
        //                    orderData.deliveryDate &&
        //                      t("DELIVERY_DATE") +
        //                        ":   " +
        //                        moment
        //                          .utc(orderData.deliveryDate)
        //                          .format("DD/MM/YYYY") +
        //                        "    \n",
        //                    orderData.deliveryTime &&
        //                      t("DELIVERY_TIME") +
        //                        ":    " +
        //                        moment.utc(orderData.deliveryTime).format("HH:mm:ss"),
        //                  ],
        //                },
        //              ],
        //            ],
        //          },
        //        },
        //>>>>>>> develop-ui
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        rightheader: {
          alignment: "right",
          fontSize: 10,
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        table: {
          margin: [0, 5, 0, 5, 0],
          fontSize: "10",
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
        },
        separator: {
          background: "#F9FAFB",
        },
      },
      defaultStyle: {},
    };
    setSubmitting(false);
    pdfMake
      .createPdf(docDefinition)
      .download(`${orderData.number}-${orderData.partner.name}.pdf`);
  };

  const generatePurchaseOrder = () => {
    const productsTable = [];
    productsTable.push([
      { text: t("SN"), style: "tableHeader" },
      { text: t("PRODUCT"), style: "tableHeader" },
      { text: t("PALLET"), style: "tableHeader", alignment: "center" },
      { text: t("QTY"), style: "tableHeader", alignment: "center" },
    ]);

    let totalPallets = 0;
    data !== null &&
      data.products.forEach((prod, index) => {
        productsTable.push([
          { text: index + 1, fontSize: 11 },
          {
            text: prod.otherName ? prod.otherName.name : prod.name,
            fontSize: 9,
          },
          {
            text: prod.numberOfUnits == null ? "" : prod.numberOfUnits,
            alignment: "center",
          },
          {
            text: prod.quantity == null ? "" : prod.quantity,
            alignment: "center",
          },
        ]);
        totalPallets += prod.quantity;
      });
    let vendorAddress =
      orderData.partner &&
      orderData.partner.addressDto &&
      orderData.partner.addressDto.street;
    let docDefinition = {
      footer: {
        columns: [
          {
            text: "SARL SD FOODS \n ADDRESS: 4 CHEMIN DES ECRICROLLES \n 95410, GROSLAY",
            width: "*",
            fontSize: 11,
            alignment: "center",
            bold: true,
          },
        ],
      },

      content: [
        {
          columns: [
            {
              image:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAakAAAC4CAYAAABZ0RPRAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAGe2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDYwLCAyMDIwLzA1LzEyLTE2OjA0OjE3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjEtMTEtMjVUMjA6MDM6NTErMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIxLTExLTI1VDIwOjA1OjM3KzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIxLTExLTI1VDIwOjA1OjM3KzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjgwZmYyNDAyLTg0YzktNGUxYS1hOTcwLTg1YzExZjIwN2M5NCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjRlYmQ5OGMyLWFmNTYtNGQ0OC04YjY2LTYxYjBhOTIyOGNlNiIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmYwMGJjN2QzLTI4ZTItNDMyOS1iMmUzLTQwMDY5OGY3YjJjNSI+IDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDxyZGY6QmFnPiA8cmRmOmxpPkJBNjUwREFBRDlFOTM5NkQyMjJEQUJBQThGQjVBNThCPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZjAwYmM3ZDMtMjhlMi00MzI5LWIyZTMtNDAwNjk4ZjdiMmM1IiBzdEV2dDp3aGVuPSIyMDIxLTExLTI1VDIwOjAzOjUxKzAxOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoTWFjaW50b3NoKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ODBmZjI0MDItODRjOS00ZTFhLWE5NzAtODVjMTFmMjA3Yzk0IiBzdEV2dDp3aGVuPSIyMDIxLTExLTI1VDIwOjA1OjM3KzAxOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4uX3IMAAEaOElEQVR4nOydd3wdxfX2vzOzu7epuRe594qNG2DTQ+8hQCgpBEIaaaT3HpIQ0kgCCb8QEkhCQu+9FxuDwb33XiTZqrdsmXn/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",
              width: 70,
              height: 50,
            },
          ],
        },
        " ",
        {
          columns: [
            { text: "To", width: 350, fontSize: 13 },
            { text: "Purchase Order", width: 200, fontSize: 13 },
          ],
        },

        {
          style: "table",
          table: {
            widths: [200, 130, 210],
            heights: [100, 100, 100],
            body: [
              [
                {
                  border: [true, true, true, true],
                  text: [
                    { text: "Name and Address\n", bold: true },
                    data && { text: data.partner.name + "\n" },
                    { text: vendorAddress },
                  ],
                },

                {
                  border: [false, false, false, false],
                  text: " ",
                },
                {
                  border: [false, false, false, false],
                  text: [
                    { bold: false, text: "" },
                    "PO no:      " + data.number + "  \n\n",
                    "Date:         " +
                      moment.utc(data.createdOn).format("DD/MM/YYYY") +
                      "    \n\n",
                    "Ref:            _____________\n\n",
                  ],
                },
              ],
            ],
          },
        },
        " ",
        {
          style: "table",
          table: {
            widths: [50, "*", 70, 70],
            body: productsTable,
          },
        },

        " ",
        {
          columns: [
            { text: "", width: 410, fontSize: 10 },
            {
              text: "Total ----- " + totalPallets + " PALLETS",
              width: 200,
              fontSize: 10,
            },
          ],
        },
        " ",
        " ",
        {
          style: "table",
          table: {
            widths: [60, 220, 40, 60],
            heights: [18, 18, 18],
            body: [
              [
                {
                  border: [false, false, false, false],
                  text: [{ text: "" }],
                },
                {
                  border: [false, false, false, false],
                  text: [{ text: "Signature: _________________" }],
                },
                {
                  border: [false, false, false, false],
                  text: [{ text: "Weight " }],
                },
                {
                  border: [true, true, true, true],
                  text: [{ bold: false, text: "" }],
                },
              ],
              [
                {
                  border: [false, false, false, false],
                  text: [{ text: "" }],
                },
                {
                  border: [false, false, false, false],
                  text: [
                    { text: "Name:       " },
                    data.employee && { text: data.employee.fullname },
                  ],
                },
                {
                  border: [false, false, false, false],
                  text: [{ text: "Units " }],
                },
                {
                  border: [true, true, true, true],
                  text: [{ bold: false, text: "" }],
                },
              ],
              [
                {
                  border: [false, false, false, false],
                  text: [{ text: "" }],
                },
                {
                  border: [false, false, false, false],
                  text: [
                    {
                      text:
                        "Date:         " +
                        moment.utc(data.createdOn).format("DD/MM/YYYY"),
                    },
                  ],
                },
                {
                  border: [false, false, false, false],
                  text: [{ text: " " }],
                },
                {
                  border: [true, true, true, true],
                  text: [{ bold: false, text: "" }],
                },
              ],
            ],
          },
        },
        " ",
        " ",
        " ",

        " ",
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        rightheader: {
          alignment: "right",
          fontSize: 10,
          // margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        table: {
          margin: [0, 5, 0, 5],
          fontSize: "10",
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          // color: 'black'
        },
      },
      defaultStyle: {
        // alignment: 'justify'
      },
    };
    pdfMake
      .createPdf(docDefinition)
      .download(`${data.number}-${data.partner.name}`);
  };

  const statusObj = {
    NEW: "VALIDATED",
    VALIDATED: "CONFIRMED",
    CONFIRMED: "RECEIVED",
    RECEIVED: "PUBLISH",
    GRN_RECEIVED: "PUBLISH",
    STOCKED: "OLDSTOCK",
    // GRN_RECEIVED: "GRN_RECEIVED"
  };
  const { status } = data;

  const onChange = (value, productKey, locationKey) => {
    form.setFieldValue(
      ["products", productKey, "productLocation", locationKey, "locationId"],
      value.id
    );
    console.log('ON--Change', value, productKey, locationKey)
  };

  const col = window.screen.width > 991 ? 5 : window.screen.width > 768 ? 2 : 1;

  return (
    <>
      <Row>
        {/* <Col>
          <Typography.Paragraph>{t("SALE_ORDERS_MSG")}</Typography.Paragraph>
        </Col> */}
        <Col style={{ marginLeft: "auto" }}>
          {status !== "PUBLISHED" && status !== "STOCKED" && (
            <Button
              disabled={isSubmitting}
              onClick={() => handleAction(orderData, "edit")}
            >
              {t("Edit")}
            </Button>
          )}
          <Button
            style={{ marginLeft: 10 }}
            type="primary"
            disabled={isSubmitting}
            onClick={generateInvoice}
          >
            {t("PDF")}
          </Button>
        </Col>
      </Row>
      <CBreadcrumbRouter
        noborder
        backgroundColor={colorBgContainer}
        routes={routes}
      />

      <br />
      <Descriptions
        size="small"
        title="Details"
        layout="vertical"
        colon={false}
        column={col}
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
        <Descriptions.Item span={1} label={t("ORDER_NUMBER")}>
          {data.number}
        </Descriptions.Item>
        <Descriptions.Item span={1} label={t("STATUS")}>
          {<Tag color="warning">{status}</Tag>}
        </Descriptions.Item>
        {/* <Descriptions.Item span={1} label={t("EXPECTED_DELIVERY")}>
          {moment.utc(data.expectedDeliveryDate).format("DD/MM/YYYY")}{" "}
          {moment.utc(data.expectedDeliveryTime).format("HH:mm")}
        </Descriptions.Item> */}
        <Descriptions.Item span={2} label={t("VENDOR")}>
          {data?.partner?.name}
        </Descriptions.Item>
        {["RECEIVED", "STOCKED", "CONFIRMED"].includes(status) ? (
          <>
            <Descriptions.Item span={1} label={t("LOGISTICS")}>
              {t(data.logisticsType)}
            </Descriptions.Item>
            {data.transporterName ? (
              <Descriptions.Item span={1} label={t("TRANSPORTER_NAME")}>
                {t(data.transporterName)}
              </Descriptions.Item>
            ) : null}
          </>
        ) : null}
        {["RECEIVED", "STOCKED"].includes(status) ? (
          <>
            <Descriptions.Item span={1} label={t("STOCK_ROTATED")}>
              {data.stockRotated ? t("YES") : t("NO")}
            </Descriptions.Item>
            {!data.stockRotated ? (
              <Descriptions.Item span={1} label={t("REASON")}>
                {data.reason}
              </Descriptions.Item>
            ) : null}
          </>
        ) : null}
      </Descriptions>
      {![""].includes(status) ? (
        <>
          {productItems && (
            <Collapse
              accordion
              items={productItems}
              style={{ marginTop: "10px" }}
            />
          )}
        </>
      ) : null}
      {status === "CONFIRMED" ? (
        <>
          <Typography.Title
            level={5}
            style={{
              display: "flex",
              alignItems: "center",
              marginBlock: 20,
            }}
          >
            {t("PURCHASE_ORDER")}
            {data.purchaseOrderMedia ? (
              <Button
                href={data.purchaseOrderMedia.path}
                target={"_blank"}
                rel={"noreferrer"}
                style={{ marginLeft: "auto" }}
              >
                {t("PURCHASE_ORDER")}
              </Button>
            ) : null}
            <br />
          </Typography.Title>
        </>
      ) : null}
      <Form
        form={form}
        initialValues={{
          // isVirtual: isVirtualGRN,
          deliveryDate: orderData?.deliveryDate
            ? dayjs(moment(orderData.deliveryDate).format()).utc()
            : null,
          deliveryTime: orderData?.deliveryTime
            ? dayjs(moment(orderData.deliveryTime).format()).utc()
            : null,
          products: !["GRN_RECEIVED", "RECEIVED", "COMPLETED"].includes(
            orderData.status
          )
            ? orderData.products.map((p) => ({
                ...p,
                productLocation: p.productLocation?.length
                  ? p.productLocation.map((loc) => ({
                      ...loc,
                      expiry: dayjs(
                        moment.utc(loc.expiry).local().format("YYYY-MM-DD")
                      ),
                    }))
                  : [{ receivedPallets: "" }],
                photos: p.photos.map((loc) => ({
                  ...loc,
                  uid: "-" + loc.id,
                  name: loc.name || loc.id,
                  url: loc.path,
                  status: "done",
                })),
              }))
            : null,
          stockRotated: orderData.stockRotated,
        }}
        name="undertakenForm"
        onFinish={(values) => handleSubmit(values, statusObj[status])}
        style={{ marginTop: 30 }}
        layout="vertical"
      >
        {(values) => (
          <>
            {status === "VALIDATED" && (
              <>
                <Typography.Title level={4}>
                  {t("UPLOAD_DOCUMENTS")}
                </Typography.Title>
                {/* <div style={{ display: "none" }}>
                  <MyTextField name={"status"} type="hidden" />
                  <MyTextField name={"action"} type="hidden" />
                </div> */}
                <Form.Item
                  label={
                    <>
                      {t("PURCHASE_ORDER")}
                      <Button type="link" onClick={generatePurchaseOrder}>
                        ( {t("VIEW_ORDER_FORM")} )
                      </Button>
                    </>
                  }
                  name="purchaseOrderMedia"
                >
                  <Upload
                    className="image-upload-grid"
                    maxCount={5}
                    prefix={data?.id || ""}
                    setFileList={setFileList}
                    fileList={fileList}
                    files={files}
                    multiple
                  >
                    <div>
                      Drag &amp; drop or <u className="text-primary">browse</u>
                    </div>
                  </Upload>
                </Form.Item>
                <Row gutter={20}>
                  <Col xs={24} sm={12} md={8}>
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
                  <Col xs={24} sm={12} md={8}>
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
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="logisticsType" label={t("LOGISTICS")}>
                      <Select>
                        {[
                          { label: t("IN_HOUSE"), value: "IN_HOUSE" },
                          { label: t("BY_SUPPLIER"), value: "BY_SUPPLIER" },
                          { label: t("OUTSOURCE"), value: "OUTSOURCE" },
                        ].map((option) => (
                          <Select.Option
                            value={option.value}
                            key={option.value}
                          >
                            {option.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                {values.logisticsType &&
                  values.logisticsType === "OUTSOURCE" && (
                    <Form.Item
                      name="transporterName"
                      label={t("TRANSPORT_COMPANY_NAME")}
                      rules={[{ required: true }]}
                    >
                      <Input placeholder={t("Transport Company Name")} />
                    </Form.Item>
                  )}
                <Comments orderData={data} />

                <Button type="primary" htmlType="submit" loading={loading}>
                  {t("Submit")}
                </Button>
                <Button 
                  loading={loading} type="primary" style={{marginLeft:5}} 
                  onClick={()=>
                    handleSubmit(form.getFieldsValue(), "CANCELLED","CANCELLED_BY_VENDOR")}
                  >
                  {t("Cancelled By Vendor")}
                </Button>
              </>
            )}

            {[
              "Directeur général",
              "Directeur Administratif",
              "Floor manager",
            ].includes(user?.jobName) &&
            emps &&
            status === "NEW" ? (
              <>
                <Form.Item
                  name="undertaken"
                  rules={[
                    {
                      required: true,
                      message: t("UNDERTAKEN_REQ"),
                    },
                  ]}
                  valuePropName="checked"
                >
                  <Checkbox>
                    {user &&
                      "I, the undersigned " +
                        user?.fullname +
                        ", have taken the order into account and I validate it so that the order is placed to the supplier."}
                  </Checkbox>
                </Form.Item>
                <Comments orderData={data}></Comments>
                <Button
                  style={{ marginRight: "5px" }}
                  type="primary"
                  htmlType="button"
                  onClick={() =>
                    handleSubmit(form.getFieldsValue(), "CANCELLED")
                  }
                >
                  {t("REFUSE")}
                </Button>
                <Button loading={loading} type="primary" htmlType="submit">
                  {t("VALIDATE")}
                </Button>
                <Button 
                  loading={loading} type="primary" style={{marginLeft:5}} 
                  onClick={()=>
                    handleSubmit(form.getFieldsValue(), "CANCELLED","CANCELLED_BY_VENDOR")}
                  >
                  {t("Cancelled By Vendor")}
                </Button>
              </>
            ) : null}

            {status === "CONFIRMED" && (
              <>
                <Row gutter={20}>
                  <Col xs={24} sm={12} md={8}>
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
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name="deliveryTime"
                      label={t("DELIVERY_TIME")}
                      rules={[{ required: true }]}
                    >
                      <TimePicker
                        use12Hours
                        showSecond={false}
                        format={"hh:mm A"}
                        style={{ width: "100%" }}
                        defaultValue={null}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      label={t("HAVE_YOU_ROTATED_THE_STOCK")}
                      name="stockRotated"
                    >
                      <Radio.Group>
                        <Radio value={true}> {t("YES")} </Radio>
                        <Radio value={false}> {t("No")} </Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    {values.stockRotated === false ? (
                      <Form.Item
                        label={t("REASON")}
                        name="reason"
                        rules={[{ required: true }]}
                      >
                        <Input.TextArea rows={2} placeholder={t("REASON")} />
                      </Form.Item>
                    ) : null}
                  </Col>
                </Row>
                <Comments orderData={data} />
                <Button loading={loading} type="primary" htmlType="submit">
                  {t("RECEIVED")}
                </Button>
                <Button 
                  loading={loading} type="primary" style={{marginLeft:5}} 
                  onClick={()=>
                    handleSubmit(form.getFieldsValue(), "CANCELLED","CANCELLED_BY_VENDOR")}
                  >
                  {t("Cancelled By Vendor")}
                </Button>
              </>
            )}
            {["STOCKED"].includes(status) && (
              <>
                <Form.List name="products">
                  {(fields) => (
                    <>
                      {fields.map((f, index) => {
                        const row = form.getFieldValue(["products", f.name]);
                        const readOnly = status === "STOCKED";
                        return (
                          <div key={f.name}>
                            <Descriptions
                              size="small"
                              colon={false}
                              column={col}
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
                                    {row.otherName
                                      ? row.otherName.name
                                      : row.name}
                                  </Link>
                                ) : row.otherName ? (
                                  row.otherName.name
                                ) : (
                                  row.name
                                )}
                              </Descriptions.Item>
                              <Descriptions.Item span={1} label={t("PALLETS")}>
                                {row.numberOfUnits || 0}
                              </Descriptions.Item>
                              <Descriptions.Item span={1} label={t("QUANTITY")}>
                                {row.quantity}
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
                                        {row.isFresh && (
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
                                                required
                                              />
                                            </Form.Item>
                                          </Col>
                                        )}
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
                                              required
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
                                              required
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
                                        {row.isExpiry && (
                                          <Col>
                                            <Form.Item
                                              label={
                                                i === 0
                                                  ? t("EXPIRY_DATE")
                                                  : null
                                              }
                                              name={[field.name, "expiry"]}
                                            >
                                              <DatePicker
                                                disabled={readOnly}
                                                style={{ width: 130 }}
                                                format={"DD/MM/YYYY"}
                                                placeholder={t("EXPIRY_DATE")}
                                                required
                                              />
                                            </Form.Item>
                                          </Col>
                                        )}
                                        {locations?.length ? (
                                          <Col md={4}>
                                            <MuiAutocomplete
                                              {...field}
                                              required={true}
                                              disabled={readOnly}
                                              label={
                                                i === 0 ? t("LOCATION") : null
                                              }
                                              onSelect={(value) =>
                                                onChange(
                                                  value,
                                                  f.name,
                                                  field.key
                                                )
                                              }
                                              message={t(
                                                "PLEASE_SELECT_A_LOCATION"
                                              )}
                                              data={locations}
                                              placeholder={t(
                                                "SELECT_A_LOCATION"
                                              )}
                                              displayKey={"name"}
                                              name={[
                                                field.name,
                                                "location",
                                                "name",
                                              ]}
                                            />
                                          </Col>
                                        ) : null}
                                        {readOnly ? null : (
                                          <Col>
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
                                                disabled={i === 0}
                                              />
                                            </Form.Item>
                                          </Col>
                                        )}
                                      </Row>
                                    );
                                  })}
                                  {/* {readOnly ? null : (
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
                                  )} */}
                                </>
                              )}
                            </Form.List>
                            <Form.Item
                              name={[f.name, "photos"]}
                              label={t("PHOTO")}
                            >
                              <Upload
                                className="image-upload-grid"
                                maxCount={5}
                                prefix={data?.id || ""}
                                multiple
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
                <Comments orderData={data} />
                {["RECEIVED"].includes(status) && (
                  <>
                    <Button
                      htmlType="submit"
                      loading={loading}
                      // onClick={() => {handleSubmit(form.getFieldsValue(), "STOCKED", "STOCKED")}}
                    >
                      {t("STOCKED")}
                    </Button>
                    <Button
                      type="primary"
                      htmlType="button"
                      loading={saving}
                      style={{ marginLeft: 10 }}
                      onClick={() => handleSave(form.getFieldsValue())}
                    >
                      {t("SAVE")}
                    </Button>
                  </>
                )}
                {["STOCKED"].includes(status) && (
                  <Button
                    htmlType="button"
                    loading={loading}
                    onClick={() => {
                      handleSubmit(
                        form.getFieldsValue(),
                        "OLDSTOCK",
                        "PUBLISHED"
                      );
                    }}
                  >
                    {t("Push Stock on E-Commerce")}
                  </Button>
                )}
              </>
            )}
            {["RECEIVED", "GRN_RECEIVED"].includes(status) &&
              products &&
              grnTable && (
                <>
                  {showGRN && (
                    <Card
                      title={"Good Received Note"}
                      style={{
                        background: "#F9FAFB",
                        border: "3px solid #E5E7EB",
                        marginBottom: "20px",
                      }}
                      extra={
                        <Row justify="space-between" align="middle" style={{width: 300}}>
                          <Col style={{height: 35}}>
                            <Row justify="space-between" align="top" gutter={16}>
                              <Col style={{margin: '5px 0 0 0', width: 30}}>
                                <Popover trigger="hover" color="#fff" content={
                                    <div style={{margin: '5px 10px 0', color: '#f43a3a', fontWeight: 500}}>
                                      <text style={{fontSize: 14}}>Description</text>
                                      <ul style={{fontSize: 12, lineHeight: 1.5}}>
                                        <li>{`Only one Goods Received Note (GRN) can be processed at a time.`}</li>
                                        <li>{`The quantity should match or be less than the amount specified for`}<br />{`delivery in the Goods Received Note (GRN).`}</li>
                                        <li>{`Each batch should cover the entirety of the product quantity.`}</li>
                                      </ul>
                                    </div>
                                  }
                                >
                                  {/* <InfoCircleOutlined style={{color:'#808080', fontSize: 14}} /> */}
                                </Popover>
                              </Col>
                              {/* <Col>
                                <Tooltip placement="top" title={lastAddedGRNStatus && "Virtual GRN can't be added back to back"}>
                                  <Form.Item name="isVirtual" valuePropName="checked" initialValue={false}>
                                    <Checkbox disabled={lastAddedGRNStatus} onClick={handleVirtualGRNChange}>Virtual GRN</Checkbox>
                                  </Form.Item>
                                </Tooltip>
                              </Col> */}
                            </Row>
                          </Col>
                          <Col>
                            <Button icon={<CloseOutlined />}
                              onClick={() => {setSelectedProductNames([]); setProductList(null); setShowGRN(false); setIsVirtualGRN(false); form.setFieldsValue({isVirtual: false, grnNumber: '', grnReceivedDate: ''})}}
                            />
                          </Col>
                        </Row>
                      }
                    >
                      <>
                        <Row>
                          <Col span={12} style={{ paddingRight: "10px" }}>
                            <Form.Item name="isAdjusted" hidden initialValue={false}></Form.Item>
                            <Form.Item
                              label={t("GRN_NUMBER")}
                              name={"grnNumber"}
                              required
                            >
                              <Input placeholder="Enter Reference" disabled={isVirtualGRN ?? false} />
                            </Form.Item>
                          </Col>
                          <Col span={12} style={{ paddingLeft: "10px" }}>
                            <Form.Item
                              label={t("RECEIVED_DATE")}
                              name={"grnReceivedDate"}
                              required
                            >
                              <DatePicker
                                style={{ width: "100%" }}
                                format={"DD/MM/YYYY"}
                                placeholder={"RECEIVED DATE"}
                                disabled={isVirtualGRN ?? false}
                                // required
                              />
                            </Form.Item>
                          </Col>
                          <Col span={24}>
                            <Form.Item
                              name={'grnImages'}
                              label={t("Goods Received Notes Photo/Image")}
                              valuePropName="fileList"
                            >
                              <Upload
                                className="image-upload-grid"
                                prefix={data?.id || ""}
                                multiple
                                maxCount={5}
                                beforeUpload={()=>false}
                              >
                                <div>
                                  Drag &amp; drop or{" "}
                                  <u className="text-primary">
                                    browse
                                  </u>
                                </div>
                              </Upload>
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.List name="products">
                          {(fields, { add, remove }) => {
                            // let isAddProductVisible;
                            // var selectedProdNames = values.isVirtual && values?.products?.filter(prod=>prod.name != '').map(prod =>prod["name"]);
                            // var filteredProduct = values.isVirtual && products?.data?.content?.filter(item => !selectedProdNames?.includes(item.name))
                            // console.log("<><><><>", values?.products, selectedProdNames, filteredProduct)
                            return(<>
                              {fields.map((f, index) => {
                                //  isAddProductVisible = index < 2;
                                //  console.log('index',index);
                                const row = form.getFieldValue([
                                  "products",
                                  f.name,
                                ]);
                                console.log('PRODUCTS', row, index)
                                const readOnly = status === "STOCKED";
                                return (
                                  <Card
                                    key={index}
                                    title={"Select a Product"}
                                    style={{
                                      background: "rgb(238 240 243)",
                                      border: "1px solid #E5E7EB",
                                      marginBottom: "20px",
                                    }}
                                    extra={<Button icon={<CloseOutlined />} onClick={() => {
                                      if(values.isVirtual) {
                                        let newNameState = selectedProductNames.length>0 ? selectedProductNames.filter((item,i) => i !== f.name) : [];
                                        setSelectedProductNames(newNameState);
                                      }
                                      remove(f.name);
                                    }} />}
                                  >
                                    <div key={f.name}>
                                      {(Products || productList) && <ProductSelect f={f} index={index} add={add} remove={remove} form={form} values={values} />}
                                      <Form.List
                                        name={[f.name, "productLocation"]}
                                      >
                                        {(nf, { add, remove }) => (
                                          <>
                                            {nf.map((field, i) => {
                                              let locationRow =
                                                form.getFieldValue([
                                                  "products",
                                                  f.name,
                                                  "productLocation",
                                                ]);
                                              return (
                                                <Row
                                                  gutter={24}
                                                  key={
                                                    f.name + "_" + field.name
                                                  }
                                                  align="bottom"
                                                >
                                                  <Divider />
                                                  <Col span={22}>
                                                    <Row justify="start" gutter={6}>
                                                      {(row.isFresh || row.isExpiry) && (
                                                        <Col span={8}>
                                                          <Form.Item
                                                            label={t(
                                                              "LOT_NUMBER"
                                                            )}
                                                            name={[
                                                              field.name,
                                                              "lotNumber",
                                                            ]}
                                                            required
                                                          >
                                                            <InputNumber
                                                              disabled={readOnly || isVirtualGRN}
                                                              style={{ width: '100%' }}
                                                              placeholder={t(
                                                                "LOT_NUMBER"
                                                              )}
                                                              required
                                                            />
                                                          </Form.Item>
                                                        </Col>
                                                      )}
                                                      <Col span={8}>
                                                        <Form.Item
                                                          label={t(
                                                            "RECEIVED_PALLETS"
                                                          )}
                                                          name={[
                                                            field.name,
                                                            "receivedPallets",
                                                          ]}
                                                        >
                                                          <InputNumber
                                                            disabled={readOnly}
                                                            style={{ width: '100%' }}
                                                            placeholder={t(
                                                              "RECEIVED_PALLETS"
                                                            )}
                                                            min={0}
                                                            required
                                                          />
                                                        </Form.Item>
                                                      </Col>
                                                      <Col span={8}>
                                                        <Form.Item
                                                          label={t(
                                                            "RECEIVED_QTY"
                                                          )}
                                                          name={[
                                                            field.name,
                                                            "receivedNumberofUnits",
                                                          ]}
                                                          required
                                                        >
                                                          <InputNumber
                                                            disabled={readOnly}
                                                            style={{ width: '100%' }}
                                                            placeholder={t(
                                                              "RECEIVED_QTY"
                                                            )}
                                                            min={1}
                                                            required
                                                          />
                                                        </Form.Item>
                                                      </Col>
                                                      {!isVirtualGRN && <Col span={8}>
                                                        <Form.Item
                                                          label={t("DAMAGED_QTY")}
                                                          name={[
                                                            field.name,
                                                            "damageNumberOfUnits",
                                                          ]}
                                                        >
                                                          <InputNumber
                                                            disabled={readOnly}
                                                            style={{ width: '100%' }}
                                                            placeholder={t(
                                                              "DAMAGED_QTY"
                                                            )}
                                                            min={0}
                                                          />
                                                        </Form.Item>
                                                      </Col>}
                                                      {row.isExpiry && (
                                                        <Col span={8}>
                                                          <Form.Item
                                                            label={t(
                                                              "EXPIRY_DATE"
                                                            )}
                                                            name={[
                                                              field.name,
                                                              "expiry",
                                                            ]}
                                                            required
                                                          >
                                                            <DatePicker
                                                              disabled={readOnly || isVirtualGRN}
                                                              style={{ width: '100%' }}
                                                              format={
                                                                "DD/MM/YYYY"
                                                              }
                                                              placeholder={t(
                                                                "EXPIRY_DATE"
                                                              )}
                                                              required
                                                            />
                                                          </Form.Item>
                                                        </Col>
                                                      )}
                                                      {locations?.length/*locationOptions?.length*/ ? (
                                                        <Col md={8}>
                                                          <Form.Item
                                                            label={t("LOCATION")}
                                                            style={{marginBottom: 0}}
                                                            name={[
                                                              field.name,
                                                              "location",
                                                              // "label"
                                                              "name",
                                                            ]}
                                                            // initialValue={locationOptions[0].label ?? ''}
                                                            required
                                                          >
                                                            {/* <Select
                                                              showSearch
                                                              placeholder="Select a location"
                                                              optionFilterProp="name"
                                                              onChange={value=>onChange(value, f.name, field.key)}
                                                              filterOption={(input, option) =>(option?.name ?? "").toLowerCase().includes(input.toLowerCase())}
                                                              options={locations}
                                                            /> */}
                                                            <MuiAutocomplete
                                                              {...field}
                                                              required={true}
                                                              disabled={readOnly}
                                                              onSelect={(value) =>
                                                                onChange(
                                                                  value,
                                                                  f.name,
                                                                  field.key
                                                                )
                                                              }
                                                              message={t(
                                                                "PLEASE_SELECT_A_LOCATION"
                                                              )}
                                                              data={locations}
                                                              placeholder={t(
                                                                "SELECT_A_LOCATION"
                                                              )}
                                                              displayKey={"name"}
                                                              name={[
                                                                field.name,
                                                                "location",
                                                                "name",
                                                              ]}
                                                            />
                                                          </Form.Item>
                                                          <Col span={8}
                                                          
                                                          >
                                                          <Form.Item
                                                            label={t("Product ID")}
                                                            style={{marginBottom: 0, width: '100%' }}
                                                            name={[
                                                              field.name,
                                                              "orderProdID",
                                                              
                                                            ]}
                                                            required
                                                          >
                                                            <MuiAutocomplete
                                                              {...field}
                                                              required={true}
                                                              disabled={readOnly}onSelect={(value) =>
                                                                onChange(
                                                                  value,
                                                                  f.name,
                                                                  field.key
                                                                )
                                                              }
                                                              message={t(
                                                                "PLEASE_SELECT_PRODUCT_ID"
                                                              )}
                                                              data={productsInCurrentOrder}
                                                              placeholder={t(
                                                                "Product ID"
                                                              )}
                                                              displayKey={"id"}
                                                              // name={[
                                                              //   field.name,
                                                              //  "orderProdID"
                                                              // ]}
                                                            />
                                                          </Form.Item> 
                                                          </Col>
                                                        </Col>
                                                      ) : null}
                                                    </Row>
                                                  </Col>
                                                  <Col span={2}>
                                                    <Row gutter={[0, 6]}>
                                                      {readOnly ? null : (<>
                                                        {/*<Col span={4} style={{ display: 'flex', justifyContent: 'space-around' }}>*/}
                                                          {locationRow.length>1 &&
                                                          <Col span={24}>
                                                           <Form.Item label="">
                                                            <Button
                                                              type="dashed"
                                                              icon={<MinusCircleOutlined />}
                                                              danger
                                                              onClick={() => remove(field.name)}
                                                              // disabled={i === 0}
                                                              style={{ marginBottom: 0 }}
                                                            />
                                                          </Form.Item></Col>}
                                                          {i === locationRow.length - 1 ? (
                                                            <Col span={24}>
                                                            <Form.Item label={i === 0 ? " " : null} /*style={{ marginBottom: 0 }}*/>
                                                              <Tooltip placement="top" title={isVirtualGRN && "This button can't be used in Virtual GRN"}>
                                                                <Button
                                                                  type="dashed"
                                                                  icon={<PlusCircleOutlined />}
                                                                  style={{ color: isVirtualGRN ? '#abadaf' : "green", borderColor: isVirtualGRN ? '#abadaf' : "green", marginBottom: 0 }}
                                                                  danger
                                                                  disabled={isVirtualGRN}
                                                                  onClick={()=>{
                                                                    add()
                                                                    console.log('Index---',i)
                                                                    const selectedProduct = form.getFieldValue([
                                                                      "products",
                                                                      f.name,
                                                                      "productLocation",
                                                                      i+1,
                                                                    ]);
                                                                    form.setFieldValue(
                                                                      [
                                                                        "products",
                                                                        f.name,
                                                                        "productLocation",
                                                                        i+1,
                                                                      ],
                                                                      {
                                                                        ...selectedProduct,
                                                                        lotNumber: isVirtualGRN ? (selectedProduct.isFresh || selectedProduct.isExpiry) ? "LN" + moment().format("YYMMDDHHmm") + index : "" : "",
                                                                        receivedPallets: "",
                                                                        receivedNumberofUnits: "",
                                                                        damageNumberOfUnits: "",
                                                                        expiry: isVirtualGRN ? selectedProduct.isExpiry ? moment().add(1, 'months') :  "" : "",
                                                                        location: {
                                                                          name: "",
                                                                        },
                                                                      }
                                                                    );
                                                                  }}
                                                                />
                                                              </Tooltip>
                                                            </Form.Item></Col>
                                                          ) : null}
                                                        {/* </Col> */}
                                                        </>
                                                      )}
                                                    </Row>
                                                  </Col>
                                                </Row>
                                              );
                                            })}
                                          </>
                                        )}
                                      </Form.List>
                                      <Divider />
                                      <Form.Item
                                        name={[f.name, "photos"]}
                                        label={t("PHOTO")}
                                      >
                                        <Upload
                                          className="image-upload-grid"
                                          maxCount={5}
                                          prefix={data?.id || ""}
                                          multiple
                                          disabled={readOnly}
                                        >
                                          <div>
                                            Drag &amp; drop or{" "}
                                            <u className="text-primary">
                                              browse
                                            </u>
                                          </div>
                                        </Upload>
                                      </Form.Item>
                                      {/* </Card> */}
                                    </div>
                                  </Card>
                                );
                              })}
                              {/* {isAddProductVisible && ( */}
                              <div
                                style={{
                                  display: "flex",
                                  gap: 20,
                                  marginBottom: 20,
                                }}
                              >
                                {/* <Button
                                  onClick={add}
                                  block
                                  type="dashed"
                                  icon={<PlusOutlined />}
                                >
                                  <span>Goods Received Notes</span>
                                </Button> */}
                                <Button
                                  onClick={()=>add()}
                                  block
                                  type="dashed"
                                  icon={<PlusOutlined />}
                                >
                                  <span>Add Product</span>
                                </Button>
                              </div>
                              {/* )} */}
                            </>
                          )}}
                        </Form.List>
                        <Form.Item label={t("COMMENTS")} name={"notes"}>
                          <Input.TextArea
                            placeholder={t("COMMENTS")}
                            rows={2}
                          />
                        </Form.Item>
                      </>
                    </Card>
                  )}
                  {["RECEIVED", "GRN_RECEIVED"].includes(status) && (
                    <>
                      <div style={{ textAlign: "right" }}>
                        {!showGRN && (
                          <Button
                            htmlType="button"
                            onClick={(event) => {
                              setShowGRN(true);
                            }}
                          >
                            Add GRN
                          </Button>
                        )}

                        {showGRN && (
                          <>
                            {/* <Button
                              type="primary"
                              htmlType="button"
                              loading={loading}
                              onClick={() => {
                                // if (form.getFieldValue("products")?.lenght > 0)
                                handleSubmit(
                                  form.getFieldsValue(),
                                  "STOCK_AND_PUBLISH",
                                  "STOCKED"
                                );
                                // else {
                                //   Modal.warn(
                                //     {
                                //       title: "Warning",
                                //       content: "Please add atleast one product"
                                //     }
                                //   )
                                // }
                              }}
                            >
                              {t("STOCK & PUBLISH")}
                            </Button> */}
                            {!isVirtualGRN && <Button
                              type="primary"
                              htmlType="button"
                              style={{ marginLeft: 10 }}
                              loading={loading}
                              onClick={() => {
                                handleSubmit(
                                  form.getFieldsValue(),
                                  "STOCK",
                                  "STOCKED"
                                );
                              }}
                            >
                              {t("STOCK")}
                            </Button>}{" "}
                          </>
                        )}
                        {grnTable.length > 0 && !showGRN && (
                          <Button
                            type="primary"
                            htmlType="button"
                            loading={saving}
                            style={{ marginLeft: 10 }}
                            onClick={() => {
                              handleSubmit(
                                form.getFieldsValue(),
                                "CLOSE",
                                "CLOSE"
                              );
                            }}
                          >
                            {t("Close Order")}
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                  {["STOCKED"].includes(status) && (
                    <Button
                      htmlType="button"
                      loading={loading}
                      onClick={() => {
                        handleSubmit(
                          form.getFieldsValue(),
                          "PUBLISH",
                          "PUBLISHED"
                        );
                      }}
                    >
                      {t("Push Stock on E-Commerce")}
                    </Button>
                  )}
                </>
              )}
            {(["GRN_RECEIVED", "COMPLETED"].includes(status) ||
              grnTable.length > 0) &&
              products &&
              grnTable && (
                <>
                  {productMap.size > 0 && (
                    <Collapse
                      accordion
                      items={grnTableItems}
                      style={{ marginTop: "10px" }}
                    />
                  )}
                </>
              )}
          </>
        )}
      </Form>
    </>
  );
};

export default OrderDrawerContent;