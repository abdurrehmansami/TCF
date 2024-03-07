import { useState, useEffect } from 'react';
import { useHistory } from 'react-router'
import useFetch from '../../../hooks/useFetch'
import MainTable from '../../../components/MainTable3'
import { Formik } from "formik";
import { useTranslation } from 'react-i18next'
import { getData, deleteData,getDataWithParams } from '../../../services/NetworkService';
import { MyTextField, MySelectField, MuiAutocomplete } from '../../../components/FormFields'
import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Form
} from "antd";
import EmployeeForm from './EmployeeForm';
import EmployeeDetails from './EmployeeDetails';


const Employees = () => {
  const [page, setPage] = useState(1);
  const { error, isPending, data } = useFetch('employees?sort=name,asc', page - 1)
  const history = useHistory();
  const { t } = useTranslation();
  const { data: jobs } = useFetch('jobs', null, 1000)
  const { data: agn } = useFetch('agencies', null, 1000)
  const [employees, setEmployees] = useState(null)
  const [form] = Form.useForm();
  const [isLoading, setLoading] = useState(false);
  const [currentPagination, setCurrentPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  })
  

  const handleAction = (data) => {
    history.push({
      pathname: 'employees/edit',
      data: data
    })
  }
  const handleDelete = (data) => {
    deleteData('employees/' + data.id)
    let newEmployees = employees.data.content.filter(o => o.id !== data.id)
    let data_ = employees.data
    data_.content = newEmployees
    setEmployees({ ...employees, data: data_ })
  }
  const handlePage = (page) => {
    setPage(page);
  };

  useEffect(() => {
    if (data) {
      setEmployees(data)
      setCurrentPagination({
        current: 1,
        pageSize: data.data.size, total: data.data.totalElements
      })
    }

  }, [data])
  const productdisplay = (data) => {

    history.push({
      pathname: '/employees/' + data.id,
      data: data
  })
  }
  const productdisplay2 = (data) => {
    history.push({
      pathname: '/agencies/' + data.data.id,
      data: data
  })
  }
   const fields = [
    {
      title : "Full Name",
      dataIndex  :"fullname",
      key : "fullname",
      dataRoute : "id",
      render : (params , row)=>{
       return (
        <Button
        type='link'
        size="small"
        onClick={()=>{productdisplay(row)}}
        >
          <span style={{textTransform :"uppercase" }}>{params}</span>

        </Button>
       )
      }
    },
    {
      title : "Agency",
      dataIndex  :"agencyName",
      key : "agencyName",
      dataRoute : "id",
  
   
      render : ((params , rows)=>{
        return(
          <Button
          type='link'
          size='small'

          onClick={()=>{productdisplay2(rows)}}
          >
           <span style={{textTransform : "uppercase"}}>{params}</span>
          </Button>
        )
      })
    },
    {
      title : "Function",
      dataIndex  :"jobName",
      key : "jobName",
    },
    {
      title : "Grade",
      dataIndex  :"sellerQualification",
      key : "sellerQualification",
    }


   ]
   const fetchData = (pagi, filters, sort, extra, currentStatus) => {
    const pagination = pagi || currentPagination;
    setLoading(true);
    const sortColumn = sort?.field || "name";
    const sortDirection = sort?.order
      ? sort.order === "descend"
        ? "desc"
        : "asc"
      : "asc";

    getDataWithParams("employees", {
      ...form.getFieldsValue(),
      sort: `${sortColumn},${sortDirection}`,
      size: pagination.pageSize,
      page: pagination.current - 1,
    })
      .then((response) => {
        if (response.data) {
          setEmployees(response.data);
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

  return (
    <MainTable addRoute='/employees/add'
      addBtnTitle='Add Employee'
      fields={fields}
      data={employees}
      error={error}
      isPending={isPending}
      handleDelete={handleDelete}
      handleAction={handleAction}
      handlePage={handlePage}
      handleView={productdisplay}
      title = "Employes"
      HeadingParagraph  ="Employes details "
      pagination={currentPagination}
      onChangeCallBack={fetchData}
      showfilter = {true}
      Form_={EmployeeForm}
        Details_={EmployeeDetails}
        reloadCallback={fetchData}
      body={
        <div style={{marginTop : "30px"}}>

<Card style={{ marginBottom: 20 }}>
                        <Form form={form} layout="vertical" onFinish={() => fetchData()}>
                          <Form.Item shouldUpdate noStyle>
                            {() => (
                              <>
                                <Row gutter={20}>
                                  <Col xs={24} md={12}>
                                    <Form.Item name={"firstName"} label={t("FIRST NAME ")}>
                                      <Input placeholder={t("FIRST NAME ")} />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} md={12}>
                                    <Form.Item name={"lastName"} label={t("LAST NAME")}>
                                      <Input placeholder={t("LAST NAME ")} />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} md={12}>
                                    <Form.Item name={"email"} label={t("EMAIL")}>
                                      <Input placeholder={t("EMAIL")} />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} md={12}>
                                    <Form.Item name={"phone"} label={t("PHONE")}>
                                      <Input placeholder={t("PHONE")} />
                                    </Form.Item>
                                  </Col>
                                </Row>
                                <Form.Item noStyle>
                                  <Button type="primary" htmlType="submit">
                                    {t("SEARCH")}
                                  </Button>
                                </Form.Item>
                              </>
                            )}
                          </Form.Item>
                        </Form>
                      </Card>
      
        </div>}
    />
  )
}

export default Employees


