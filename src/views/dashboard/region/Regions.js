import { useState, useEffect } from 'react';
import { useHistory } from 'react-router'
import useFetch from '../../../hooks/useFetch'
import MainTable from '../../../components/MainTable3'
import { deleteData , getDataWithParams } from '../../../services/NetworkService';

import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Form
} from "antd";
import RegionForm from './RegionForm';

const Regions = () => {
  const [page, setPage] = useState(1);
  const { error, isPending, data } = useFetch('regions?sort=name,asc', page - 1)
  const [regions, setRegions] = useState(null)
  const history = useHistory();
  const [isLoading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [currentPagination, setCurrentPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const fetchData = (pagi, filters, sort, extra, currentStatus) => {
    const pagination = pagi || currentPagination;
    setLoading(true);
    const sortColumn = sort?.field || "name";
      const sortDirection = sort?.order
        ? sort.order === "descend"
          ? "desc"
          : "asc"
        : "asc";
    getDataWithParams("regions", {
      ...form.getFieldsValue(),
      sort: `${sortColumn},${sortDirection}`,
      size: pagination.pageSize,
      page: pagination.current - 1,
    })
      .then((response) => {
        if (response.data) {
          setRegions(response.data);
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
      pathname: 'regions/edit',
      data: data
    })
  }
 let view =false ;
  const handleDelete = (data) => {
    deleteData('regions/' + data.id)
    let newRegions = regions.data.content.filter(o => o.id !== data.id)
    let data_ = regions.data
    data_.content = newRegions
    setRegions({ ...regions, data: data_ })
  }


  useEffect(() => {
    if (data) {
      setRegions(data)
      setCurrentPagination({
        current: 1,
        pageSize: data.data.size, total: data.data.totalElements
      })
    }
  }, [data])

  const handlePage = (page) => {
    setPage(page);
  };
   const fields =
   [
    {
    title  : "Region",
    dataIndex : "name",
    key : "name",
    render : ((e)=>{
       return e.toUpperCase();
    })
   },
   {
   title  : "Responsible",
    dataIndex : "chiefName",
    key : "cheifName",

   }]


  return (
    <MainTable addRoute='regions/add'
      addBtnTitle='Add Region'
      HeadingParagraph = "Regions Details"
      fields={fields}
      data={regions}
      error={error}
      isPending={isPending}
      handleAction={handleAction}
      handleDelete={handleDelete}
      handlePage={handlePage}
      view = {view}
      onChangeCallBack={fetchData}
      pagination = {currentPagination}
      title={"Regions"}
      Form_ = {RegionForm}
      details={false}
      reloadCallback={fetchData}
      />
  )
}

export default Regions

// const fields = [
//   { field: 'name', headerName: 'Region', flex: 1 },
//   { field: 'chiefName', headerName: 'Responsible', flex: 1 },
// ]

