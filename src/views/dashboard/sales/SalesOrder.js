import { useState, useEffect } from 'react';
import MainTable from '../../../components/MainTable3'
import useFetch from '../../../hooks/useFetch'
import { MyTextField, MyDateField } from '../../../components/FormFieldsAnt'
import { useTranslation } from 'react-i18next';
// import { Formik, Form } from "formik";
import { getData } from '../../../services/NetworkService';
import moment from 'moment';
import dayjs from 'dayjs';
import { CSVLink } from "react-csv";
import { getDataWithParams } from '../../../services/NetworkService';
import {Card, Form, Button, Input, DatePicker, Row, Col, Drawer, Progress, Typography, Spin, Skeleton} from 'antd';
import { BarChartOutlined, DownloadOutlined, TableOutlined } from '@ant-design/icons';
import {Divider as MuiDivider} from '@mui/material';
import { MUIBarChart } from 'src/components/MUIBarChart';
import { ProductStatsCard } from 'src/components/ProductStatsCard';
const { Text, Title } = Typography;

const SalesOrder = (props) => {
  const [drawerVisibility, setDrawerVisibility] = useState(false)
  const [page, setPage] = useState(1);
  let propData = props.location.data;
  const [sdate, setSdate] = useState(new Date('2020-01-01T00:00:00.000Z').getTime());
  const [edate, setEdate] = useState(null);
  const [productFilter, setProductFilter] = useState(null);
  const [criteria] = useState(props.location.data ? props.location.data : null)
  const [search, setSearch] = useState(criteria);
  const [exportDate, setExportDate] = useState(null);
  const [exportData, setExportData] = useState(null);
  const [form] = Form.useForm();
  let date;
  let num = 1;
  if(page >= 1 && sdate == null && edate == null && productFilter == null) {
      if(propData != undefined) {
         date = "startDate="+propData.startDate+"&endDate="+propData.endDate + '&';
      }  else {
          date = `startDate=${moment().startOf('month').valueOf()}&endDate=${moment().endOf('month').valueOf()}` + '&';
      }
  }
  else {
      date =  (productFilter == null ? '' : "productName="+productFilter+"&")  ;
      if(sdate){
          date =  date + "startDate="+sdate+"&";
      }

      if(edate){
          date = date +"endDate="+edate +"&"
      }
  }
  const [currentPagination , setCurrentPagination] = useState({
    current : 1,
    pageSize : 10 ,
    total : null
  })
  console.log('onPageChange', currentPagination)
  const {error, isPending, data} = useFetch('prestashop/product/sales?' + date + 'page=' + (currentPagination?.current -1) + '&size=' + (currentPagination?.pageSize));
  console.log('data', data)
  const [sales, setSales] = useState(null);
  const { t } = useTranslation();
  const [Loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(true)

  const onPageChange = (pagination) => {
    console.log('onPageChange', pagination)
    setCurrentPagination(prevState=>({...prevState, current: pagination.current, pageSize: pagination.pageSize, total: pagination.total}))
  }

    const fetchData = (pagi, filters, sort, extra, currentStatus) => {
      const pagination = pagi || currentPagination;
      setLoading(true);
      getDataWithParams("prestashop/product/sales?", {
        reference: form.getFieldValue('ref')?.valueOf(),
        productName: form.getFieldValue('productName')?.valueOf(),
        startDate: form.getFieldValue('start')?.valueOf() ? form.getFieldValue('start').valueOf() : dayjs().startOf('month').valueOf(),
        endDate: form.getFieldValue('end')?.valueOf() ? form.getFieldValue('end').valueOf() : dayjs().endOf('month').valueOf(),
        size: pagination.pageSize,
        page: pagination.current - 1,
      })
        .then((response) => {
          if (response.data && response.data.data) {
            setSales(response.data)
            setCurrentPagination({
              ...pagination,
              total: response.data.data.totalElements,
            });
            setVisible(false);
          }
          else{
            setSales([])
            setVisible(true);
          }
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          setVisible(true);
        });
    };

  const handlePage = (page) => {
      setPage(page);
  };

  const handlePageOnSearch = (page) => {
      setPage(page);
  }

    useEffect (() => {
      if(data){
        setSales(data);
        setCurrentPagination({
          current: /*1*/data.data.number+1,
          pageSize: data.data.size,
          total: data.data.totalElements
        })
      }
    }, [data])

  useEffect(() => {
      if (exportData) {
        setTimeout(() => document.getElementById('export_link').click(), 500)
      }
    }, [exportData])

    const export_ = (values) => {
      let queryString = '';
      for (const key in values) {
        if (values[key]) {
          queryString += key + '=' + values[key] + '&'
        }

      }
      // queryString = queryString.slice(0, -1)
      setSearch(queryString)
      getData('prestashop/product/sales?' + queryString + 'isPageable=false')
        .then(response => {
          if (response.data) {
            let _exportData = []
            let responseData = response.data.data.content
            responseData.forEach((o) => {
              let data = {
                  productId: o.id , 
                  productName: o.productName ,
                  taxValue: o.productTaxValue, 
                  quantitySold: o.productTotalQuantity, 
                  totalSalesVATIncl: o.productTotalSales, 
                  totalSalesVATExcl: o.productTotalSalesTaxExcl,
                  costPrice: o.productCostPrice
              }
              _exportData.push(data)
            })
            setExportDate(new Date().getTime())
            setExportData(_exportData)
            setVisible(true);
          }
        })
        .catch(error => {
          console.log(error)
        })
    }

    const headers = [
      { label: 'Product Id', key: 'productId' },
      { label: 'Product Name', key: 'productName' },
      { label: 'Quantity Sold', key: 'quantitySold' },
      { label: 'Cost Price', key: 'costPrice' },
      { label: 'Sales VAT Incl', key: 'totalSalesVATIncl' },
      { label: 'Sales VAT Excl', key: 'totalSalesVATExcl' },
      { label: 'VAT', key: 'taxValue' }
    ]
    const onFinish = (values) => {
      setLoading(true);
      let queryString = '';
      for (const key in values) {
        if (values[key]) {
          queryString += key + '=' + values[key].valueOf() + '&';
          if (key === 'productName') {
            setProductFilter(values[key]);
          }
        }
      }
      getDataWithParams('prestashop/product/sales?', 
      {
        reference: form.getFieldValue('ref')?.valueOf(),
        productName: form.getFieldValue('productName')?.valueOf(),
        startDate:form.getFieldValue('start')?.valueOf(),
        endDate:form.getFieldValue('end')?.valueOf(),
        page: currentPagination.current-1
      })
        .then((response) => {
          if (response.data) {
            handlePageOnSearch(1);
            setSales(response.data);
            setCurrentPagination({
              ...currentPagination,
              total: response.data.data.totalElements,
            });
          }
          setVisible(false);  
          setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
        });
    };

  return (
    <>
    <MainTable
      addRoute={'product-sales/add'}
      title={"Product Sales"}
      HeadingParagraph={"Product Sales"}
      showFilter = {true}
      isLoading={Loading}
      fields={fields}
      data={sales || []}
      error={error}
      isPending={isPending}
      handlePage={handlePage}
      onChangeCallBack={fetchData}
      pagination={currentPagination}
      addBtnTitle={'Graphical View'}
      handleAddCallback={()=>setDrawerVisibility(true)}
      body={
        <Card style={{ marginBottom: 20 }}>
          <Form
            form={form}
            initialValues={{
              start: dayjs().startOf('month'),
              end: dayjs().endOf('month'),
              startDate: propData !== undefined ? moment(propData.startDate) : moment('2020-01-01'),
              endDate: propData !== undefined ? moment(propData.endDate) : moment().endOf('month'),
            }}
            onFinish={() => fetchData()}
          >
            <Row gutter={16} justify="start">
              <Col xs={12} sm={12} md={6} lg={4} xl={3}>
                <Form.Item name="ref">
                  <Input placeholder="Search by Ref" />
                </Form.Item>
              </Col>
              <Col xs={12} sm={12} md={6} lg={4} xl={3}>
                <Form.Item name="productName">
                  <Input placeholder="Product Name" />
                </Form.Item>
              </Col>
              <Col xs={16} sm={8} md={4} lg={4} xl={4}>
                <Form.Item name="start">
                  <DatePicker
                    placeholder={t("Start Date")}
                    onChange={(value) => {
                      form.setFieldsValue({
                        //startDate: moment(value).valueOf()
                      })
                    }}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={16} sm={8} md={4} lg={4} xl={4}>
                <Form.Item name="end">
                  <DatePicker
                    placeholder={t("End Date")}
                    onChange={(value) => {
                      form.setFieldsValue({
                        //startDate: moment(value).valueOf()
                      })
                    }}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={4} xl={6}>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    {t('Search')}
                  </Button>
                  &nbsp;
                  <Button disabled={visible} type="default" onClick={() => { export_(form.getFieldsValue()); }}>
                    Export <DownloadOutlined />
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
export default SalesOrder;

const GraphicalView = ({visibility, setVisibility}) => {
  const [topProfitableProducts, setTopProfitableProducts] = useState(null)
  const [leastProfitableProducts, setLeastProfitableProducts] = useState(null)
  useEffect(() => {
    getData('prestashop/product/sales/profits?ascending=false').then(res=>{graphDataFunc(true, res?.data?.data?.content); console.log('Top_Profitable_Response', res?.data?.data?.content)}).catch(e=>console.log('Top_Profitable_Response', e))
    getData('prestashop/product/sales/profits?ascending=true').then(res=>{graphDataFunc(false, res?.data?.data?.content); console.log('Least_Profitable_Response', res?.data?.data?.content)}).catch(e=>console.log('Least_Profitable_Response', e))
    return () => {setTopProfitableProducts(null); setLeastProfitableProducts(null)}
  }, [])

  const graphDataFunc = (condition, data) => {
    let prodNames = []
    let chartData = []
    data.forEach((item, i)=>{
      prodNames.push(`${i+1}. ${item?.productName}`);
      chartData.push(item?.productTotalProfit);
    })
    condition ? setTopProfitableProducts({prodNames, chartData}) : setLeastProfitableProducts({prodNames, chartData})
  }
  
  return (<>
    {visibility && <Drawer title="GRAPHICAL VIEW" width={900} open={visibility} onClose={setVisibility}>
      <Card size='small'>
        <Row gutter={[0, 24]}>
          <Col span={24}>
            <Card size='small' style={{display: 'flex', flexDirection: 'column', alignItems: 'center', height: 250, /*width: '50%', margin: '0 10px 14px 0',*/ boxShadow: '3px 4px 5px rgba(0, 0, 0, .08)'}}>
              <Title style={{fontSize: 18, margin: '0 0 5px', color: '#505050'}}>Top 20 Profitable Products</Title>
              {topProfitableProducts ?
                <MUIBarChart
                  tickLabels={topProfitableProducts?.prodNames} width={750} height={200} margin={{top: 10, right: 10, bottom: 15, left: 80}}
                  tickLabelStyle={{transform: 'translate(-8px, 15px) rotate(-70deg)', textAnchor: 'end'}}
                  data={topProfitableProducts?.chartData} barColor='#80a0a0' />
                  :
                <Skeleton.Node style={{width: 750, height: 200}} active={true}>
                  <BarChartOutlined style={{fontSize: 120, color: '#bfbfbf'}} />
                </Skeleton.Node>
              }
            </Card>
          </Col>
          <Col span={24}>
            <Card size='small' style={{display: 'flex', flexDirection: 'column', alignItems: 'center', height: 250, /*width: '50%', margin: '0 0 14px 10px',*/ boxShadow: '3px 4px 5px rgba(0, 0, 0, .08)'}}>
              <Title style={{fontSize: 18, margin: '0 0 5px', color: '#505050'}}>Least 20 Profitable Products</Title>
              {leastProfitableProducts ?
                <MUIBarChart
                  tickLabels={leastProfitableProducts?.prodNames} height={200} width={750} margin={{top: 10, right: 10, bottom: 15, left: 80}}
                  tickLabelStyle={{transform: 'translate(-8px, 15px) rotate(-70deg)', textAnchor: 'end'}}
                  data={leastProfitableProducts?.chartData} barColor='#a04040' />
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

    { field: 'productName', headerName: 'Product Name', dataId: 'id', flex: 1 },
    { field: 'productTotalQuantity', headerName: 'Quantity Sold', flex: 0.5 },
    { field: 'productCostPrice', headerName: 'Cost Price', flex: 0.5 },
    { field: 'productTotalSales', headerName: 'Sales VAT Incl', flex: 0.5 },
    { field: 'productTotalSalesTaxExcl', headerName: 'Sales VAT Excl', flex: 0.5},
    { field: 'productTaxValue', headerName: 'VAT', flex: 0.5}
]
*/
const fields = [
  {
    key:"ref",
    title:"Reference",
    dataIndex:"ref",
    sorter:true,
  },
  {
    key:"productName",
    title:"Product Name",
    dataIndex:"productName",
    sorter:true,
  },
  {
    key:"productTotalQuantity",
    title:"Product Total Quantity",
    dataIndex:"productTotalQuantity",
    sorter:true,
  },
  {
    key:"productCostPrice",
    title:"Product Cost Price",
    dataIndex:"productCostPrice",
    sorter:true,
  },
  {
    key:"productTotalSales",
    title:"Product Total Sales",
    dataIndex:"productTotalSales",
    sorter:true,
  },
  {
    key:"productTotalSalesTaxExcl",
    title:"Product Total Sales Tax",
    dataIndex:"productTotalSalesTaxExcl",
    sorter:true,
  },
  {
    key:"productTaxValue",
    title:"Product Tax Value",
    dataIndex:"productTaxValue",
    sorter:true,
  },

];
