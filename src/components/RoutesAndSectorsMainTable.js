import { useContext, useState } from "react";
import { UserContext } from "../UserProvider";
import { useTranslation } from "react-i18next";
import Loading from "./Loading";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Row,
  Table,
  Drawer,
  Typography,
  Radio,
  Tag,
} from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined, TableOutlined } from "@ant-design/icons";
import { FilterList } from "@material-ui/icons";
import { useStateCallback } from "./useStateCallBack";
import useFetch from "src/hooks/useFetch";
const MainTable = ({
  fields,
  sectorFields,
  data,
  sectorData,
  overRideDelete = true,
  isPending,
  error,
  tableTitle,
  body,
  handleDelete,
  pagination,
  onChangeCallBack,
  Form_,
  Details_,
  details = true,
  typebutton,
  getAsyncData,
  getAsyncSectorsData,
}) => {
  const { data: routeData } = useFetch("delivery-routes", null, 1000);
  const {data: deliveryData} = useFetch("delivery-plans", null, 1000);
  const [item, setItem] = useState(null);
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const [displaybody, setdisplaybody] = useState(false);
  const [route, setRoute] = useState(false);
  const [selectRadio, setSelectRadio] = useState("Routes");
  const [Title, setTitle] = useState("Routes");
  const addRouteTitle = "Add Route";
  const addSectorTitle = "Add Sector";
  let route_ = false

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
  const closeDrawer = () => {
    getAsyncData()
    getAsyncSectorsData()
    setDrawerOptions({ ...drawerOptions, visible: false });
  }
  const [currentPagination, setCurrentPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const handleAction2 = (data, mode) => {
    setItem(data);
    console.log("Data: ",data);
    setDrawerOptions(
      {
        visible: false,
      },
      () => {
        setDrawerOptions(() => ({
          visible: true,
          data: JSON.parse(JSON.stringify(data)),
          id: mode === "create" ? null : data.id,
          mode,
          handleAction: handleAction2,
          title: mode === "edit" ? `Edit ${Title}` : `${route_ ? addRouteTitle : addSectorTitle}`,
        }));

      }
    );
  };

  let add = false;
  let edit = false;
  let del = false;
  let name_ = undefined;
  const checkPermissions = () => {
    user.permissions.forEach((o) => {
      if (o.childList.length > 0) {
        let permissionList = [];
        o.childList.forEach((c) => {
          permissionList.push(c.displayMenu);
        });

        if (permissionList.indexOf(window.location.pathname) !== -1) {
          o.childList.forEach((c) => {
            if (c.displayMenu.startsWith("/add")) {
              add = true;
            }
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
                if (cc.displayMenu.startsWith("/add")) {
                  add = true;
                }
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
    });
  };
  if (!tableTitle) {
    checkPermissions();
  }
  if (edit || del) {
    console.log("fields", fields);
    fields.push({
      title: "Actions",
      dataIndex: "id",
      key: "id",
      render: (params, row) => (
        <>
          {details && (
            <Button
              type="link"
              size="small"
              onClick={() => handleAction2(row, "view")}
            >
              <EyeOutlined />
            </Button>
          )}

          {edit && (
            <>
              {" "}
              <Button
                type="link"
                size="small"
                onClick={() => {
                  handleAction2(row, "edit");
                }}
              >
                <EditOutlined />
              </Button>{" "}
              &nbsp;
            </>
          )}
          {del && (
            <Button
              type="link"
              size="small"
              danger
              onClick={() => {
                if (window.confirm(t("ARE_YOU_SURE_YOU_WANT_TO_DELETE"))) {
                  handleDelete(row);
                }
              }}
            >
              <DeleteOutlined />
            </Button>
          )}
        </>
      ),
    });
  }

  fields.map((field) => {
    field["headerName"] = t(field["headerName"]);
    if (field.field !== "Actions") {
      if (field.dataRoute) {
        field.render = (params, row) => {
          return (
            <Button
              type="link"
              size="small"
              onClick={() => {
                handleAction2(row, "view");
              }}
            >
              {" "}
              <span style={{ textTransform: "uppercase" }}>{params}</span>
            </Button>
          );
        };
      }
    }
  });
  const bodydisplayfun = () => {
    setdisplaybody(!displaybody);
  };

  const fields_ = [
    {
      title: "ROUTES",
      dataIndex: "routeName",
      key: "routeName",
      dataRoute: "id",
    },
    {
      title: "CLIENTS",
      dataIndex: "customers",
      key: "customers",
      dataRoute: "id",
      render: (_, { customers }) => (
        <>
          {customers.map((customer) => {
            let color = "geekblue";
            return (
              <Tag color={color} key={customer}>
                {customer.firstName }&nbsp;{customer.lastName}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: "SECTORS",
      dataIndex: "sector",
      key: "sector",
      render: (sector) => <>{sector.sectorName}</>
    },
    {
      title: <TableOutlined />,
      dataIndex: "edit",
      key: "edit",
      render: (text, row) => {
        const isInDelivery = deliveryData?.data?.content?.map(delivery => delivery.route.id === row.id).includes(true);
        return(
          <>{
          isInDelivery ? (
            <Button
              type="link"
              size="small"
              danger
              onClick={() => {
                if (window.confirm(t("ARE_YOU_SURE_YOU_WANT_TO_DELETE"))) {
                  handleDelete(row,name_="route");
                }
              }}
            >

              <DeleteOutlined />
            </Button>
          )
          :
          (
            <>
          <Button
          type="link"
          size="small"
          onClick={() => {handleAction2(row, "edit");setRoute(true)}}
          >
          <EditOutlined />
          </Button>
          <Button
              type="link"
              size="small"
              danger
              onClick={() => {
                if (window.confirm(t("ARE_YOU_SURE_YOU_WANT_TO_DELETE"))) {
                  handleDelete(row,name_="route");
                }
              }}
            >
              <DeleteOutlined />
            </Button>
        </>
          )
        }
        </>
        )
        /*

      return (
        <>
        <Button
        type="link"
        size="small"
        onClick={() => {handleAction2(row, "edit");setRoute(true)}}
        >
        <EditOutlined />
        </Button>
        <Button
            type="link"
            size="small"
            danger
            onClick={() => {
              if (window.confirm(t("ARE_YOU_SURE_YOU_WANT_TO_DELETE"))) {
                handleDelete(row,name_="route");
              }
            }}
          >
            <DeleteOutlined />
          </Button>
      </>
      )
      */
    },
    },
  ];

  const sectorFields_ = [
    {
      title: "SECTOR NAME",
      dataIndex: "sectorName",
      key: "sectorName",
    },
    {
      title: "CITIES",
      dataIndex: "cityDtos",
      key: "cityDtos",
      render: (_, { cityDtos }) => (
        <>
          {cityDtos.map((city) => {
            let color = "geekblue";
            return (
              <Tag color={color} key={city}>
                {city.cityName}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: <TableOutlined />,
      dataIndex: "edit",
      key: "edit",
      render: (text, row) => {
        const isInRoute = routeData.data.content.map(route => route.sector.id === row.id).includes(true);
        return (
          <>
            {isInRoute ? (
              <Button
                type="link"
                size="small"
                danger
                onClick={() => {
                  if (window.confirm(t("ARE_YOU_SURE_YOU_WANT_TO_DELETE"))) {
                    handleDelete(row);
                  }
                }}
              >
                <DeleteOutlined />
              </Button>
            ) : (
              <>
                <Button
                  type="link"
                  size="small"
                  onClick={() => { handleAction2(row, "edit"); setRoute(false); }}
                >
                  <EditOutlined />
                </Button>
                <Button
                  type="link"
                  size="small"
                  danger
                  onClick={() => {
                    if (window.confirm(t("ARE_YOU_SURE_YOU_WANT_TO_DELETE"))) {
                      handleDelete(row);
                    }
                  }}
                >
                  <DeleteOutlined />
                </Button>
              </>
            )}
          </>
        );
      },

    }
  ];
  return (
    <>
      <Row>
        <Col style={{ flex: 1 }}>
          <Typography.Title level={3}>{t(`${Title}`)}</Typography.Title>
          <Typography.Paragraph>{t(`${Title} Details`)}</Typography.Paragraph>
        </Col>
        <Col className="align-items-start d-flex" style={{ gap: 10 }}>
          <Form.Item name="deliveryDate" rules={[{ required: true }]}>
            <DatePicker
              format={"DD/MM/YYYY"}
              style={{ width: "100%" }}
              defaultValue={null}
            />
          </Form.Item>
          <Button
            className="align-items-center d-inline-flex"
            icon={<FilterList style={{ width: 18, marginRight: 5 }} />}
            onClick={bodydisplayfun}
          >
            {t("FILTERS")}
          </Button>

          <Button
            type="primary"
            className="align-items-center d-inline-flex"
            onClick={() => {
              setRoute(true);
              setTitle("Route")
              route_ = true
              handleAction2(null, "create");
            }}
          >
            {t(addRouteTitle)}
          </Button>
          <Button
            type={typebutton}
            onClick={() => {
              setRoute(false);
              setTitle("Sector")
              route_ = false
              handleAction2(null, "create");
            }}
          >
            {t(addSectorTitle)}
          </Button>
        </Col>
      </Row>
      {/* Adding Drawer */}

      {drawerOptions.visible ? (
        <Drawer
          onClose={() => setDrawerOptions({ ...drawerOptions, visible: false })}
          open={drawerOptions.visible}
          title={drawerOptions.title}
          width={w}
        >
          {
            drawerOptions.mode === 'edit' || drawerOptions.mode ==="create" ?
            (
              <Form_
                handleAction={handleAction2}
                data={item}
                isRoute={route}
                closeDrawer={closeDrawer}
                setRadio={setSelectRadio}
              />
            ) : (
              <Details_ data={item} />
            )
          }
        </Drawer>
      ) : null}

      {displaybody && body}
      {isPending && <Loading />}
      {data && (
        <div style={{ width: "100%", backgroundColor: "white" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <DatePicker
                format={'DD/MM/YYYY'}
                style={{ width: '200px', margin: '20px 5px', marginLeft: '20px' }}
                placeholder="Search"
              />
              <DatePicker
                format={'DD/MM/YYYY'}
                style={{ width: '100px', margin: '10px' }}
                placeholder="Status"
              />
              <DatePicker
                format={'DD/MM/YYYY'}
                style={{ width: '100px', margin: '10px' }}
                placeholder="Show All"
              />
              <Button
                className="align-items-center d-inline-flex"
                type="primary"
                // onClick= {bodydisplayfun}
              >
                Apply
              </Button>
            </div>
            <Radio.Group
              className=" align-items-center d-inline-flex mr-3"
              type="primary"
              options={['Routes', 'Sectors']}
              optionType="button"
              buttonStyle="solid"
              defaultValue={selectRadio}
              value={selectRadio}
              onChange={(e) => {setSelectRadio(e.target.value);setTitle(e.target.value)}}
            />
          </div>

          {selectRadio==="Routes" &&
          <>
            <Table
              dataSource={data?.data ? data?.data?.content : data}
              columns={fields_}
              showSorterTooltip={false}
              onChange={(pagination, filters, sort, extra) => {
                onChangeCallBack(pagination, filters, sort, extra);
              }}
              pagination={currentPagination}
              key="id"
            ></Table>
          </>
          }
          {selectRadio==="Sectors" &&
          <>
            <Table
              dataSource={sectorData?.data ? sectorData?.data?.content : sectorData}
              columns={sectorFields_}
              showSorterTooltip={false}
              onChange={(pagination, filters, sort, extra) => {
                onChangeCallBack(pagination, filters, sort, extra);
              }}
              pagination={currentPagination}
              key="id"
            ></Table>
          </>
          }
        </div>
      )}
      {isPending && data && <Loading />}
      {/* {data && data.data &&<CorePagination totalPages={data.data.totalPages}  parentCallback={handlePage} />} */}
      {error && <div>{error}</div>}
    </>
  );
};

export default MainTable;
