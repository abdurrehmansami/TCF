import React, { useState } from "react";
import { Table, Breadcrumb, Button, Card, Row, Col, Modal, Spin } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { HomeFilled, MinusCircleOutlined } from "@ant-design/icons";
import { Link } from "@material-ui/core";
import useFetch from "src/hooks/useFetch";
import { useEffect } from "react";
import { getData, postData } from "src/services/NetworkService";
import ProductCategory from "./components/ProductCategory";
import RouteDetailsCard from "./components/RoutesDetailsCard";
import TruckCard from "./components/TruckCard";
import toast from "react-hot-toast";
import DragDropOrders from "./DragDropOrders";
import { useHistory } from "react-router-dom";
function MyOrderForm({ handleClose,reloadCallback }) {
  const { data: routeData } = useFetch("delivery-routes", null, 1000);
  const [selectedTrucks, setSelectedTrucks] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [routeOrders, setRouteOrders] = useState(null);

  const [isRouteSelected, setIsRouteSelected] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [productTable, setProductTable] = useState(false);
  const [initialData, setInitialData] = useState(true);

  const [selectedRouteDetails, setSelectedRouteDetails] = useState(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isHovered, setHovered] = useState(false);

  const [isLoading, setLoading] = useState(false);
  const history = useHistory();
  const handleTruckSelect = (truck) => {
    console.log(selectedTrucks, truck);
    if (selectedTrucks?.type === truck.type) {
      setSelectedTrucks(null);
    } else {
      setSelectedTrucks(truck);
    }
  };

  useEffect(() => {
    if (routeData) {
      setRoutes(routeData?.data?.content);
    }
    console.log("Route Detail: "+routes);
  }, [routeData]);

  const handleRouteSelect = async (routeId) => {
    if (selectedRoute === routeId)
      return;
    setLoading(true);
    let data = await getData(`delivery-routes/${routeId}/orders`);
    let routeData_ = data?.data?.data;
    setRouteOrders(routeData_);
    selectedRoute === routeId
    ? setSelectedRoute(null)
    : setSelectedRoute(routeId);
    isRouteSelected ? setIsRouteSelected(false):setIsRouteSelected(true);
    setLoading(false);
    setIsRouteSelected(true);

  };

  // Handle item drag-and-drop
  const handleDragEnd = (result) => {
    if (!result.destination) return; // Dropped outside the list

    const reorderedData = Array.from(routeOrders.orders);
    const [movedItem] = reorderedData.splice(result.source.index, 1);
    reorderedData.splice(result.destination.index, 0, movedItem);

    setRouteOrders({ ...routeOrders, orders: reorderedData });
  };
  const handleDeleteRow = (id) => {
    Modal.confirm({
      title: "Confirm Deletion",
      content: "Are you sure you want to delete this row?",
      onOk: () => {
        const updatedData = routeOrders.orders.filter((item) => item.id !== id);
        setRouteOrders({ ...routeOrders, orders: updatedData });
      },
    });
  };
  const DraggableRow = ({ children, ...props }) => {
    console.log(children, props);
    let index = children?.[0]?.props?.index;
    return (
      <Draggable
        draggableId={props?.["data-row-key"]?.toString()}
        index={index}
      >
        {(provided) => (
          <tr
            {...props}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            {children}
          </tr>
        )}
      </Draggable>
    );
  };
  const columns = [
    {
      title: "",
      dataIndex: "delete",
      key: "delete",
      render: (_, record) => (
          <MinusCircleOutlined
            style={{ color: "red", cursor: "pointer" }}
            onClick={() => handleDeleteRow(record.id)}
          />
      ),
    },
    {
      title: "Delivery Number",
      dataIndex: "id",
      key: "id",
      render: (text) => (
          <Link href="/dashboard/sales/MyOrder/MyOrderDetail">
            <b>{text}</b>
          </Link>
      ),
    },
    {
      title: "Order Number",
      dataIndex: "id",
      key: "id",
      render: (text) => (
        <Link href="/dashboard/sales/MyOrder/MyOrderDetail">
          <b>{text}</b>
        </Link>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Address",
      dataIndex: "customerAddress",
      key: "customerAddress",
      render: (text) => <b>{text}</b>,
    },
  ];

  const isNextButtonDisabled = !selectedRoute || !selectedTrucks;

  const nextClicked = async () => {
    setLoading(true);
    let data_ = await getData(`delivery-routes/${selectedRoute}/orders`);
    console.log(selectedRoute, routes);
    console.log("data_", data_);
    const selectedRouteObject = routes.find(
      (route) => route.id === selectedRoute
    );
    console.log(selectedRouteObject);
    setSelectedRouteDetails({
      route: selectedRouteObject,
      category: selectedCategory,
      truck: selectedTrucks?.type,
    });
    setProductTable(true);
    setInitialData(false);
    setCurrentStep((prevStep) => prevStep + 1);
    setLoading(false);
  };

  const goBack = () => {
    setProductTable(false);
    setInitialData(true);
  };

  const inlineStyle = {
    color: isHovered ? "red" : "black",
    fontWeight: isHovered ? "bold" : "normal",
    textDecoration: isHovered ? "underline" : "none",
    cursor: "pointer",
  };

  const handleSubmit = () => {
    let data = selectedRouteDetails;
    data.orders = routeOrders.orders;
    if (selectedRouteDetails.truck === "FROZEN") {
      data.frozen_count = routeOrders.orders.reduce((acc, curr) => acc + (curr.frozenQuantity ?? 0), 0);
    } else if (selectedRouteDetails.truck === "FRESH") {
      data.fresh_count = routeOrders.orders.reduce((acc, curr) => acc + (curr.freshQuantity ?? 0), 0);
    } else if (selectedRouteDetails.truck === "AMBIENT") {
      data.ambient_count = routeOrders.orders.reduce((acc, curr) => acc + (curr.ambientQuantity ?? 0), 0);
    }
    data.truck_no_plate = "";
    data.truck_type = selectedRouteDetails.category;
    data.status = 'NEW'
    console.log("data", data);
    postData("delivery-plans", data)
      .then((res) => {
        console.log("res", res);
        if (res.status === 200 || res.status === 201) {
          toast.success("Plan added successfully!");
          handleClose();
          reloadCallback();
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong!");
        handleClose();
        reloadCallback();
      });
  };

  const isOrderAvailable = routeOrders && routeOrders?.orders?.length > 0;

  return (
    <>

      <Breadcrumb
        separator=">"
        style={{ fontWeight: "bold", fontSize: "16px" }}
      >
        <Breadcrumb.Item>
          <HomeFilled />
          <span style={{ marginLeft: "8px", verticalAlign: "middle" }}>
            Home
          </span>
        </Breadcrumb.Item>
        {console.log("routesOrders", routeOrders)}
        {currentStep > 0 && (
          <Breadcrumb.Item
            onClick={goBack}
            style={inlineStyle}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <span
              style={{
                marginLeft: "8px",
                verticalAlign: "middle",
                cursor: "pointer",
              }}
            >
              Roads
            </span>
          </Breadcrumb.Item>
        )}

        {currentStep > 1 && (
          <Breadcrumb.Item
            style={{ cursor: "pointer", textDecoration: "underline" }}
            className="clickable-breadcrumb"
          >
            <span style={{ marginLeft: "8px", verticalAlign: "middle" }}>
              Road Generated
            </span>
          </Breadcrumb.Item>
        )}
      </Breadcrumb>
      <br />

      {isLoading && <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <Spin spinning={isLoading} />
      </div>}

      {initialData && (
        <div>
          <div>
            <h4>Select a Route</h4>
            <div
              style={{
                background: "#f4f4f4",
                padding: "10px",
                borderRadius: "8px",
              }}
            >
              <Row gutter={16}>
                {
                  routes.length === 0 &&
                  <div style={{ display: "flex", flexDirection: "column", flexWrap:'wrap', alignItems: "center",alignContent:'center', justifyContent: "center", minHeight: "20vh",}}>
                    <h3>No Routes Found</h3>
                    <Button type="primary" onClick={() => {history.push("/sales-orders")}}>Create Route</Button>
                  </div>
                }
                {routes.map((route) => (
                  <Col key={route.id.toString()} md={4} sm={12}>
                    <Card
                      title={route.routeName}
                      style={{
                        width: "100%",
                        margin: "8px 0",
                        border: "1px solid #d9d9d9",
                        borderRadius: "8px",
                        cursor: "pointer",
                        boxShadow:
                          selectedRoute === route.id
                            ? "0px 0px 2px 2px blue"
                            : "none",
                      }}
                      onClick={() => handleRouteSelect(route.id)}
                    >
                      <div className="ml-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="3em"
                          viewBox="0 0 512 512"
                        >
                          <path d="M416 320h-96c-17.6 0-32-14.4-32-32s14.4-32 32-32h96s96-107 96-160-43-96-96-96-96 43-96 96c0 25.5 22.2 63.4 45.3 96H320c-52.9 0-96 43.1-96 96s43.1 96 96 96h96c17.6 0 32 14.4 32 32s-14.4 32-32 32H185.5c-16 24.8-33.8 47.7-47.3 64H416c52.9 0 96-43.1 96-96s-43.1-96-96-96zm0-256c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zM96 256c-53 0-96 43-96 96s96 160 96 160 96-107 96-160-43-96-96-96zm0 128c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z" />
                        </svg>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </div>
          {console.log("routes", routeOrders)}
          {isRouteSelected && isOrderAvailable ? (
            <>
            <div>
              <h4>Select a Product Category</h4>
              <div
                style={{
                  background: "#f0f0f0",
                  padding: "10px",
                  borderRadius: "8px",
                }}
              >
                <ProductCategory
                  name={"FROZEN PRODUCTS"}
                  quantity={routeOrders.totalFrozenProductQuantity}
                  onClick={() => {
                    setSelectedCategory("FROZEN");
                  }}
                  selected={selectedCategory === "FROZEN"}
                />
                <ProductCategory
                  name={"FRESH PRODUCTS"}
                  quantity={routeOrders.totalFreshProductQuantity}
                  onClick={() => {
                    setSelectedCategory("FRESH");
                  }}
                  selected={selectedCategory === "FRESH"}
                />
                <ProductCategory
                  name={"AMBIENT PRODUCTS"}
                  quantity={routeOrders.totalAmbientProductCount}
                  onClick={() => setSelectedCategory("AMBIENT")}
                  selected={selectedCategory === "AMBIENT"}
                />
              </div>
            </div>


            <div>
              <h4>Select a Truck</h4>
              <div
                style={{
                  background: "#f0f0f0",
                  padding: "10px",
                  borderRadius: "8px",
                }}
              >
                <Row gutter={16}>
                  {Trucks.filter(o => routeOrders?.totalAmbientProductCount === 0 ? o.type !== 'AMBIENT' : o.type !== 'A' )
                  .filter(o => routeOrders?.totalFreshProductQuantity === 0 ? o.type !== 'FRESH' : o.type !== 'A' )
                  .filter(o => routeOrders?.totalFrozenProductQuantity === 0 ? o.type !== 'FROZEN' : o.type !== 'A' )
                  .filter(o => (routeOrders?.totalAmbientProductCount === 0 && routeOrders?.totalFreshProductQuantity === 0) ? o.type !== 'FRESH_AND_AMBIENT' : o.type !== 'A' )
                  .map((truck) => (
                    <>
                      {console.log("truck", truck)}
                      <TruckCard
                        truck={truck}
                        onClick={() => {handleTruckSelect(truck);}}
                        selected={selectedTrucks?.id == truck.id}
                      />
                    </>
                  ))}
                </Row>
              </div>
            </div>

          <br />
          <div className="row">
            <div className="col-md-6">
              <Button
                type="default"
                block
                onClick={() => {
                  handleClose();
                }}
              >
                Cancel
              </Button>
            </div>
            <div className="col-md-6">
              <Button
                type="primary"
                className="mr-1"
                block
                disabled={isNextButtonDisabled}
                onClick={nextClicked}
              >
                Next
              </Button>
            </div>
          </div>

          </>
          ) : isRouteSelected ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
              <h3>No Orders Found</h3>
            </div>
          ) : null
          }
        </div>

      )}
      {productTable && (
        <div>
          <div
            style={{
              background: "#f4f4f4",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            {selectedRouteDetails && (
              <RouteDetailsCard routeDetails={selectedRouteDetails} />
            )}
            <br />
            <h4>Adjust deliveries order</h4>
            <br />

            {/* <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="table">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    <Table
                      dataSource={routeOrders.orders.filter(o => (selectedRouteDetails.truck_type === 'FRESH' ? o.freshQuantity > 0 :
                                      (selectedRouteDetails.truck_type === 'FROZEN' ? o.frozenQuantity > 0 :
                                      (selectedRouteDetails.truck_type === 'FRESH_AND_AMBIENT') ? (o.freshQuantity > 0 || o.ambientQuantity > 0) :
                                      o.ambientQuantity > 0)))}
                      columns={columns}
                      pagination={false}
                      rowKey="id"
                      components={{
                        body: {
                          row: (props) => {
                            return <DraggableRow {...props} />;
                          },
                        },
                      }}
                    />
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext> */}
            <DragDropOrders
              data={routeOrders.orders.filter(o => (selectedRouteDetails.truck_type === 'FRESH' ? o.freshQuantity > 0 :
                                      (selectedRouteDetails.truck_type === 'FROZEN' ? o.frozenQuantity > 0 :
                                      (selectedRouteDetails.truck_type === 'FRESH_AND_AMBIENT') ? (o.freshQuantity > 0 || o.ambientQuantity > 0) :
                                      o.ambientQuantity > 0)))}
              columns={columns}
              handleDragEnd={handleDragEnd}
            />

            <br />
          </div>
          <br />
          <br />
          <br />
          <br />
          <div className="row">
            <div className="col-md-6">
              <Button
                type="default"
                block
                onClick={() => {
                  handleClose();
                }}
              >
                Cancel
              </Button>
            </div>
            <div className="col-md-6">
              <Button
                type="primary"
                className="mr-1"
                block
                onClick={() => {
                  Modal.confirm({
                    title: "Are you sure you want to continue?",
                    onOk: () => {
                      handleSubmit();
                    },
                  });
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MyOrderForm;

const Trucks = [
  { id: "0", name: "Frozen Truck", type: "FROZEN" },
  { id: "1", name: "Fresh Truck", type: "FRESH" },
  { id: "2", name: "Ambient Truck", type: "AMBIENT" },
  { id: "3", name: "Fresh & Ambient Truck", type: "FRESH_AND_AMBIENT" },
];
