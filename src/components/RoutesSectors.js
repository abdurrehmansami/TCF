import { useState, useEffect } from "react";
import { useHistory } from "react-router";
import useFetch from "src/hooks/useFetch";
import RoutesAndSectorsMainTable from "./RoutesAndSectorsMainTable";
import RouteSectorForm from "./RouteSectorForm";
import { getDataWithParams, deleteData, getData } from "src/services/NetworkService";
import { Tag, Button } from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined, TableOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
const TourSector = () => {
  const { data: routeData } = useFetch("delivery-routes");
  const { data: sectorData } = useFetch("delivery-sectors");
  const [routes, setRoutes] = useState(null);
  const [sectors, setSectors] = useState(null);
  const { t } = useTranslation;
  useEffect(() => {
    if (routeData) {
      setRoutes(routeData?.data?.content);
    }
    console.log("routeData", routes);

  }, [routeData]);

  useEffect(() => {
    if (sectorData) {
      setSectors(sectorData?.data?.content);
    }
    console.log("sectorData", sectors);
  }, [sectorData]);

  const getAsyncRoutesData = async () => {
    getData("delivery-routes").then((response) => {
      if (response.data) {
        setRoutes(response.data.data.content);
      }
    }
    );
  }
  const getAsyncSectorsData = async () => {
    getData("delivery-sectors").then((response) => {
      if (response.data) {
        setSectors(response.data.data.content);
      }
    }
    );
  }

  const [page, setPage] = useState(1);
  const { error, isPending, data } = useFetch("partners", page - 1);
  const [partners, setPartners] = useState(null);
  const history = useHistory();
  const [Loading, setLoading] = useState(false);
  const [currentPagination, setCurrentPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const handleAction = (data) => {
    history.push({
      pathname: "partners/edit",
      data: data,
    });
  };

  const handleDelete = (data, name_) => {
    console.log("data", data);
    if (name_ === null || name_ === undefined) {
      deleteData("delivery-sectors/" + data.id).then(() => {
        let newSectors = sectors.filter((o) => o.id !== data.id);
        setSectors(newSectors);
      });
    }
    else {
      deleteData("delivery-routes/" + data.id).then(() => {
        let newRoutes = routes.filter((o) => o.id !== data.id);
        setRoutes(newRoutes);
      })
    }
  };

  useEffect(() => {
    if (data) {
      setPartners(data);
      setCurrentPagination({
        current: 1,
        pageSize: data.data.size,
        total: data.data.totalElements,
      });
    }
  }, [data]);

  const fetchData = (pagi, filters, sort, extra, currentStatus) => {
    const pagination = pagi || currentPagination;
    setLoading(true);
    const sortColumn = sort?.field || "name";
    const sortDirection = sort?.order
      ? sort.order === "descend"
        ? "desc"
        : "asc"
      : "desc";

    getDataWithParams("partners", {
      sort: `${sortColumn},${sortDirection}`,
      size: pagination.pageSize,
      page: pagination.current - 1,
    })
      .then((response) => {
        if (response.data) {
          setPartners(response.data);
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

  const handlePage = (page) => {
    setPage(page);
  };
  const productdisplay = (data) => {
    history.push({
      pathname: "/partners/" + data.id,
      data: data,
    });
  };
  const fields = [
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
                {customer.firstName}&nbsp;{customer.lastName}
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
      render: (text, row) => (
        <>
          <Button
            type="link"
            size="small"
            onClick={() => handleAction(row, "edit")}
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
      ),
    },
  ];
  const sectorFields = [
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
      render: (text, row) => (
        <>
          <Button
            type="link"
            size="small"
            onClick={() => handleAction(row, "edit")}
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
      ),
    },
  ];
  return (
    <>
      <RoutesAndSectorsMainTable
        addRoute="/tourSector/add"
        getAsyncData={getAsyncRoutesData}
        getAsyncSectorsData={getAsyncSectorsData}
        fields={fields}
        sectorFields={sectorFields}
        data={routes}
        sectorData={sectors}
        error={error}
        isPending={isPending}
        handleAction={handleAction}
        handleDelete={handleDelete}
        handlePage={handlePage}
        handleView={productdisplay}
        pagination={currentPagination}
        onChangeCallBack={fetchData}
        Form_={RouteSectorForm}
        date={true}
        typebutton="primary"
      />
    </>
  );
};

export default TourSector;
