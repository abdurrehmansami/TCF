import { useState, useEffect, memo } from 'react';
import MainTable from '../../../components/MainTable3'
import useFetch from '../../../hooks/useFetch'
import { MyTextField, MyDateField, MuiAutocomplete } from '../../../components/FormFieldsAnt'
import { useTranslation } from 'react-i18next';
import { getData, getDataWithParams } from '../../../services/NetworkService';
import moment from 'moment';
import dayjs from 'dayjs';
import { CSVLink } from "react-csv";
import '../../../scss/style.scss';
import { Card, Button, Form, Row, Col, Drawer, Progress, Typography, Divider, Pagination, Spin, DatePicker, Skeleton} from 'antd';
import { AntdAutocomplete } from 'src/components/FormFieldsAnt';
import { BarChartOutlined, DownloadOutlined, TableOutlined, LoadingOutlined } from '@ant-design/icons';
import { BarChart } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts';
import {Divider as MuiDivider} from '@mui/material';
import { GridColumnsToolbarButton } from '@material-ui/data-grid';
import { MUIBarChart } from 'src/components/MUIBarChart';
import { ProductStatsCard } from 'src/components/ProductStatsCard';
const { Text, Title } = Typography;

const InventoryOrdered = () => {
  const [page, setPage] = useState(1);
  const [exportDate, setExportDate] = useState(null);
  const [exportData, setExportData] = useState(null);
  const { data: vendors } = useFetch('partners', null, 1000)
  let sDate = new Date('2020-01-01T00:00:00.000Z').getTime();
  const [search, setSearch] = useState('startDate=' + sDate
      + '&endDate=' + moment().valueOf());
  // const { data: orderedInventory, error: error, isPending: isPending } = useFetch('orders/inventory?' + search);
  const [inventory, setInventory] = useState([])
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(true)
  const [currentPagination, setCurrentPagination] = useState({current: 1, pageSize: 10, total: null})
  const [loading, setLoading] = useState(true)
  const [drawerVisibility, setDrawerVisibility] = useState(false)
  const [error, setError] = useState(null)
  
  const handlePage = (page_) => {
      setPage(page_);
      setSearch(search.replace('&page=' + (page - 1), '&page=' + (page_ - 1)))
  };

  useEffect(() => {
    getData('orders/inventory?' + search + '&page=' + (currentPagination?.current - 1) + '&size=' + (currentPagination?.pageSize))
      .then(response => {
        setInventory(response?.data);
        setCurrentPagination({current: response?.data?.data?.number+1, pageSize: response?.data?.data?.size, total: response?.data?.data?.totalElements});
        console.log('Inventory RESPONSE',response?.data?.data)
      })
      .catch(error=>{setError(error.message); console.log('error',error.message)})
    setLoading(false)
    return () => {setInventory([]); setError(null)}
  }, [])
  
  const onPageChange = (pagination) => {
    setLoading(true)
    setCurrentPagination(prevState => ({...prevState, current: pagination.current, pageSize: pagination.pageSize, total: inventory?.data?.totalElements}));
    getData('orders/inventory?' + search + '&page=' + (pagination?.current - 1) + '&size=' + (pagination?.pageSize)).then(response => {
      setInventory(response?.data);
      setLoading(false)
    })
  }
  // useEffect(() => {
  //     if (vendors && orderedInventory) {
  //         if (orderedInventory.data) {
  //             setInventory(orderedInventory)
  //         } else {
  //             setInventory([])
  //         }
  //         setFinal(true)
  //     }
  // }, [vendors, orderedInventory])
  useEffect(() => {
    if (exportData) {
        setTimeout(() => document.getElementById('export_link').click(), 500)
    }
  }, [exportData])

    const export_ = (values, setSubmitting) => {
        setSubmitting(false);
        setVisible(true);
        let queryString = '';
        for (const key in values) {
            if (values[key]) {
                queryString += key + '=' + values[key] + '&'
            }

      }
      setSearch(queryString)
      getData('orders/inventory?' + queryString + 'isPageable=false')
          .then(response => {
              if (response.data) {
                  let _exportData = []
                  let responseData = response.data.data.content
                  responseData.forEach((o) => {
                      let data = {
                          productId: o.id, productName: o.name,
                          orderedPallets: o.totalOrderedPallets,
                          receivedPallets: o.totalReceivedPallets,
                          orderedNumberofUnits: o.totalOrderedNumberOfUnits,
                          receiverdNumberofUnits: o.totalReceivedNumberOfUnits,
                          damagedQuantity: o.damagedQuantity,
                          vendorName: o.vendorName
                      }
                      _exportData.push(data)
                      console.log(_exportData)
                  })
                  setExportDate(new Date().getTime())
                  setExportData(_exportData)
                  console.log(exportData)
                  setSubmitting(false)
              }
          })
          .catch(error => {
              setSubmitting(false)
              console.log(error)
          })

  }

    const headers = [
        { label: 'Product Id', key: 'productId' },
        { label: 'Vendor Name', key: 'vendorName' },
        { label: 'Product Name', key: 'productName' },
        { label: 'Ordered Pallets', key: 'orderedPallets' },
        { label: 'Received Pallets', key: 'receivedPallets' },
        { label: 'Ordered Number of Units', key: 'orderedNumberofUnits' },
        { label: 'Received Number of Units', key: 'receiverdNumberofUnits' },
        { label: 'damagedQuantity', key: 'damagedQuantity' }
    ]
    const fetchData = (pagi, filters, sort, extra, currentStatus) => {
      setLoading(true);
      const pagination = pagi || currentPagination;
      getDataWithParams("orders/inventory?", {
        vendorName: form.getFieldValue('vendorName')?.valueOf(),
        productName: form.getFieldValue('productName')?.valueOf(),
        startDate: form.getFieldValue('start')?.valueOf() ? form.getFieldValue('start').valueOf() : dayjs().startOf('month').valueOf(),
        endDate: form.getFieldValue('end')?.valueOf() ? form.getFieldValue('end').valueOf() : dayjs().endOf('month').valueOf(),
        size: pagination.pageSize,
        page: pagination.current - 1,
      })
        .then((response) => {
          if (response.data && response.data.data) {
            setInventory(response.data)
            setCurrentPagination({
              ...pagination,
              total: response.data.data.totalElements,
            });
            setVisible(false);
          }
          else{
            setInventory([]);
            setVisible(true);
          }
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          setVisible(true);
        });
    };
    const onFinish = (values) => {
      setVisible(false);
        let queryString = '';
        for (const key in values) {
          if (values[key]) {
            queryString += key + '=' + values[key] + '&';
          }
        }
        queryString += 'page=0';
        setSearch(queryString);
        // setSubmitting(false)
      };

      
    return (
      <>
        <MainTable
          title={"Products Received"}
          HeadingParagraph={"Products Received"}
          showFilter={true}
          fields={fields}
          data={inventory || []}
          error={error}
          isPending={loading}
          handlePage={handlePage}
          isLoading={loading}
          pagination={currentPagination.total ? currentPagination : null}
          onChangeCallBack={/*fetchData*/onPageChange}
          addBtnTitle={'Graphical View'}
          handleAddCallback={()=>setDrawerVisibility(true)}
          body={
            <Card style={{ marginBottom: 10 }}>
              <Form
                form={form}
                initialValues={{ start: dayjs().startOf('month'), end: dayjs().endOf('month') }}
                onFinish={()=>fetchData()}
              >
                <Row gutter={16} justify="start">
                  <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                    <Form.Item name="vendorName">
                      <AntdAutocomplete
                        data={vendors?.data.content}
                        setFieldValue={form.setFieldsValue}
                        placeholder={t('Enter Vendors')}
                        displayKey={'name'}
                        valueKey="name"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                    <Form.Item name="productName">
                      <MyTextField placeholder={t('Product Name')} form={form} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                    <Form.Item name="start">
                      <DatePicker format={'YYYY-MM-DD'} placeholder={t("Start Date")} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                    <Form.Item name="end">
                      <DatePicker format={'YYYY-MM-DD'} placeholder={t("End Date")} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        {t('Search')}
                      </Button>
                      &nbsp;
                      <Button type="default" disabled={visible} onClick={() => { export_(form.getFieldsValue(), form.submit); }}>
                        {t('Export')} <DownloadOutlined />
                      </Button>
                      {exportData && (
                        <>
                          &nbsp;
                          <CSVLink hidden color="default" style={{ textDecoration: 'underline' }} filename={`${exportDate}.csv`} headers={headers} id="export_link" data={exportData}>
                            {t('Export')}
                          </CSVLink>
                        </>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          }
        />
        <GraphicalView visibility={drawerVisibility} setVisibility={()=>setDrawerVisibility(false)} />
      </>
    )
}
export default InventoryOrdered;

const GraphicalView = ({visibility, setVisibility}) => {
  const [orderData, setOrderData] = useState(null)
    const [orderedReceivedDiff, setOrderedReceivedDiff] = useState(null)
    const [damagedItems, setDamagedItems] = useState(null)
    const w = window.screen.width > 850 ? 850 : window.screen.width;
    
    useEffect(() => {
      getData('orders/received/inventory?sort=totalUnReceivedNumberOfUnits,desc').then(res=>{setOrderData(res?.data?.data?.content); graphDataFunc(true, res?.data?.data?.content); console.log('New_Api_Response', res?.data?.data?.content)}).catch(e=>console.log('New_Api_Error', e))
      getData('orders/damaged/inventory?sort=totalDamagedQuantity,desc&size=20').then(res=>{graphDataFunc(false, res?.data?.data?.content); console.log('Damaged_Api_Response', res?.data?.data?.content)}).catch(e=>console.log('Damaged_Api_Error', e))
      return () => {setOrderData(null); setDamagedItems(null)}
    }, [])
    
    const graphDataFunc = (condition, data) => {
      let prodNames = []
      let chartData = []
      if(condition){
        data.forEach((item, i)=>{
          prodNames.push(`${i}. ${item?.name}`);
          chartData.push(item?.totalUnreceivedNumberOfUnits);
        })
        setOrderedReceivedDiff({prodNames, chartData})
      } else {
        data.forEach((item, i)=>{
          prodNames.push(`${i}. ${item?.name}`);
          chartData.push(item?.damagedQuantity);
        })
        setDamagedItems({prodNames, chartData})
      }
    }
    
    return (<>
      {visibility && <Drawer title="GRAPHICAL VIEW" width={900} open={visibility} onClose={setVisibility}>
        <Card size='small'>{console.log('CHILD RETURN')}
          <Title style={{fontSize: 18, margin: '5px 10px 15px', color: '#505050'}}>Order receiving percentage</Title>
          {orderData ? <Row gutter={20}>
            {orderData.map((item, i)=>{
              let ordered = item?.totalOrderedNumberOfUnits ? item?.totalOrderedNumberOfUnits : 0
              let received = item?.totalReceivedNumberOfUnits ? item?.totalReceivedNumberOfUnits : 0
              let receivedOrderPercentage = (ordered != 0) ? ((received/ordered)*100) : 0;
              let strokeColor = (receivedOrderPercentage >= 90) ? '#18ce00': (receivedOrderPercentage >= 75) ? '#4dff35': (receivedOrderPercentage >= 50) ? '#1be8bf' : (receivedOrderPercentage > 25) ? '#e5ab19' : (receivedOrderPercentage > 10) ? '#f97a18' : '#fc1919' 
              let trailColor = (receivedOrderPercentage >= 90) ? '#8ed385': (receivedOrderPercentage >= 75) ? '#b2fca6': (receivedOrderPercentage >= 50) ? '#cffcf3' : (receivedOrderPercentage > 25) ? '#f7e4aa' : (receivedOrderPercentage > 10) ? '#f9daae' : '#f9a798' 
              return(
                <Col span={6} key={i}>
                  <ProductStatsCard name={item?.name} data1={ordered} data2={received} percentage={receivedOrderPercentage} progressStrokeColor={strokeColor} progressTrailColor={trailColor} heading1='Ordered Units' heading2='Received Units' progressText='order received' />
                </Col>
            )})}
          </Row>
          : 
          <Row gutter={20}>
            {[...Array(4)].map((_, i) => 
              <Col span={6} key={i}>
                <Skeleton.Node style={{height: 250, width: 190}} active={true}>
                  <LoadingOutlined style={{fontSize: 100, color: '#bfbfbf'}} />
                </Skeleton.Node>
              </Col>)}
          </Row>
          }
          <MuiDivider sx={{margin: '20px 0'}} />
          <Row gutter={[0, 24]}>
            <Col span={24}>
              <Card size='small' style={{display: 'flex', flexDirection: 'column', alignItems: 'center', height: 250, /*width: '50%', margin: '0 10px 14px 0',*/ boxShadow: '3px 4px 5px rgba(0, 0, 0, .08)'}}>
                <Title style={{fontSize: 18, margin: '0 0 5px', color: '#505050'}}>Most Ordered-Received Difference</Title>
                {orderedReceivedDiff ?
                  <MUIBarChart
                    tickLabels={orderedReceivedDiff?.prodNames} width={750} height={200} margin={{top: 10, right: 10, bottom: 15, left: 80}}
                    tickLabelStyle={{transform: 'translate(-8px, 15px) rotate(-70deg)', textAnchor: 'end'}}
                    data={orderedReceivedDiff?.chartData} barColor='#80a0a0' />
                    :
                  <Skeleton.Node style={{width: 750, height: 200}} active={true}>
                    <BarChartOutlined style={{fontSize: 120, color: '#bfbfbf'}} />
                  </Skeleton.Node>
                }
              </Card>
            </Col>
            <Col span={24}>
              <Card size='small' style={{display: 'flex', flexDirection: 'column', alignItems: 'center', height: 250, /*width: '50%', margin: '0 0 14px 10px',*/ boxShadow: '3px 4px 5px rgba(0, 0, 0, .08)'}}>
                <Title style={{fontSize: 18, margin: '0 0 5px', color: '#505050'}}>Most Damaged Products</Title>
                {damagedItems ?
                  <MUIBarChart
                    tickLabels={damagedItems?.prodNames} height={200} width={750} margin={{top: 10, right: 10, bottom: 15, left: 80}}
                    tickLabelStyle={{transform: 'translate(-8px, 15px) rotate(-70deg)', textAnchor: 'end'}}
                    data={damagedItems?.chartData} barColor='#a04040' />
                    :
                  <Skeleton.Node style={{width: 750, height: 200}} active={true}>
                    <BarChartOutlined style={{fontSize: 120, color: '#bfbfbf'}} />
                  </Skeleton.Node>
                }
              </Card>
            </Col>
          </Row>
        </Card>
      </Drawer>}</>
    )
}

/*
const fields = [

    { field: 'vendorName', headerName: 'Vendor', flex: 2 },
    { field: 'name', headerName: 'Product', dataId: 'id', flex: 3},
    { field: 'totalOrderedPallets', headerName: 'Ordered Pallets', flex: 2 },
    { field: 'totalReceivedPallets', headerName: 'Received Pallets', flex: 2 },
    { field: 'totalOrderedNumberOfUnits', headerName: 'Ordered Numeber of Units', flex: 2 },
    { field: 'totalReceivedNumberOfUnits', headerName: 'Received Number of Units', flex: 2 },
    { field: 'damagedQuantity', headerName: 'Damaged Quantity', flex: 2 }

]
*/
const fields = [
    {
        key: 'vendorName',
        title: 'Vendor',
        dataIndex: 'vendorName',
        flex: 2
    },
    {
        key: 'name',
        title: 'Product',
        dataIndex: 'name',
        dataId: 'id',
        flex: 3
    },
    {
        key: 'totalOrderedPallets',
        title: 'Ordered Pallets',
        dataIndex: 'totalOrderedPallets',
        flex: 2
    },
    {
        key: 'totalReceivedPallets',
        title: 'Received Pallets',
        dataIndex: 'totalReceivedPallets',
        flex: 2
    },
    {
        key: 'totalOrderedNumberOfUnits',
        title: 'Ordered Number of Units',
        dataIndex: 'totalOrderedNumberOfUnits',
        flex: 2
    },
    {
        key: 'totalReceivedNumberOfUnits',
        title: 'Received Number of Units',
        dataIndex: 'totalReceivedNumberOfUnits',
        flex: 2
    },
    {
        key: 'damagedQuantity',
        title: 'Damaged Quantity',
        dataIndex: 'damagedQuantity',
        flex: 2
    }
];
