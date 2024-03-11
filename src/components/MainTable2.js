import { useContext, useEffect, useState, useCallback } from "react";
import { UserContext } from "../UserProvider";
import useFetch from "../hooks/useFetch";
import { useTranslation } from "react-i18next";
import { CSVLink } from "react-csv";
import {
  AutoComplete,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Table,
  Tabs,
  Typography,
} from "antd";
import { useHistory, useLocation } from "react-router-dom";
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { FilterList } from "@material-ui/icons";
import { deleteData, getDataWithParams } from "src/services/NetworkService";
import moment from "moment";
import OrderDrawer from "./OrderDrawer";
import { useStateCallback } from "./useStateCallBack";

const MainTable2 = ({
  addRoute,
  addBtnTitle,
  overRideDelete = true,
  vendors,
}) => {
  const location = useLocation();
  const history = useHistory();
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const [form] = Form.useForm();
  const [showForm, setShowForm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState(null);
  const [status, setStatus] = useState(null);
  const [isDeleted,setIsDeleted] = useState(false);
  const [currentPagination, setCurrentPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const [dataSource, setData] = useState([]);
  const [exportDate, setExportDate] = useState(null);
  const [exportData, setExportData] = useState(null);
  const [statusList] = useState({
    ALL: 1,
    NEW: 2,
    VALIDATED: 3,
    CONFIRMED: 4,
    RECEIVED: 5,
    STOCKED: 6,
    PUBLISHED: 7,
    CANCELLED: 8,
  });
  const pathList = {
    ALL: "/orders",
    NEW: "/new",
    VALIDATED: "/validated",
    CONFIRMED: "/confirmed",
    RECEIVED: "/received",
    STOCKED: "/stocked",
    PUBLISHED: "/published",
    CANCELLED: "/cancelled",
  }
  const [drawerOptions, setDrawerOptions] = useStateCallback({
    visible: false,
    data: null,
    mode: "",
    title: "Create Order",
  });

  const {  data: validated } = useFetch('orders' + '?status=' + "VALIDATED");
  const {  data: cancelled } = useFetch('orders' + '?status=' + "CANCELLED,CANCELLED_BY_VENDOR");
  const {  data: published } = useFetch('orders' + '?status=' + "PUBLISHED,COMPLETED");
  const {  data: new_ } = useFetch('orders' + '?status=' + "NEW");
  const {  data: stocked } = useFetch('orders' + '?status=' + "STOCKED");
  const {  data: confirmed } = useFetch('orders' + '?status=' + "CONFIRMED");
  const {  data: received } = useFetch('orders' + '?status=' + "RECEIVED,GRN_RECEIVED");
  const [option,setOption]=useState([]);
  var selectedVendorId;
  const handleSearch = (value) => {
    const uniqueVendorNames = Array.from(
      new Set(
        vendors?.data?.content
          .filter((option) =>
            option.name.toLowerCase().includes(value.toLowerCase())
          )
          .map((option) => option.name)
      )
    );
  
    setOption(
      uniqueVendorNames.map((name) => ({ value: name, key: name }))
    );
  };
  
  useEffect(() => {
  if (status === "RECEIVED,GRN_RECEIVED" && received && received.data) {
    received.data.totalElements = currentPagination.total;
  }
  else if (status === "PUBLISHED,COMPLETED" && published && published.data) {
    published.data.totalElements = currentPagination.total;
  }
  else if (status === "NEW" && new_ && new_.data) {
    new_.data.totalElements = currentPagination.total;
  }
  else if (status === "VALIDATED" && validated && validated.data) {
    validated.data.totalElements = currentPagination.total;
  }
  else if (status === "CONFIRMED" && confirmed && confirmed.data) {
    confirmed.data.totalElements = currentPagination.total;
  }
  else if (status === "STOCKED" && stocked && stocked.data) {
    stocked.data.totalElements = currentPagination.total;
  }
  else if (status === "CANCELLED" && cancelled && cancelled.data) {
    cancelled.data.totalElements = currentPagination.total;
  }
}, [currentPagination.total]);

  useEffect(() => {
    const path = location.pathname;
    let pathname = path.substring(1, path.length);
    //check if path and pathlist of status are diff-- update case here
    if (pathList[status] !== path) {
        if(status === "RECEIVED" || status === "GRN_RECEIVED")
        {
          received.data.totalElements -= 1
        }
        if(status === "PUBLISHED" || status === "COMPLETED")
        {
          published.data.totalElements -= 1
        }
        if(status === "NEW")
        {
          new_.data.totalElements -= 1
        }
        if(status === "VALIDATED")
        {
          validated.data.totalElements -= 1
        }
        if(status === "CONFIRMED")
        {
          confirmed.data.totalElements -= 1
        }
        if(status === "STOCKED")
        {
          stocked.data.totalElements -= 1
        }
        if(status === "CANCELLED")
        {
          cancelled.data.totalElements -= 1
        }
    }
    let cstatus =
      pathname === "new"
        ? "NEW"
        : pathname === "validated"
        ? "VALIDATED"
        : pathname === "confirmed"
        ? "CONFIRMED"
        : pathname === "received"
        ? "RECEIVED"
        : pathname === "stocked"
        ? "STOCKED"
        : pathname === "published"
        ? "PUBLISHED"
        : pathname === "cancelled"
        ? "CANCELLED"
        : "ALL";
    setActiveKey(statusList[(cstatus || "all").toUpperCase()]);
    setStatus(cstatus === "PUBLISHED" ? cstatus+=",COMPLETED" : cstatus === "RECEIVED" ? cstatus+=",GRN_RECEIVED" : cstatus , cstatus);
  }, [location.pathname]);

  const handleAction = (data, mode) => {
    setDrawerOptions(
      {
        visible: false,
      },
      () => {
        if (mode === "edit" || mode === "view") {
          setDrawerOptions(() => ({
            visible: true,
            data: JSON.parse(JSON.stringify(data)),
            orderId: data.id,
            mode,
            handleAction: handleAction,
            title: mode === "edit" ? "Edit Order" : "Order Details",
          }));
          // fetchData(null, null, null, null, status);
          fetchData(null, null, null, null, status === "ALL" ? "" : status);
        } else {
          setDrawerOptions(() => ({
            visible: true,
            data: JSON.parse(JSON.stringify(data)),
            orderId: null,
            mode,
            handleAction: handleAction,
            title: "Order Details",
          }));
        }
      }
    );
  };
  const handleDelete = (data) => {
    if (data.status === "PUBLISHED") {
      alert(t("PUBLISHED_ORDERS_CANNOT_BE_DELETED"));
      return;
    } else {
      deleteData("orders/" + data.id);
      let newOrders = dataSource?.data?.data?.content?.filter(
        (o) => o.id !== data.idtotalElements
      );
      let data_ = dataSource.data;
      data_.content = newOrders;
      setData({ ...dataSource, data: data_ });
      setIsDeleted(!isDeleted);
    }
  };

  const export_ = () => {
    setExporting(true);
    getDataWithParams("orders", {
      ...form.getFieldsValue(),
      sort: "createdOn,desc",
      size: 10000,
      page: 0,
      status: status === 'ALL' ? '':status,
    })
      .then((response) => {
        if (response.data) {
          let _exportData = [];
          let responseData = response.data.data.content;
          responseData.forEach((o) => {
            let data = {
              week: o.createdOn ? "S" + moment(o.createdOn).week() : "",
              createdOn: o.createdOn
                ? moment(o.createdOn).format("DD/MM/YYYY")
                : "",
              ordernumber: o.number,
              status: o.status,
              startTime: o.startTime,
              deliveryDate: o.deliveryDate
              ? new Date(o.deliveryDate).toLocaleDateString()
              : "",
            deliveryTime: o.deliveryTime
              ? new Date(o.deliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : "",
              purchaseorder: o.purchaseOrder,
              supervisor: o.supervisor,
              transporter: o.transporterName,
              name: o.employee?.name,
            };
            _exportData.push(data);
          });
          setExportDate(new Date().getTime());
          setExportData(_exportData);
          setExporting(false);
        }
      })
      .catch((error) => {
        setExporting(false);
        console.log(error);
      });
  };
  useEffect(() => {
    if (exportData) {
      setTimeout(() => document.getElementById("export_link").click(), 500);
    }
  }, [exportData]);

  useEffect(() => {
    if (status != null) {
      fetchData(null, null, null, null, status === "ALL" ? "" : status==="CANCELLED"?"CANCELLED,CANCELLED_BY_VENDOR":status);
    }
  }, [status]);

  useEffect(()=>{
    if (isDeleted) {
      fetchData(null, null, null, null, status === "ALL" ? "" : status==="CANCELLED"?"CANCELLED,CANCELLED_BY_VENDOR":status);
      setIsDeleted(false)
    }
  },[isDeleted])

  // useEffect(() => {
  //   if (drawerOptions.data) {
  //     const { status: drawerStatus } = drawerOptions.data;
  //     if (drawerStatus === 'GRN_RECEIVED') {
  //       onTabChange(statusList.RECEIVED);
  //     }
  //     if(drawerStatus === 'COMPLETED') {
  //       onTabChange(statusList.PUBLISHED);
  //     }
  //   }
  // }, [drawerOptions.visible]);
  const fetchData = (pagi, filters, sort, extra, currentStatus) => {
    const pagination = pagi || currentPagination;
    setLoading(true);
    const sortColumn = sort?.order ? (sort?.field || "createdOn") : "createdOn";
    const sortDirection = sort?.order
      ? sort.order === "descend"
        ? "desc"
        : "asc"
      : "desc";
    getDataWithParams("orders", {
      ...form.getFieldsValue(),
      // vendorId:selectedVendorId !== 0 ? selectedVendorId : null,
      sort: `${sortColumn},${sortDirection}`,
      size: pagination.pageSize,
      page: pagination.current - 1,
      status: currentStatus !== undefined ? currentStatus : status === "ALL" ? "" : status==="CANCELLED" ? "CANCELLED,CANCELLED_BY_VENDOR":status,
    })
      .then((response) => {
        if (response.data) {
          response.data.data.content.map(o => o.partners_name = o.partner)
          setData(response);
          setCurrentPagination({
            ...pagination,
            total: response.data.data.totalElements,
          });
        }
        setLoading(false);
        // setSubmitting(false);
      })
      .catch((error) => {
        setLoading(false);
        // setSubmitting(false);
        console.log(error);
      });
  };
  let edit = false;
  let del = false;
  const checkPermissions = (pathname) => {
    user.permissions.forEach((o) => {
      // if (o.menuUrl?.includes(window.location.pathname)) {
      if (o.childList.length > 0) {
        let permissionList = [];
        o.childList.forEach((c) => {
          permissionList.push(c.displayMenu);
        });
        if (
          permissionList.indexOf(
            pathname?.toLowerCase() || window.location.pathname
          ) !== -1
        ) {
          o.childList.forEach((c) => {
            if (c.displayMenu.startsWith("/edit")) {
              edit = true;
            }
            if (c.displayMenu.startsWith("/delete")) {
              del = true && overRideDelete;
            }

            if (
              window.location.pathname === c.displayMenu &&
              c.childList.length > 0
            ) {
              c.childList.forEach((cc) => {
                if (cc.displayMenu.startsWith("/edit")) {
                  edit = true;
                }
                if (cc.displayMenu.startsWith("/delete")) {
                  del = true;
                }
              });
            }
          });
        }
      }
      // }
    });
  };
  // if (!tableTitle) {
  //   checkPermissions();
  // }

  const headers = [
    { label: "Semaine", key: "week" },
    { label: "Created on", key: "createdOn" },
    { label: "Order Number", key: "ordernumber" },
    { label: "status", key: "status" },
    { label: "Product Name", key: "productname" },
    { label: "Category", key: "category" },
    { label: "Delivery Date", key: "deliveryDate" },
    { label: "Delivery Time", key: "deliveryTime" },
    { label: "Start Time", key: "startTime" },
    { label: "Supervisor", key: "supervisor" },
    { label: "Employee name", key: "name" },
  ];

 const totalElements = (element) => {
     return element ? (element.data ? element?.data?.totalElements : 0) : 0;
   }
   var total = totalElements(new_) + totalElements(validated) + totalElements(confirmed) + totalElements(published) + totalElements(stocked) + totalElements(received) + totalElements(cancelled);
   const items = [
     {
       key: 1,
       label: `${t("ALL")} ${total === 0 ? "" : `(${total})`}`,
     },
     {
       key: 2,
       label: `${t("NEW")} ${totalElements(new_) === 0 ? "" : `(${totalElements(new_)})`}`,
     },
     {
       key: 3,
       label: `${t("VALIDATED")} ${totalElements(validated) === 0 ? "" : `(${totalElements(validated)})`}`,
     },
     {
       key: 4,
       label: `${t("IN TRANSIT")} ${totalElements(confirmed) === 0 ? "" : `(${totalElements(confirmed)})`}`,
     },
     {
       key: 5,
       label: `${t("RECEIVED")} ${totalElements(received) === 0 ? "" : `(${totalElements(received)})`}`,
     },
     {
       key: 6,
       label: `${t("STOCKED")} ${totalElements(stocked) === 0 ? "" : `(${totalElements(stocked)})`}`,
     },
     {
       key: 7,
       label: `${t("PUBLISHED")} ${totalElements(published) === 0 ? "" : `(${totalElements(published)})` }`,
     },
     {
       key: 8,
       label: `${t("CANCELLED")} ${totalElements(cancelled) === 0 ? "" : `(${totalElements(cancelled)})` }`,
     },

   ];

  const onTabChange = (key) => {
    if(isLoading) return;
    setCurrentPagination({
                           current: 1,
                           pageSize: 20,
                           total: 0,
                         })
    let newstatus = null;
    let newPath = ""
    Object.keys(statusList).forEach((k) => {
      if (statusList[k] && statusList[k] === key) {
        newstatus = k;
        newPath = pathList[k] ?? window.location.pathname
      }
    });
    if (key !== 1) {
      setStatus(
        (newstatus === "PUBLISHED")
        ? newstatus+=",COMPLETED"
        : (newstatus === "RECEIVED") 
        ? newstatus+=",GRN_RECEIVED" 
        : newstatus,
        newstatus
        );
    } else {
      setStatus("")
    }
    setActiveKey(key);
    window.history.pushState(null, "", newPath);
    history.location.pathname = newPath;
    // fetchData(null, null, null, null, newstatus);
  };
  return (
    <>
      <Row>
        <Col xs={24} md={16}>
          <Typography.Title level={3}>{t("PURCHASE_ORDERS")}</Typography.Title>
          <Typography.Paragraph>
            {t("PURCHASE_ORDERS_MSG")}
          </Typography.Paragraph>
        </Col>
        <Col
          className="align-items-start d-flex flex-wrap"
          style={{ gap: 10, marginBottom: 20 }}
        >
          {exportData && (
            <CSVLink
              hidden
              color="default"
              style={{ textDecoration: "underline" }}
              filename={`${exportDate}.csv`}
              headers={headers}
              id="export_link"
              data={exportData}
            >
              {t("EXPORT")}
            </CSVLink>
          )}
          <Button
            loading={exporting}
            className="align-items-center d-inline-flex"
            icon={<DownloadOutlined style={{ width: 18 }} />}
            onClick={export_}
          >
            <strong
              style={{ marginLeft: 5, fontWeight: "normal" }}
              className="d-md-block d-none"
            >
              {t("EXPORT")}
            </strong>
          </Button>
          <Button
            className="align-items-center d-inline-flex"
            icon={<FilterList style={{ width: 18 }} />}
            onClick={() => setShowForm(!showForm)}
          >
            <strong
              style={{ marginLeft: 5, fontWeight: "normal" }}
              className="d-md-block d-none"
            >
              {t("FILTERS")}
            </strong>
          </Button>
          <Button
            onClick={() =>
              // history.push(addRoute)
              handleAction(null, "create")
            }
          >
            {t(addBtnTitle)}
          </Button>
        </Col>
      </Row>
      {drawerOptions.visible ? (
        <OrderDrawer
          onClose={()=>setDrawerOptions({ ...drawerOptions, visible: false })}
          {...drawerOptions}
        />
      ) : null}
      {showForm ? (
        <Card style={{ marginBottom: 20 }}>
          <Form form={form} layout="vertical" initialValues={{vendorId:null}} onFinish={() => fetchData({current: 1, pageSize: currentPagination.pageSize, total: currentPagination.total})}>
            <Form.Item shouldUpdate noStyle>
              {() => (
                <>
                  <Row gutter={20}>
                    <Col xs={24} md={6}>
                      <Form.Item name={"orderNo"} label={t("ORDER_NUMBER")}>
                        <Input placeholder={t("ORDER_NUMBER")} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                      <Form.Item name={"logisticsType"} label={t("LOGISTICS")}>
                        <Select placeholder={t("LOGISTICS")} showSearch>
                          {[
                            {
                              label: t("IN_HOUSE"),
                              value: "IN_HOUSE",
                            },
                            {
                              label: t("BY_SUPPLIER"),
                              value: "BY_SUPPLIER",
                            },
                            {
                              label: t("OUTSOURCE"),
                              value: "OUTSOURCE",
                            },
                          ].map((row) => (
                            <Select.Option key={row.value} value={row.value}>
                              {row.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    {form.getFieldValue("logisticsType") === "OUTSOURCE" ? (
                      <Col xs={24} md={6}>
                        <Form.Item
                          name={"transporterName"}
                          label={t("TRANSPORT_COMPANY_NAME")}
                        >
                          <Input placeholder={t("TRANSPORT_COMPANY_NAME")} />
                        </Form.Item>
                      </Col>
                    ) : null}
                    <Col xs={24} md={6}>
                      <Form.Item name={"productName"} label={t("PRODUCT_NAME")}>
                        <Input placeholder={t("PRODUCT")} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                        <Form.Item hidden name={"vendorId"} >
                          <Input />
                        </Form.Item>
                      <Form.Item name={"vendor"} label={t("VENDOR")}>
                        <AutoComplete
                          onClear={() => {alert('clear');form.setFieldValue('vendorId',null)}}
                          onSelect={(val, option) => {
                            selectedVendorId = option.id;
                            // console.log(form.getFieldsValue());
                            form.setFieldValue('vendorId',option.id);
                          }}
                          options={vendors?.data?.content?.map(
                            (row) =>
                              ({
                                id: row.id,
                                value: row.name,
                                label: row.name,
                                key: row.id
                              } || [])
                          )}
                          filterOption={(inputValue, option) =>
                            option.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                          }
                          />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                      <Form.Item name={"date"} label={t("ORDER_DATE")}>
                        <DatePicker.RangePicker />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                      <Form.Item
                        name={"deliveryDate"}
                        label={t("DELIVERY_DATE")}
                      >
                        <DatePicker.RangePicker />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item noStyle>
                    <Button type="primary" htmlType="submit">
                      {t("SEARCH")}
                    </Button>
                    <Button
                      loading={exporting}
                      type="default"
                      style={{ marginLeft: 10 }}
                      onClick={export_}
                    >
                      {t("EXPORT")}
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.Item>
          </Form>
        </Card>
      ) : null}
      <Tabs
        onChange={onTabChange}
        type="card"
        items={items}
        style={{ marginBottom: 0 }}
        tabBarStyle={{ marginBottom: 0 }}
        activeKey={activeKey}
      />
      <div className="table-responsive table-responsive" style={{marginTop: -20, textAlign: 'end'}}>
      {
        currentPagination.pageSize ? (`${(currentPagination?.current - 1) * 20+1} - ${Math.min(currentPagination?.current * 20,currentPagination?.total)} of ${currentPagination?.total}`)
        :
        null
      }
      </div>
      <div className="table-responsive table-responsive-bg">
        <Table
          size="small"
          loading={isLoading}
          showSorterTooltip={false}
          dataSource={dataSource?.data?.data?.content}
          onChange={(pagination, filters, sort, extra) => {
            fetchData(pagination, filters, sort, extra);
          }}
          pagination={currentPagination}
          columns={[
            {
              title: t("ORDER_NO"),
              dataIndex: "number",
              key: "number",
              sorter: true,
              render: (cell, row) => {
                return (
                  <Button type="link" onClick={() => handleAction(row, "view")}>
                    {cell}
                  </Button>
                );
              },
            },
            {
              title: t("VENDOR"),
              dataIndex: "partners_name",
              key: "partners_name",
              sorter: true,
              render: (partner) => {
                return <span>{partner?.name}</span>;
              },
            },
            {
              title: t("CREATED_DATE"),
              dataIndex: "createdOn",
              key: "createdOn",
              sorter: true,
              render: (value) =>
                value ? moment(value).format("DD/MM/YYYY") : null,
            },
            {
              title: t("STATUS"),
              dataIndex: "status",
              key: "status",
              sorter: true,
              render: value => (/_/).test(value) ? value.replace(/_/g, " ") : value
            },
            {
              title: t("ACTIONS"),
              dataIndex: "id",
              key: "id",
              render: (id, row) => {
                checkPermissions("/" + row.status);
                return (
                  <div style={{ display: "flex", gap: 5 }}>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => handleAction(row, "view")}
                    >
                      <EyeOutlined />
                    </Button>
                    {edit ? (
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {
                          handleAction(row, "edit");
                        }}
                      >
                        <EditOutlined />
                      </Button>
                    ) : null}

                    {del && (
                      <Button
                        type="link"
                        size="small"
                        danger
                        onClick={() => {
                          if (
                            window.confirm(t("ARE_YOU_SURE_YOU_WANT_TO_DELETE"))
                          ) {
                            handleDelete(row);
                          }
                        }}
                      >
                        <DeleteOutlined />
                      </Button>
                    )}
                  </div>
                );
              },
            },
          ]}
        />
      </div>
    </>
  );
};

export default MainTable2;
