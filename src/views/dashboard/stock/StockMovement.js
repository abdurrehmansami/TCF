import React,{useState,useEffect} from "react";
import { Card, Col, Image, Row, Typography, Button, Table,Form,Select,Modal } from "antd";
import { useTranslation } from "react-i18next";
import useFetch from "src/hooks/useFetch";
import { getData, getDataWithParams } from "src/services/NetworkService";
import Loading from "src/components/Loading";
import './StockMovement.css';
import { CSVLink } from "react-csv";
import { DownloadOutlined } from "@ant-design/icons";
const StockMovement = () => {
    const { t } = useTranslation();
    const [exportDate, setExportDate] = useState(null);
    const [exportData, setExportData] = useState(null);
    const [visible,setVisible] = useState(true);
    const [page, setPage] = useState(1);
    const { isPending:prodPending, data:products } = useFetch('products?size=1000');
    const [stockData,setStockData] = useState(null);
    const [productData,setProductData] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProductName, setSelectedProductName] = useState(null);
    const [loading,setLoading] = useState(false);
    const [type,setType] = useState('');
    const [form] = Form.useForm();
    const [currentPagination , setCurrentPagination] = useState({
        current : 1,
        pageSize : 20 ,
        total : 0
    });
    useEffect(()=>{
        if(products)
            setProductData(products)
    },[products])
    useEffect(() => {
        if (exportData) {
            setTimeout(() => document.getElementById('export_link').click(), 500)
        }
    }, [exportData])
    const fetchData = (pagi, filters, sort, extra, currentStatus) => {
        setLoading(true);
        const pagination = pagi || currentPagination;
        getDataWithParams(`products/${selectedProduct}/stock-movements?`, {
          type: type,
          size: pagination.pageSize,
          page: pagination.current - 1,
          sort: "recordedDate,desc"
        })
          .then((response) => {
            if (response.data) {
              setStockData(response.data)
              setCurrentPagination({
                ...pagination,
                total: response.data.productStockList.totalElements,
              });
            }
            else{
              setStockData([]);
            }
            setLoading(false);
          })
          .catch((error) => {
            setLoading(false);
          });
    };
    const onFinish = (values) => {
        let type_ = values.transactionType;
        if(selectedProduct){
            setLoading(true)
            setSelectedProductName(productData?.data.content.find(product => product.id === selectedProduct)?.name);
            getData(`products/${selectedProduct}/stock-movements?type=${type_ ? type_ : ''}&page=${page-1}&sort=recordedDate,desc`)
                .then((res)=>{
                    if(res && res.data){
                        setStockData(res.data);
                        setCurrentPagination({
                            ...currentPagination,
                            total: res.data.productStockList.totalElements
                        })
                        setLoading(false);
                        setVisible(false);
                    }
                })
                .catch(err => {console.log("err: "+err);setLoading(false)})
        }
        else{
            Modal.warn({
                title: "Please select a product!",
                onOk: () => {
                    return
                },
            })
        }
    };
    const export_ = (values, setSubmitting) => {
        let type = values.transactionType ? values.transactionType : '';
        let id = values.productList;
        setSubmitting(false);
        getData(`products/${id}/stock-movements?type=${type}&size=1000&sort=recordedDate,desc`)
            .then(response => {
                if (response.data) {
                    let _exportData = []
                    let responseData = response.data.productStockList.content
                    responseData.forEach((o) => {
                        let data = {
                            dateInventory:o.createdOn,
                            quantityIn:o.quantityIn,
                            quantityOut:o.quantityOut,
                            transactionType:o.transactionType,
                            inputStockCount:o.input_stock_count,
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
        { label: 'Date Inventory', key: 'dateInventory' },
        { label: 'Quantity In', key: 'quantityIn' },
        { label: 'Quantity Out', key: 'quantityOut' },
        { label: 'Transaction Type', key: 'transactionType' },
        { label: 'Input Stock Count', key: 'inputStockCount' },
    ]
    return (
        <>
            <Row justify="center">
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Card>
                    <Form form={form} layout="vertical" onFinish={(values) => onFinish(values)}>
                        <Row gutter={16} justify='center' align='middle'>
                        <Col xs={24} sm={16} md={10} lg={10} xl={10}>
                            <Form.Item name="productList" required>
                            <Select
                                placeholder="Select a product"
                                loading={prodPending}
                                onChange={(value) => setSelectedProduct(value)}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                allowClear
                                style={{ width: '100%' }}
                            >
                                {productData &&
                                productData?.data.content.map((product) => (
                                    <Select.Option key={product.id} value={product.id}>
                                    {product.name}
                                    </Select.Option>
                                ))}
                            </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                            <Form.Item name="transactionType">
                            <Select
                                placeholder="Select Transaction Type"
                                options={[
                                { value: 'SOLD', label: 'SOLD' },
                                { value: 'ADJUSTMENT', label: 'ADJUSTMENT' },
                                { value: 'INVENTORY', label: 'INVENTORY' },
                                { value: 'DAMAGED_INVENTORY', label: 'DAMAGED_INVENTORY' },
                                ]}
                                onChange={(val) => {
                                    setType(val);
                                    onFinish({transactionType:val});
                                }}
                                optionFilterProp="children"
                                allowClear
                            ></Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    {t('Search')}
                                </Button>
                                &nbsp;
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
                </Col>
            </Row>

            {loading ? <Loading/> : ""}
            {stockData && <>
            <Row justify="center" gutter={[16,16]}style={{ marginTop: '10px' }}>
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                    <Card style={{ textAlign: 'center',height:'100%' }}>
                        <Typography.Title level={4}>{selectedProductName}</Typography.Title>
                        <Image src={stockData?.productStockList.content[0]?.product?.imageUrl?.substring(stockData?.productStockList.content[0].product.imageUrl.indexOf('/api'))} alt="Product" style={{ width: '20%', height:'20%', objectFit:'cover', marginTop:15 }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                    <Card style={{ textAlign: 'center', height:'100%' }} type='inner'>
                        <Typography.Title level={3} style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>{t("Inventory")}</Typography.Title>
                        <Row >
                            <Col flex='100%' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', }}>
                                <Typography.Title style={{ fontSize: '2em', marginBottom: 0, color: 'blue', }}>{stockData?.quantityIn?.toLocaleString()} / {stockData?.damagedQty?.toLocaleString()}</Typography.Title>
                                <Typography.Title style={{ fontSize: '1.3em', fontWeight: 0, marginTop: 0, color: '#00556b' }}>{t("Quantity In")}    / {t("Damage Quantity")}</Typography.Title>
                            </Col>
                            <Col flex='100%' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                <Typography.Title style={{ fontSize: '2em', marginBottom: 0, color: 'green', }}>{stockData?.quantityOut?.toLocaleString()}</Typography.Title>
                                <Typography.Title style={{ fontSize: '1.3em', fontWeight: 0, marginTop: 0, color: '#6b0000' }}>{t("Quantity Out")}</Typography.Title>
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                    <Card style={{ textAlign: 'center',height:'100%' }} type='inner'>
                        <Typography.Title level={3} style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>{t("Adjustment")}</Typography.Title>
                        <Row >
                            <Col flex='100%' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', }}>
                                <Typography.Title style={{ fontSize: '2em', marginBottom: 0, color: 'grey', }}>{stockData?.adjQuantityIn?.toLocaleString()}</Typography.Title>
                                <Typography.Title style={{ fontSize: '1.3em', fontWeight: 0, marginTop: 0, color: '#00556b' }}>{t("Adjustment In")}</Typography.Title>
                            </Col>
                            <Col flex='100%' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                <Typography.Title style={{ fontSize: '2em', marginBottom: 0, color: 'red', }}>{stockData?.adjQuantityOut?.toLocaleString()}</Typography.Title>
                                <Typography.Title style={{ fontSize: '1.3em', fontWeight: 0, marginTop: 0, color: '#6b0000' }}>{t("Adjustment Out")}</Typography.Title>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
            <Row justify="center" style={{ marginTop: '16px' }}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Table 
                        dataSource={stockData?.productStockList.content} 
                        columns={fields} 
                        pagination={currentPagination} 
                        onChange={(pagination, filters, sort, extra) => {
                            fetchData(pagination, filters, sort, extra)
                        }}
                        rowClassName={(record) => record.transactionType === 'ADJUSTMENT' || record.transactionType === 'DAMAGED_INVENTORY' ? 'adjustment-damaged-row' : ''}
                    />
                </Col>
            </Row>
            </>}
        </>
    );
}

const fields = [
    {
        key: 'createdOn',
        title: 'Date Inventory',
        dataIndex: 'createdOn',
        render: (text) => new Date(text).toISOString().split('T')[0],
        flex:2,
    },
    {
        key: 'quantityIn',
        title: 'Quantity In',
        dataIndex: 'quantityIn',
        align:'center',
        flex:2,
    },
    {
        key: 'quantityOut',
        title: 'Quantity Out',
        dataIndex: 'quantityOut',
        align:'center',
        flex:2,
    },
    {
        key: 'transactionType',
        title: 'Transaction Type',
        dataIndex: 'transactionType',
        align:'center',
        flex:3,
    },
    {
        key:'inputStockCount',
        title: 'Input Stock Count',
        dataIndex: 'inputStockCount',
        align:'center',
        flex:2,
    }
]
export default StockMovement;
