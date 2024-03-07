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
import PartnerForm from './PartnerForm';
import PartnerDetails from './PartnerDetails';

const Partners = () => {
  const [page, setPage] = useState(1);
  const { error, isPending, data } = useFetch('partners?sort=name,asc', page - 1)
  const [partners, setPartners] = useState(null)
  const history = useHistory();
  const [Loading, setLoading] = useState(false)
  const [currentPagination , setCurrentPagination] = useState({
    current : 1,
    pageSize : 20,
    total : 0
  })

  const handleAction = (data) => {
    history.push({
      pathname: 'partners/edit',
      data: data
    })
  }

  const handleDelete = (data) => {
    deleteData('partners/' + data.id)
    let newPartners = partners.data.content.filter(o => o.id !== data.id)
    let data_ = partners.data
    data_.content = newPartners
    setPartners({ ...partners, data: data_ })
  }

  useEffect(() => {
    if (data) {
      setPartners(data)
      setCurrentPagination(
        {
          current : 1 ,
          pageSize : data.data.size,
          total : data.data.totalElements
        }
      )
    }
  }, [data])

  const fetchData = (pagi, filters,sort, extra, currentStatus) => {
    const pagination = pagi || currentPagination;
    setLoading(true);
    const sortColumn = sort?.field || "name";
    const sortDirection = sort?.order
      ? sort.order === "descend"
        ? "desc"
        : "asc"
      : "asc";

    getDataWithParams("partners", {
      sort: `${sortColumn},${sortDirection}`,
      size: pagination.pageSize,
      page: pagination.current - 1,
    })
      .then((response) => {
        if (response.data) {
          setPartners(response.data)
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
      pathname: '/partners/' + data.id,
      data: data
  })
  }
  const fields = [
    {
      key: "name",
      title: "Name",
      dataIndex: "name",
      sorter:true,
      dataRoute: 'id'
      },
    ]

  return (
    <>
      <MainTable addRoute='partners/add'
        title = "Partner"
        HeadingParagraph = "Partners Details"
        addBtnTitle='Add Partner'
        fields={fields}
        data={partners}
        error={error}
        showfilter={false}
        isPending={isPending}
        handleAction={handleAction}
        handleDelete={handleDelete}
        handlePage={handlePage}
        handleView = {productdisplay}
        pagination={currentPagination}
        onChangeCallBack ={fetchData}
        Form_={PartnerForm}
        Details_={PartnerDetails}
        reloadCallback={fetchData}
        />

    </>
  )
}

export default Partners;
