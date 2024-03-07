import { useState, useEffect } from 'react';
import { useHistory } from 'react-router'
import useFetch from '../../../hooks/useFetch'
import MainTable from '../../../components/MainTable3'
import { useTranslation } from 'react-i18next'
import { deleteData , getDataWithParams } from '../../../services/NetworkService';


import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Form
} from "antd";
import AgencyForm from './AgencyForm';
import AgencyDetails from './AgencyDetails';
const Agencies = () => {
  const [page, setPage] = useState(1);
  const [isLoading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { error, isPending, data } = useFetch('agencies?sort=name,asc', page - 1)
  const history = useHistory();
  const [agencies, setAgencies] = useState(null)
  const { t } = useTranslation();
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
          setAgencies(response.data);
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

  const handleAction = (data) => {
    history.push({
      pathname: 'agencies/edit',
      data: data
    })
  }
  const handleDelete = (data) => {
    deleteData('agencies/' + data.id)
    let newAgencies = agencies.data.content.filter(o => o.id !== data.id)
    let data_ = agencies.data
    data_.content = newAgencies
    setAgencies({ ...agencies, data: data_ })
}

useEffect(() => {
    if (data) {
        setAgencies(data)
        setCurrentPagination({
          current: 1,
          pageSize: data.data.size, total: data.data.totalElements
        })
    }
}, [data])

  const handlePage = (page) => {
    setPage(page);
  };
  const productdisplay = (data) => {
    history.push({
      pathname: '/agencies/' + data.data.id,
      data: data
  })
  }
  const fields = [
    {
      title : "Agency",
      dataIndex : "name",
      key : "name",
      dataRoute : "id",

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
      title : "Director",
      dataIndex : "directorName",
      key : "directorName",
    },
    {
      title : "City",
      dataIndex : "addressDto",
      key : "addressDto",
    render : ((params , rows)=>{
      return  params.city;
    })
    },
  ]

  return (
    <MainTable addRoute='agencies/add'
      addBtnTitle='Add Agency'
      fields={fields}
      data={agencies}
      error={error}
      isPending={isPending}
      handleDelete={handleDelete}
      handleAction={handleAction}
      handlePage={handlePage}
      handleView={productdisplay}
      onChangeCallBack={fetchData}
      pagination={currentPagination}
      title={"Agencies"}
      Form_={AgencyForm}
      Details_={AgencyDetails}
      reloadCallback={fetchData}
      />
  )
}

export default Agencies

// const fields = [

//   { field: 'name', headerName: 'Agency', dataRoute: 'agencies', dataId: 'id', flex: 1 },
//   { field: 'directorName', headerName: 'Director',dataRoute: 'employees', dataId: 'agencyDirectoryId', flex: 1 },


//   {
//     field: 'addressDto',
//     headerName: 'City',
//     flex: 1,
//     valueFormatter: (params) =>
//      params.value && params.value.city
//   },
// ]
