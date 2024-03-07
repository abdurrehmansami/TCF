import MainTable from '../../../components/MainTable3'
import { useState, useEffect } from 'react';
import useFetch from '../../../hooks/useFetch'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import { deleteData, getData, postData, putData , getDataWithParams } from '../../../services/NetworkService';
import { MyDateField} from '../../../components/FormFields'
// import { Formik, Form } from "formik";
import {useLocation} from "react-router-dom";
import moment from 'moment'
import toast from 'react-hot-toast'
import { IconButton, Box } from '@material-ui/core'
import {CIcon} from "@coreui/icons-react"
import Loading from 'src/components/Loading';
import {
  UnorderedListOutlined,
  ArrowRightOutlined,
  EditOutlined,
  LockOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Form,
  DatePicker,
  Modal,
} from "antd";

const StockCount = () => {
    const search = useLocation().search;
    const [page, setPage] = useState(1);
    const { error, isPending, data } = useFetch('stock-counts', page - 1, 20, null, null, 'createdOn,desc')
    const [stockCounts, setStockCounts] = useState(null)
    const [loader, setLoader] = useState(true)
    const { t } = useTranslation();
    const history = useHistory();
    const [form] = Form.useForm();
    const [isLoading, setLoading] = useState(false);
    const [currentPagination, setCurrentPagination] = useState({
      current: 1,
      pageSize: 20,
      total: 0,
    });

    useEffect(() => {
        if (data) {
            data.data.content.map(o => o.createdOn = moment(o.createdOn).format('DD/MM/YYYY'))
            setStockCounts(data)
            setLoader(false)
            setCurrentPagination({
              current: 1,
               pageSize: data.data.size,
                total: data.data.totalElements
            })
        }
    }, [data])

    const fetchData = (pagi, filters, sort, extra, currentStatus) => {
      const pagination = pagi || currentPagination;
      setLoading(true);
      const sortColumn = sort?.field || "createdOn";
      const sortDirection = sort?.order
        ? sort.order === "descend"
          ? "desc"
          : "asc"
        : "desc";
      getDataWithParams("stock-counts", {
        startDate: form.getFieldValue('start')?.valueOf(),
        endDate: form.getFieldValue('end')?.valueOf(),
        sort: `${sortColumn},${sortDirection}`,
        size: pagination.pageSize,
        page: pagination.current - 1,
      })
        .then((response) => {
          if (response.data) {
            response.data.data.content.map(o => o.createdOn = moment(o.createdOn).format('DD/MM/YYYY'))
            setStockCounts(response.data);
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

    const handlePage = (page) => {
        setPage(page);
    };

    const startCount = (data) => {
       toast.promise(
              putData(`stock-counts/${data.id}`, {id: data.id, status: "IN_PROGRESS"}),
              {
                loading: 'Loading',
                success: (resp) => {setTimeout(() => {history.push({pathname: `/stock-counts/${data.id}`})}, 1000); return "Stock Count Started"},
                error: (e) => "Error initating stock count. Contact technical support."
              },
              {
                position: 'bottom-center'
              }
       )
    }

    const close = (data) => {
       Modal.confirm({
        title: 'Confirm',
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            <p>{t(`Are you sure you want continue?`)}</p>
          </div>
        ),
        onOk() {
          toast.promise(
            putData(`stock-counts/${data.id}`, {id: data.id, status: "CLOSED"}),
            {
              loading: 'Loading',
              success: (resp) => {setTimeout(() => {history.push({pathname: `/stock-counts/${data.id}`})}, 2000); return "Stock Count Closed"},
              error: (e) => "Error closing stock count. Contact technical support."
            },
            {
              position: 'bottom-center'
            }
          )
        }
       })
    }

    const resume = (data) => {
        history.push({pathname: `/stock-counts/${data.id}`})
    }

    const handleAdd = () => {
       Modal.confirm({  
        title: 'Confirm',
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            <p>{t(`Are you sure, you want to initiate stock count?`)}</p>
          </div>
        ),
        onOk(){
          toast.promise(
                  postData('stock-counts', {}),
                  {
                    loading: 'Loading',
                    success: (resp) => {
                              resp.data.data.createdOn = moment(resp.data.data.createdOn).format('DD/MM/YYYY')
                              data.data.content.unshift(resp.data.data)
                              data.data.content = data.data.content.slice(0, 19)
                              setStockCounts(data)
                              setLoader(false)
                              fetchData(null,null,null);
                              return "Stock Count Initiated Successfully"
                    },
                    error: (e) => "Error initiating stock count. Contact technical support."
                  },
                  {
                    position: 'top-center'
                  }
          )
        }
      })
    };

    const fields = [
      {
        key: "createdOn",
        title: "Started On",
        dataIndex: "createdOn",
        sorter:true,
        render: (params , row) => {
          return (
            <Button
            type="link"
            size="small"
            onClick={()=>{ resume(row)}}
            > <span style={{textTransform :"uppercase" }}>{params}</span></Button>
          )
        },
        },
        {
                  key: 'createdBy',
                  title: 'Initiator',
                  dataIndex: 'createdBy',
                  render: (a) => {
                    return <span style={{textTransform :"uppercase" , fontWeight :"450" ,    color: "rgba(0, 0, 0, 0.88)" ,fontSize: "13px"
                    }}>{a}</span>;
                  },
              },

        {
          key: "status",
          title: "Status",
          dataIndex: "status",

          render: (a) => {
            return <span style={{textTransform :"uppercase" , fontWeight :"450" ,    color: "rgba(0, 0, 0, 0.88)" ,fontSize: "13px"
            }}>{a}</span>;
          },
        },
        {
          key: "stockStatusHistoryDtos",
          title: "Product Count ",
          dataIndex: "stockStatusHistoryDtos",
          render :(params , row )=>{
            return  row.stockCountLineItemDtos ? row.stockCountLineItemDtos.length : 0
          }
         },
         {
         title: 'Activities',
         dataIndex : "Activities",
            render: (params , row) => (
              <>
                {row && row.status === 'NEW' &&
                  <IconButton size="small" href={null} onClick={() => showModal(row,startCount)}><ArrowRightOutlined size={"sm"} style={{color: "blue"}}/></IconButton>}
                {row && row.status === 'IN_PROGRESS' &&
                <><IconButton size="small" href={null} onClick={() => showModal(row,resume)} style={{color : "#44a6c6"}}><EditOutlined size={'sm'} /></IconButton>
                <IconButton size="small" href={null} onClick={() => close(row)}><LockOutlined size={'sm'} style={{color: "maroon"}}/></IconButton>
                </>}
                {row && (row.status === 'CLOSED' || row.status === 'CANCELLED') &&
                <IconButton size="small" href={null} onClick={() => resume(row)}><UnorderedListOutlined size={"sm"}/></IconButton>}
              </>
          )
            },

      ]
    function showModal(row, callBackFunction){
      Modal.confirm({
        title: 'Confirm',
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            <p>{t(`Are you sure you want continue?`)}</p>
          </div>
        ),
        onOk() {
          callBackFunction(row);
        },
      });
    }
    return (
      <>
        {!loader && stockCounts ?
         <MainTable title={'Stock Counts'}
         HeadingParagraph="Stock Details"
            showFilter = {true}
            addBtnTitle={'Initiate Stock Count'}
            fields={fields}
            data={stockCounts}
            error={error}
            isPending={isPending}
            handlePage={handlePage}
            handleAddCallback={handleAdd}
            pagination={currentPagination}
            onChangeCallBack={fetchData}
            body={
              <div>
                 <Card style={{ marginBottom: 20 }}>
                  <Form form={form} layout="vertical" onFinish={() => fetchData()}>
                    <Form.Item shouldUpdate noStyle>
                      {() => (
                        <>
                          <Row gutter={16} justify="start">
                          <Col xs={12} sm={12} md={6} lg={4} xl={3}>
                              <Form.Item name={"start"}>
                                <DatePicker placeholder={t("Start Date")} style={{ width: '100%' }} />
                              </Form.Item>
                            </Col>
                            <Col xs={12} sm={12} md={6} lg={4} xl={3}>
                              <Form.Item name={"end"}>
                                <DatePicker placeholder={t("End Date")} style={{ width: '100%' }} />
                              </Form.Item>
                            </Col>
                            <Col xs={12} sm={12} md={6} lg={4} xl={3}>
                              <Form.Item>
                                <Button type="primary" htmlType="submit">
                                  {t("SEARCH")}
                                </Button>
                              </Form.Item>
                            </Col>
                          </Row>
                        </>
                      )}
                    </Form.Item>
                  </Form>
                </Card>
              </div>
              }
            />
            :
            <Loading />
        }
      </>
  )
}
export default StockCount;
