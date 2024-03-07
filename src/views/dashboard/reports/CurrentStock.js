import { useState, useEffect } from 'react';
import MainTable from '../../../components/MainTable3'
import useFetch from '../../../hooks/useFetch'
import { useTranslation } from 'react-i18next';
import { getData } from '../../../services/NetworkService';
import moment from 'moment';
import { CSVLink } from "react-csv";
import '../../../scss/style.scss';
import { Card, Form, Button, Select, Checkbox,Row,Col } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { getDataWithParams } from '../../../services/NetworkService';
const { Option } = Select;
const CurrentStock = () => {
    const [productData,setProductData] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showZeroCount, setShowZeroCount] = useState(false);
    const [exportDate, setExportDate] = useState(null);
    const [exportData, setExportData] = useState(null);
    const [final, setFinal] = useState(false)
    const { isPending:prodPending, data:products } = useFetch('products?size=1000');
    const [stockCountData, setStockCountData] = useState(null);
    const { data: stockData, error: error, isPending: isPending } = useFetch('products/stock');
    const [loading,setLoading] = useState(false);
    const { t } = useTranslation();
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
        if(stockData){
            setStockCountData(stockData);
            setCurrentPagination({
                current: 1,
                pageSize: stockData.data.size, total: stockData.data.totalElements
            })
        }
        setFinal(true)
    },[stockData])

    useEffect(() => {
        if (exportData) {
            setTimeout(() => document.getElementById('export_link').click(), 500)
        }
    }, [exportData])

    const fetchData = (pagi, filters, sort, extra, currentStatus) => {
        setLoading(true);
        const pagination = pagi || currentPagination;
        getDataWithParams("products/stock?", {
          productId: selectedProduct,
          showZeroStock:showZeroCount,
          flag:form.getFieldValue('flag')?.valueOf(),
          size: pagination.pageSize,
          page: pagination.current - 1,
        })
          .then((response) => {
            if (response.data && response.data.data) {
              setStockCountData(response.data)
              setCurrentPagination({
                ...pagination,
                total: response.data.data.totalElements,
              });
            }
            else{
              setStockCountData([]);
            }
            setLoading(false);
          })
          .catch((error) => {
            setLoading(false);
          });
    };

    const export_ = (values) => {
        let queryString = '';
        for (const key in values) {
            if (values[key]) {
                queryString += key + '=' + values[key] + '&'
            }

        }
        getData('products/stock?' + queryString + 'isPageable=false')
            .then(response => {
                if (response.data) {
                    let _exportData = []
                    let responseData = response.data.data.content
                    responseData.forEach((o) => {
                        let data = {
                            productId: o.id, 
                            productName: o.name,
                            locationName:o.locationName,
                            lotNumber:o.lotNumber,
                            totalQuantity: o.totalQuantity
                        }
                        _exportData.push(data)
                    })
                    setExportDate(new Date().getTime())
                    setExportData(_exportData)
                }
            })
            .catch(error => {
                console.log(error)
            })

    }

    const handleCheckboxChange = (e) => {
        setShowZeroCount(e.target.checked);
    }
    return (
        <>
            {final &&
                <MainTable
                    title={"Current Stock"}
                    HeadingParagraph={"Current Stock"}
                    showFilter={true}
                    fields={fields}
                    data={stockCountData}
                    error={error}
                    isPending={isPending}
                    pagination={currentPagination}
                    isLoading={loading}
                    onChangeCallBack={fetchData}
                    body={
                        <Card style={{ marginBottom: 20 }}>
                            <Form
                                form={form}
                                initialValues={{
                                flag: 'ACTIVE',
                                showZeroCount: false,
                                }}
                                onFinish={() => fetchData()}
                            >
                                <Row gutter={16} justify="start">
                                <Col xs={24} sm={16} md={10} lg={10} xl={10}>
                            <Form.Item name="productId" required>
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
                                <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                                    <div style={{ border: '1px solid #d9d9d9', borderRadius: '5px', paddingLeft: '10px', height: '32px' }}>
                                        <Form.Item name="showZeroCount" valuePropName="checked" style={{ marginBottom: 0 }}>
                                            <Checkbox onChange={handleCheckboxChange}>{t('Include Zero Count')}</Checkbox>
                                        </Form.Item>
                                    </div>
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
                                    <Button type="default" onClick={() => export_(form.getFieldsValue())}>
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
            }
        </>
    )
}
export default CurrentStock;
const productFlag = [
    {
        id: 1,
        value: 'ACTIVE'
    }, 
    {
        id: 2,
        value: 'DELETED'
    }
];
const fields = [
    {
        key:'name',
        title:'Product',
        dataIndex:'name',
        dataId:'id',
        flex:3
    },
    {
        key:'locationName',
        title:'Location',
        dataIndex:'locationName',
        dataId:'id',
        flex:3
    },
    {
        key:'lotNumber',
        title:'Lot Number',
        dataIndex:'lotNumber',
        dataId:'id',
        flex:3
    },
    {
        key:'totalQuantity',
        title:'Quantity',
        dataIndex:'totalQuantity',
        flex:2
    },

];
const headers = [
    { label: 'Product Id', key: 'productId' },
    { label: 'Product Name', key: 'productName' },
    {label: 'Location', key: 'locationName' },
    {label: 'Lot Number', key: 'lotNumber' },
    { label: 'Quantity', key: 'totalQuantity' },
];