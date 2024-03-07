import { useState} from "react";
import useFetch from "../../../../hooks/useFetch";
import { useTranslation } from "react-i18next";
import {
  Button,
  Col,
  DatePicker,
  Input,
  Row,
  Table,
  Drawer,
  Typography,
  Space,
  Radio,
  Tag,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  DownOutlined,
  TableOutlined,
  LoadingOutlined,
  StopOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  CheckOutlined,
  SyncOutlined,
  WarningOutlined
} from "@ant-design/icons";
import { FilterList, Warning } from "@material-ui/icons";
import { useStateCallback } from "src/components/useStateCallBack";
import MyOrderForm from "./MyOrderForm";
import MyOrderDetail from "./MyOrderDetail";
import { getDataWithParams, putData } from "src/services/NetworkService";

const { RangePicker } = DatePicker;

const MyOrder = () => {
  const [page] = useState(1);
  const {error, isPending, data, setData} = useFetch("delivery-plans", page - 1);
  const [item,setItem] = useState(null);
  const [plans, setPlans] = useState(null);
  const [Loading, setLoading] = useState(false);
  const [currentPagination, setCurrentPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const { t } = useTranslation();
  const [displaybody, setdisplaybody] = useState(false);
  const [selectRadio, setSelectRadio] = useState("Default");

  const fetchData = (pagi, filters, sort, extra, currentStatus) => {
    const pagination = pagi || currentPagination;
    setLoading(true);
    const sortColumn = sort?.field || "createdOn";
    const sortDirection = sort?.order
      ? sort.order === "descend"
        ? "desc"
        : "asc"
      : "desc";

    getDataWithParams("delivery-plans", {
      sort: `${sortColumn},${sortDirection}`,
      size: pagination.pageSize,
      page: pagination.current - 1,
    })
      .then((response) => {
        if (response.data) {
          setData(response.data);
          setCurrentPagination({
            ...pagination,
            total: response.data.data.totalElements,
          });
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });
  };

  const parseDate = (unixTS) => {
    return new Date(unixTS).toLocaleDateString("en-UK");
  };
  const w = window.screen.width > 850 ? 850 : window.screen.width;
  const [drawerOptions, setDrawerOptions] = useStateCallback({
    visible: false,
    data: null,
    mode: "",
    title: "Create Order",
  });

  const handleClose = () => {
    setDrawerOptions({
      visible: false,
      data: null,
      mode: "",
      title: "Create Order",
    });
  };

  const handleAction2 = (data, mode) => {
    console.log("data: ",data);
    setItem(data);
    setDrawerOptions(
      {
        visible: false,
      },
      () => {
        if (mode === "edit" || mode === "view") {
          setDrawerOptions(() => ({
            visible: true,
            data: JSON.parse(JSON.stringify(data)),
            id: data.id,
            mode,
            handleAction: handleAction2,
            title: mode === "edit" ? `Edit ${"Delivery Plan"}` : `${"Delivery Plan"} Details`,
          }));
        } else {
          setDrawerOptions(() => ({
            visible: true,
            data: JSON.parse(JSON.stringify(data)),
            id: null,
            mode,
            handleAction: handleAction2,
            title: `Generate Delivery Plan`,
          }));
        }
      }
    );
  };

  const bodydisplayfun = () => {
    setdisplaybody(!displaybody);
  };
  const backgroundColor = {
    backgroundColor: "#FFF",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
  };
  const handleChangeStatus = async (newStatus, row) => {
    if(row.status === newStatus) return;
    const updatedContent = data.data.content.map(item => item.id === row.id ? {...item, status: newStatus} : item);
    setData((prevData) => ({
      ...prevData,
      data:{
        ...prevData.data,
        content: updatedContent
      }
    }));
    
    console.log("data: "+row);
    putData(`delivery-plans/${row.id}/update-status`, {newStatus})
      .then((res) => {
        if (res.status === 200) {
          fetchData();
        }
      })
      .catch((err) => console.log('Error: ', err));
    
  };
  
  const columns = [
    {
      title: "Reference Number",
      dataIndex: "ref",
      key: "ref",
      render: (text, row) => (
        <a href="#" onClick={() => handleAction2(row, "view")}>
          {text}
        </a>
      ),
    },
    {
      title: "Truck Type",
      dataIndex: "truck_type",
      key: "truck_type",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text,row) => (
        <Space>
          {row.status === "NEW" ? (
            <Tag color="blue">{row.status}</Tag>
          ) : row.status === "COMPLETED" ? (
            <Tag color="green">{row.status}</Tag>
          ) : row.status === "IN_PROGRESS" ? (
            <Tag color="orange">{row.status}</Tag>
          ) : row.status === "CANCELLED" ? (
            <Tag color="purple">{row.status}</Tag>
          ) : row.status === "NOT_SETTLED" ? (
            <Tag color="default">{row.status}</Tag>
          ) : row.status === "REJECTED" ? (
            <Tag color="magenta">{row.status}</Tag>
          ) : (
            <Tag color="red">{row.status}</Tag>
          )}
          {row.status === "NEW" && (
            <>
              <Popconfirm
                title={`Are you sure you want to change the status to "IN_PROGRESS"?`}
                onConfirm={() => handleChangeStatus("IN_PROGRESS", row)}
              >
                <Tooltip title="Mark as In Progress">
                  <SyncOutlined/>
                </Tooltip>
              </Popconfirm>
              <Popconfirm
                title={`Are you sure you want to change the status to "CANCELLED"?`}
                onConfirm={() => handleChangeStatus("CANCELLED", row)}
              >
                <Tooltip title="Mark as Cancelled">
                  <StopOutlined/>
                </Tooltip>
              </Popconfirm>
              <Popconfirm
                title={`Are you sure you want to change the status to "REJECTED"?`}
                onConfirm={() => handleChangeStatus("REJECTED", row)}
              >
                <Tooltip title="Mark as Rejected">
                  <CloseOutlined/>
                </Tooltip>
              </Popconfirm>
            </>
          )}
          {row.status === "IN_PROGRESS" && (
            <>
              <Popconfirm
                title={`Are you sure you want to change the status to "COMPLETED"?`}
                onConfirm={() => handleChangeStatus("COMPLETED", row)}
              >
                <Tooltip title="Mark as Completed">
                <CheckOutlined/>
                </Tooltip>
              </Popconfirm>
              <Popconfirm
                title={`Are you sure you want to change the status to "REJECTED"?`}
                onConfirm={() => handleChangeStatus("REJECTED", row)}
              >
                <Tooltip title="Mark as Rejected">
                  <CloseOutlined/>
                </Tooltip>
              </Popconfirm>
              <Popconfirm
                title={`Are you sure you want to change the status to "NOT-SETTLED"?`}
                onConfirm={() => handleChangeStatus("NOT_SETTLED", row)}
              >
                <Tooltip title="Mark as Not Settled">
                  <WarningOutlined />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
    {
      title: <TableOutlined />,
      dataIndex: "",
      key: "",
      render: (text, row) => (
        <a href="#" onClick={() => handleAction2(row, "view")}>
          <EyeOutlined />
        </a>
      ),
    },
  ];

  const data_ = [
    {
      key: "1",
      referenceNumber: "REF001",
      clients: "John Doe",
      frozenProducts: "Frozen Vegetables, Frozen Seafood",
      address: "123 Elm Street, New York, USA",
      status: "New",
      view: <EyeOutlined />,
    },
  ];


  return (
    <>
      <Row>
        <Col style={{ flex: 1 }}>
          <Typography.Title level={2}>{t(`${"Delivery Plans"}`)}</Typography.Title>
          <Typography.Paragraph level={3}>
            {t(`${"Track, manage and create tours & sectors."}`)}
          </Typography.Paragraph>
        </Col>
        <Col className="align-items-start d-flex" style={{ gap: 10 }}>
          <Space direction="vertical" size={12}>
            <RangePicker size={10} />
          </Space>

          <Button
            className="align-items-center d-inline-flex"
            icon={<FilterList style={{ width: 18, marginRight: 5 }} />}
            onClick={bodydisplayfun}
          >
            {t("FILTERS")}
          </Button>

          <Button
            type="primary"
            onClick={() =>
              // history.push(addRoute),
              handleAction2(null, "create")
            }
          >
            <PlusOutlined />
            {t("Generate Delivery Plan")}
          </Button>
        </Col>
      </Row>

      {drawerOptions.visible ? (
        <Drawer
          onClose={() => setDrawerOptions({ ...drawerOptions, visible: false })}
          open={drawerOptions.visible}
          title={drawerOptions.title}
          width={w}
        >
          {drawerOptions.mode === "edit" || drawerOptions.mode === "create" ? (
            <MyOrderForm
              handleAction={handleAction2}
              data={data}
              handleClose={handleClose}
              reloadCallback={fetchData}
            />
          ) : (
            <MyOrderDetail handleAction={handleAction2} data={item} />
          )}
        </Drawer>
      ) : null}
      {/* {isPending && <Loading />} */}
      {data && (
        <div style={backgroundColor}>
          <div className="row">
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <Input
                  className="mb-2 ml-2"
                  placeholder="Search"
                  prefix={<SearchOutlined />}
                />

                <Button className="mb-2 ml-2">
                  Status <DownOutlined />
                </Button>
                <Button className="mb-2 ml-2">
                  Show <DownOutlined />
                </Button>

                <Button className="mb-2 ml-2" type="primary">
                  Apply
                </Button>
              </div>
            </div>
            {false && <div className="col-md-6">
              <div className="d-flex justify-content-end align-items-center">
                <Radio.Group
                  options={["Default", "ListView"]}
                  optionType="button"
                  buttonStyle="solid"
                  defaultValue={selectRadio}
                  onChange={(e) => setSelectRadio(e.target.value)}
                />
              </div>
            </div>
            }
          </div>

          <div style={{ width: "100%", backgroundColor: "white" }}>
            <Table
              dataSource={data.data.content??[]}
              loading={Loading}
              columns={columns}
              showSorterTooltip={false}
              onChange={(pagination, filters, sort, extra) => {
                fetchData(pagination, filters, sort, extra);
              }}
              pagination={currentPagination}
              size="middle"
              rowKey="id"
            ></Table>
          </div>
        </div>
      )}

      {isPending && data && <Loading />}
      {error && <div>{error}</div>}
    </>
  );
};

export default MyOrder;