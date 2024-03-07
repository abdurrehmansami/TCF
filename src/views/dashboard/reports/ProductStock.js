import { useState, useEffect, memo } from 'react';
import MainTable from '../../../components/MainTable3'
import useFetch from '../../../hooks/useFetch'
import { useTranslation } from 'react-i18next';
import { getData } from '../../../services/NetworkService';
import moment from 'moment';
import { CSVLink } from "react-csv";
import '../../../scss/style.scss';
import { Card, Form, Input, Button, DatePicker, Select, AutoComplete, Space, Row, Col, Typography, Progress, Spin, Drawer, Skeleton } from 'antd';
import { BarChartOutlined, DownloadOutlined, TableOutlined } from '@ant-design/icons';
import { getDataWithParams } from '../../../services/NetworkService';
import dayjs from 'dayjs';
import { MUIBarChart } from 'src/components/MUIBarChart';
import {Divider as MuiDivider} from '@mui/material';
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text, Title } = Typography;
const ProductStock = () => {
    const [drawerVisibility, setDrawerVisibility] = useState(false)
    const [page, setPage] = useState(1);
    const [exportDate, setExportDate] = useState(null);
    const [exportData, setExportData] = useState(null);
    const { data: vendors } = useFetch('partners', null, 1000)
    const [final, setFinal] = useState(false)
    const [visible,setVisible] = useState(true);
    const [search, setSearch] = useState('startDate=' + moment().subtract(4, "years").valueOf()
        + '&endDate=' + moment().valueOf() + '&page=' + (page - 1));
    const [currentPagination , setCurrentPagination] = useState({
        current : 1,
        pageSize : 10,
        total : null
    });
    const { data: orderedInventory, error: error, isPending: isPending } = useFetch('products/stocks?startDate=' + moment().startOf('month').valueOf() + '&endDate=' + moment().endOf('month').valueOf() + '&page=' + (currentPagination.current -1) + '&size=' + (currentPagination?.pageSize));
    const [inventory, setInventory] = useState([]);
    const [loading,setLoading] = useState(true);
    const { t } = useTranslation();
    const [form] = Form.useForm();
    let productFlag = [
        {
            id: 1,
            value: 'ACTIVE'
        }, 
        {
            id: 2,
            value: 'DELETED'
        }
    ]

    const handlePage = (page_) => {
        setPage(page_);
        // setSearch(search.replace('&page=' + (page - 1), '&page=' + (page_ - 1)))
    };

    useEffect(() => {
        if (vendors && orderedInventory) {
            if (orderedInventory.data) {
                setInventory(orderedInventory)
                setCurrentPagination({
                    current: /*1*/orderedInventory.data.number+1,
                    pageSize: orderedInventory.data.size,
                    total: orderedInventory.data.totalElements
                })
            } else {
                setInventory([])
            }
            setFinal(true)
            setLoading(false)
        }
    }, [vendors, orderedInventory])

    useEffect(() => {
        if (exportData) {
            setTimeout(() => document.getElementById('export_link').click(), 500)
        }
    }, [exportData])

    const fetchData = (pagi, filters, sort, extra, currentStatus) => {
        setLoading(true);
        const pagination = pagi || currentPagination;
        getDataWithParams("products/stocks?", {
          productName: form.getFieldValue('productName')?.valueOf(),
          startDate: form.getFieldValue('start')?.valueOf() ? form.getFieldValue('start').valueOf() : dayjs().startOf('month').valueOf(),
          endDate: form.getFieldValue('end')?.valueOf() ? form.getFieldValue('end').valueOf() : dayjs().endOf('month').valueOf(),
          flag:form.getFieldValue('flag')?.valueOf(),
          size: pagination.pageSize,
          page: pagination.current - 1,
        })
          .then((response) => {
            if (response.data && response.data.data) {
              setInventory(response.data)
              setCurrentPagination({
                ...pagination,
                current: /*1*/response.data.data.number+1,
                pageSize: response.data.data.size,
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

    const export_ = (values) => {
        let queryString = '';
        for (const key in values) {
            if (values[key]) {
                queryString += key + '=' + values[key] + '&'
            }

        }
        setSearch(queryString)
        getData('products/stocks?' + queryString + 'isPageable=false')
            .then(response => {
                if (response.data) {
                    let _exportData = []
                    let responseData = response.data.data.content
                    responseData.forEach((o) => {
                        let data = {
                            productId: o.id, productName: o.name, totalQuantity: o.totalQuantity
                        }
                        _exportData.push(data)
                    })
                    setExportDate(new Date().getTime())
                    setExportData(_exportData)
                    setVisible(false);
                }
            })
            .catch(error => {
                console.log(error)
            })

    }

    const headers = [
        { label: 'Product Id', key: 'productId' },
        { label: 'Product Name', key: 'productName' },
        { label: 'Quantity', key: 'totalQuantity' },
    ]
    const onFinish = (values) => {
        let queryString = '';
        for (const key in values) {
          if (values[key]) {
            queryString += key + '=' + values[key] + '&';
          }
        }
        queryString += 'page=0';
        setSearch(queryString);
        setVisible(false);
    }
    
    return (
        <>
            <MainTable
                title={"Product Stock"}
                HeadingParagraph={"Real Time Product Stock"}
                showFilter={true}
                fields={fields}
                data={inventory}
                error={error}
                isPending={loading}
                pagination={currentPagination}
                handlePage={handlePage}
                isLoading={loading}
                onChangeCallBack={fetchData}
                addBtnTitle={'Graphical View'}
                handleAddCallback={()=>setDrawerVisibility(true)}
                body={
                    <Card style={{ marginBottom: 20 }}>
                        <Form
                            form={form}
                            initialValues={{
                            flag: 'ACTIVE',
                            start: dayjs().startOf('month'),
                            end: dayjs().endOf('month'),
                            }}
                            onFinish={() => fetchData()}
                        >
                            <Row gutter={16} justify="start">
                            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                                <Form.Item name="productName">
                                <Input placeholder={t('Product Name')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                                <Form.Item name="start">
                                <DatePicker format={'YYYY-MM-DD'} placeholder={t('Start Date')} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                                <Form.Item name="end">
                                <DatePicker format={'YYYY-MM-DD'} placeholder={t('End Date')} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                                <Form.Item name="flag">
                                <Select placeholder={t('Product Status')}>
                                    {productFlag.map((flag) => (
                                    <Option key={flag.id} value={flag.value}>
                                        {flag.value}
                                    </Option>
                                    ))}
                                </Select>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                                <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    {t('Search')}
                                </Button>
                                &nbsp;
                                <Button disabled={visible} type="default" onClick={() => export_(form.getFieldsValue())}>
                                    {t('Export')} <DownloadOutlined />
                                </Button>
                                {exportData && (
                                    <>
                                    &nbsp;
                                    <CSVLink
                                        hidden
                                        filename={`${exportDate}.csv`}
                                        headers={headers}
                                        data={exportData}
                                        id="export_link"
                                        style={{ textDecoration: 'underline' }}
                                    >
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
export default ProductStock;

const GraphicalView = ({visibility, setVisibility}) => {
    const [mostStockProds, setMostStockProds] = useState(null)
    const [leastStockProds, setLeastStockProds] = useState(null)
    useEffect(() => {
        getData('products/stocks?size=20&sort=totalQuantity,desc').then(res=>{graphDataFunc(true, res?.data?.data?.content); console.log('RES***M',res)})
        getData('products/stocks?size=20&sort=totalQuantity').then(res=>{graphDataFunc(false, res?.data?.data?.content); console.log('RES***L',res)})
        return ()=>{setMostStockProds(null); setLeastStockProds(null)}
    }, [])
    const graphDataFunc = (condition, data) => {
        let prodNames = []
        let chartData = []
        data.forEach((item, i)=>{
            prodNames.push(`${i}. ${item?.name}`);
            chartData.push(item?.totalQuantity);
        })
        condition ? setMostStockProds({prodNames, chartData}) : setLeastStockProds({prodNames, chartData})
    }
    
    return(<>
        {visibility && <Drawer title="GRAPHICAL VIEW" width={900} open={visibility} onClose={setVisibility}>
            <Row gutter={[0, 24]}>
                <Col span={24}>
                    <Card size='small' style={{display: 'flex', flexDirection: 'column', alignItems: 'center', height: 250, /*width: '50%', margin: '0 10px 14px 0',*/ boxShadow: '3px 4px 5px rgba(0, 0, 0, .08)'}}>
                    <Title style={{fontSize: 18, margin: '0 0 5px', color: '#505050'}}>Most 20 Stock Products</Title>
                    {mostStockProds ?
                        <MUIBarChart
                        tickLabels={mostStockProds?.prodNames} width={750} height={200} margin={{top: 10, right: 10, bottom: 15, left: 80}}
                        tickLabelStyle={{transform: 'translate(-8px, 15px) rotate(-70deg)', textAnchor: 'end'}}
                        data={mostStockProds?.chartData} barColor='#80a0a0' />
                        :
                        <Skeleton.Node style={{width: 750, height: 200}} active={true}>
                            <BarChartOutlined style={{fontSize: 120, color: '#bfbfbf'}} />
                        </Skeleton.Node>
                    }
                    </Card>
                </Col>
                <Col span={24}>
                    <Card size='small' style={{display: 'flex', flexDirection: 'column', alignItems: 'center', height: 250, /*width: '50%', margin: '0 0 14px 10px',*/ boxShadow: '3px 4px 5px rgba(0, 0, 0, .08)'}}>
                    <Title style={{fontSize: 18, margin: '0 0 5px', color: '#505050'}}>Least 20 Stock Products</Title>
                    {leastStockProds ?
                        <MUIBarChart
                        tickLabels={leastStockProds?.prodNames} height={200} width={750} margin={{top: 10, right: 10, bottom: 15, left: 80}}
                        tickLabelStyle={{transform: 'translate(-8px, 15px) rotate(-70deg)', textAnchor: 'end'}}
                        data={leastStockProds?.chartData} barColor='#a04040' />
                        :
                        <Skeleton.Node style={{width: 750, height: 200}} active={true}>
                            <BarChartOutlined style={{fontSize: 120, color: '#bfbfbf'}} />
                        </Skeleton.Node>
                    }
                    </Card>
                </Col>
            </Row>
        </Drawer>}</>
    )
}

/*
const fields = [

    { field: 'name', headerName: 'Product', flex: 3 },
    { field: 'totalQuantity', headerName: 'Quantity', dataId: 'id', flex: 2 }
]
*/
const fields = [
    {
        key:'name',
        title:'Product',
        dataIndex:'name',
        dataId:'id',
        flex:3
    },
    {
        key:'totalQuantity',
        title:'Quantity',
        dataIndex:'totalQuantity',
        flex:2
    }
]