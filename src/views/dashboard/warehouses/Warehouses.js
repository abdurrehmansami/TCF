import MainTable from '../../../components/MainTable3'
import { useState, useEffect } from 'react';
import { deleteData , getData, getDataWithParams } from '../../../services/NetworkService';
import { useHistory } from 'react-router'
import useFetch from '../../../hooks/useFetch'
import { useTranslation } from 'react-i18next'
import {
    Button,
    Card,
    Col,
    Input,
    Row,
    Form
  } from "antd";
import WarehouseForm from './WarehouseForm';
import WarehouseDetail from './WarehouseDetail';

const Warehouses = () => {
    const [page, setPage] = useState(1);
    const { error, isPending, data } = useFetch('locations?sort=name,asc', page - 1)
    const [categories, setCategories] = useState(null)
    const [Loading, setLoading] = useState(false)
    const history = useHistory();
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [currentPagination , setCurrentPagination] = useState({
      current : 1,
      pageSize : 20,
      total : 0
    })

    const fetchData = (pagi, filters, sort, extra, currentStatus) => {
      const pagination = pagi || currentPagination;
      setLoading(true);
      const sortColumn = sort?.field || "name";
      const sortDirection = sort?.order
        ? sort.order === "descend"
          ? "desc"
          : "asc"
        : "asc";

      getDataWithParams("locations?", {
        sort: `${sortColumn},${sortDirection}`,
        size: pagination.pageSize,
        page: pagination.current - 1,
      })
        .then((response) => {
          if (response.data) {
            setCategories(response.data)
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
    const handleAction = (data) => {
        history.push({
            pathname: 'warehouses/edit',
            data: data
        })
    }
    const productdisplay = (data) => {
        history.push({
          pathname: '/warehouses/' + data.id,
          data: data
      })
      }

    const handleDelete = (data) => {
        deleteData('warehouses/' + data.id)
        let newCategories = categories.data.content.filter(o => o.id !== data.id)
        let data_ = categories.data
        data_.content = newCategories
        setCategories({ ...categories, data: data_ })
        setCurrentPagination({...currentPagination,total:--currentPagination.total});
    }

    useEffect(() => {
        if (data) {
            setCategories(data)
            setCurrentPagination({
              current: 1,
              pageSize: data.data.size, total: data.data.totalElements
            })
        }
    }, [data])

    const handlePage = (page) => {
        setPage(page);
    };

    const fields = [
        {
          key: "name",
          title: "Name",
          dataIndex: "name",
          sorter:true,
          dataRoute: 'id',
          render: (params , row) => {
            return (
              <Button
              type="link"
              size="small"
              onClick={()=>{ productdisplay(row)}}
              > <span style={{textTransform :"uppercase" }}>{params}</span></Button>
            )
          },

          },
          {
            key: "address",
            title: "Address",
            dataIndex: "address",
            render: (a) => {
              return <span style={{textTransform :"uppercase" , fontWeight :"450" ,    color: "rgba(0, 0, 0, 0.88)" ,fontSize: "13px"
              }}>{a}</span>;
            },
          },
        ]
    return (
        <MainTable addRoute='warehouses/add'
            addBtnTitle='Add Site'
            onChangeCallBack={fetchData}
            fields={fields}
            data={categories}
            error={error}
            isPending={isPending}
            pagination={currentPagination}
            handleDelete={handleDelete}
            handleAction={handleAction}
            handlePage={handlePage}
            title = "Sites"
            HeadingParagraph = "Site Deatils"
            handleView={productdisplay}
            Form_={WarehouseForm}
            Details_={WarehouseDetail}
            reloadCallback={fetchData}
             />
    )
}
export default Warehouses;
// const fields = [

//     { field: 'name', headerName: 'Name', dataRoute: 'warehouses', dataId: 'id', flex: 1 },
//     { field: 'address', headerName: 'Address', flex: 1 },

// ]
