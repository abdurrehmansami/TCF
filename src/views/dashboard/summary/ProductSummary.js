import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Col, Image, Row, Typography, Progress, DatePicker, Button, Radio, Skeleton, Drawer, Divider, Alert, notification, Select, Popover, Input } from "antd";
import { useTranslation } from "react-i18next";
import cake from './pexels-abhinav-goswami-291528.jpg';
import { MUI_Chart } from "src/components/MUI_Chart";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { getData } from "src/services/NetworkService";
import { useHistory } from "react-router-dom";
import { BarChartOutlined, CaretDownOutlined, CaretUpOutlined, ExclamationCircleOutlined, EyeFilled, FilePptOutlined, FrownOutlined, LineChartOutlined, SelectOutlined, StopOutlined } from "@ant-design/icons";

dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;

const ProductSummary = ({ location }) => {
  const { t } = useTranslation();
  const [prodId, setProdId] = useState(null)
  const [productList, setProductList] = useState(null)
  const [prodData, setProdData] = useState(null)
  const [startDate, setStartDate] = useState(dayjs().subtract(1, 'year').format('YYYY/MM/DD'))
  const [endDate, setEndDate] = useState(dayjs().format('YYYY/MM/DD')/*dayjs(startDate).add(1, 'day').format('YYYY/MM/DD')*/)
  // const [dateRange, setDateRange] = useState({startDate: 1670353200000, endDate: dayjs().valueOf()})
  const [rangeType, setRangeType] = useState('date')
  const [chartSize, setChartType] = useState('small')
  const [view, setView] = useState({colSpan: 12, colMarginBottom: 0, chartWidth: 450})
  const [drawerVisibility, setDrawerVisibility] = useState(false)
  const [drawerIdentifier, setDrawerIdentifier] = useState(null)
  const [vendorDrawerVisibility, setVendorDrawerVisibility] = useState(false)
  const [vendor, setVendor] = useState(null)
  const [error, setError] = useState(null)
  const [api, contextHolder] = notification.useNotification()
  const history = useHistory();
  const functionCounter = new Set();
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    location.state?.prodId && setProdId(location.state?.prodId);
    getData(`products/all`)
    .then(res=>{
      const productListData = res?.data?.data?.content || [];
      const productList = productListData.map(({ id, name }) => ({ id, value: name }));
      const uniqueProductsList = Array.from(new Set(productList.map(product => product.id)))
        .map(id => productList.find(product => product.id === id));

      setProductList(uniqueProductsList);
    })
    .catch(e=>{console.log('Error - All Products', e);});
    return ()=>{setProductList(null); setProdId(null);}
  }, [])
  console.log('prodData', prodData)
  
  useEffect(() => {
    if(startDate && endDate && prodId){
      setLoading(true)
      let sdate = dayjs(startDate).valueOf(), edate = dayjs(endDate).valueOf()
      getData(`products/${prodId}/summary?startDate=${sdate}&endDate=${edate}`)
        .then(res=>{
          if(res && res?.data){
            getapidata(res?.data?.data);
            console.log('api--resp', res?.data?.data)
            setLoading(false)
          }
          else{
            throw new Error(res.message);
          }
        })
        .catch((err) => {
          setError(err.message);
          setProdData(null)
          setLoading(false)
        });
      location.state?.prodId && history.replace('/product-summary', {});
    };
    return ()=>{setProdData(null); setError(null)};
  }, [prodId])

  const getapidata=(res)=>{
    const salesTrend=res?.salesTrend, purchasesTrend=res?.purchaseTrend, priceTrend=res?.priceTrend;
    let purchasesLabels=[], salesLabels=[], priceLabels=[], purchasesVal=[], salesVal=[], /*costsVal=[],*/ pricesVal=[], purchasesData=[], salesData=[], /*costsData=[],*/ pricesData=[];
    let maxLength = Math.max(salesTrend.length, purchasesTrend.length, priceTrend.length);
    let productImageURL = res?.productImageURL && res.productImageURL != '' ? res.productImageURL.substring(res?.productImageURL?.indexOf("/api")) : null
    
    for (let i=0; i<=maxLength; i++) {
      if(salesTrend.length != 0 && i < salesTrend.length){
        salesLabels.push(rangeType=='date' && salesTrend[i]?.dateOrdered ? `${i+1}) ${dayjs(dayjs(salesTrend[i]?.dateOrdered).valueOf()).format('MMM DD, YY')}` : `${rangeType} ${i+1}`)
        salesVal.push(salesTrend[i]?.orderedQuantity)
        salesData.push(dataObjFunc(dayjs(dayjs(salesTrend[i]?.dateOrdered).valueOf()).format('MMM DD, YY'), i, salesTrend[i]?.orderedQuantity, salesTrend[i-1]?.orderedQuantity))
      }
      if(priceTrend.length != 0 && i < priceTrend.length){
        priceLabels.push(rangeType=='date' && priceTrend[i]?.dateOrdered ? `${i+1}) ${dayjs(dayjs(priceTrend[i]?.dateOrdered).valueOf()).format('MMM DD, YY')}` : `${rangeType} ${i+1}`)
        pricesVal.push(priceTrend[i]?.averageProductPrice)
        pricesData.push(dataObjFunc(dayjs(dayjs(priceTrend[i]?.dateOrdered).valueOf()).format('MMM DD, YY'), i, priceTrend[i]?.averageProductPrice, priceTrend[i-1]?.averageProductPrice))
      }
      if(purchasesTrend.length != 0 && i < purchasesTrend.length){
        purchasesLabels.push(rangeType=='date' && purchasesTrend[i]?.dateOrdered ? `${i+1}) ${dayjs(dayjs(purchasesTrend[i]?.dateOrdered).valueOf()).format('MMM DD, YY')}` : `${rangeType} ${i+1}`)
        purchasesVal.push(purchasesTrend[i]?.orderedQuantity)
        purchasesData.push(dataObjFunc(dayjs(dayjs(purchasesTrend[i]?.dateOrdered).valueOf()).format('MMM DD, YY'), i, purchasesTrend[i]?.orderedQuantity, purchasesTrend[i-1]?.orderedQuantity))
      }
    }
    
    setProdData({
      name: res?.productName && res.productName != '' ? res.productName : null,
      productImageURL,
      availableStock: res?.availableStock && res.availableStock != '' ? res.availableStock : null,
      damagedStock: res?.damagedStock && res.damagedStock != '' ? res.damagedStock : null,
      description: res?.description && res.description != '' ? res.description : null,
      topVendors: res?.topVendors && res.topVendors != '' ? res.topVendors : null,
      productSales: res?.productSales && res.productSales != '' ? res.productSales : null,
      productCategory: {
        createdOn: res?.productCategory?.createdOn && res.productCategory.createdOn != '' ? res.productCategory.createdOn : null,
        updatedOn: res?.productCategory?.updatedOn && res.productCategory.updatedOn != '' ? res.productCategory.updatedOn : null,
        categoryName: res?.productCategory?.name && res.productCategory.name != '' ? res.productCategory.name : null,
        categoryType: res?.productCategory?.type && res.productCategory.type != '' ? res.productCategory.type : null,
      },
      purchases: {heading: 'Purchases', names: purchasesLabels, values: purchasesVal, data: purchasesData},
      sales: {heading: 'Sales', names: salesLabels, values: salesVal, data: salesData},
      prices: {heading: 'Price', names: priceLabels, values: pricesVal, data: pricesData}
    })
  }

  const searchBtnFunc = () => {
    if(startDate && endDate) {
      setLoading(true)
      let sdate = dayjs(startDate).valueOf(), edate = dayjs(endDate).valueOf()
      setProdData(null);
      getData(`products/${prodId}/summary?startDate=${sdate}&endDate=${edate}`).then(res=>{
        if(res && res?.data){
          getapidata(res?.data?.data);
          console.log('Search-Btn-Func--Resp', res?.data?.data)
          setLoading(false)
        } else {
          throw new Error(res.message);
        }
      }).catch(err=> {console.log('errorrrr', typeof(err)); setError(err.message); setLoading(false)})
    }
  }

  const dataObjFunc = (name, i, curr, prev) => {
    let percentage = i!=0 ? ((curr/prev)*100-100).toFixed(1).endsWith('.0') ? ((curr/prev)*100-100).toFixed(0) : ((curr/prev)*100-100).toFixed(1) : null
    let currVal = curr.toFixed(1).endsWith('.0') ? curr.toFixed(0) : curr.toFixed(1)
    return({name: name, value: currVal, percentageChange: percentage})
  }

  //Changes the chart layout style when size is selected
  useEffect(() => {
    chartSize=='large' ? setView(prev=>({...prev, colSpan: 24, colMarginBottom: 10, chartWidth: 1000}))
      : setView(prev=>({...prev, colSpan: 12, colMarginBottom: 0, chartWidth: 450}))
  }, [chartSize])

  //When start date is selected the end date is set to the very next date to the start date
  // useEffect(() => {
  //   setEndDate(dayjs(startDate).add(1, 'day').format('YYYY/MM/DD'));
  // }, [startDate])

  //Show error popup message when api gives error
  useEffect(() => {
  error && prodId && api.error({message: 'Error', description: error, onClose: ()=>setError(null)});
  }, [error])

  const SearchBar = () => {
    return(
      <Row gutter={16} justify='space-between'>
        {/* <Col flex='350px'>{rangeType && <div className="d-flex justify-content-center">
          <Radio.Group onChange={e=>setRangeType(e.target.value)} defaultValue={rangeType} buttonStyle='solid'>
            <Radio.Button disabled={!prodData && true} style={rangeType=='days' ? {backgroundColor: '#002140', color: '#fff'} : {backgroundColor: '#fff'}} value="days">Days</Radio.Button>
            <Radio.Button disabled={!prodData && true} style={rangeType=='weeks' ? {backgroundColor: '#002140', color: '#fff'} : {backgroundColor: '#fff'}} value="weeks">Weeks</Radio.Button>
            <Radio.Button disabled={!prodData && true} style={rangeType=='months' ? {backgroundColor: '#002140', color: '#fff'} : {backgroundColor: '#fff'}} value="months">Months</Radio.Button>
            <Radio.Button disabled={!prodData && true} style={rangeType=='years' ? {backgroundColor: '#002140', color: '#fff'} : {backgroundColor: '#fff'}} value="years">Years</Radio.Button>
          </Radio.Group></div>}
        </Col> */}
        <Col /*flex='auto'*/>{chartSize && <div className="d-flex justify-content-center ml-3">
          <Radio.Group disabled={!prodData || loading} onChange={e=>setChartType(e.target.value)} defaultValue={chartSize ?? 'small'} buttonStyle='solid'>
            <Radio.Button style={chartSize=='small' ? {backgroundColor: '#002140'} : {backgroundColor: '#fff'}} value="small">Small</Radio.Button>
            <Radio.Button style={chartSize=='large' ? {backgroundColor: '#002140'} : {backgroundColor: '#fff'}} value="large">Large</Radio.Button>
          </Radio.Group></div>}</Col>
        <Col /*flex='450px'*/>
          <Row gutter={8}>
            <Col span={9}><DatePicker disabled={!prodData || loading} defaultValue={dayjs(startDate ?? '2015/01/01', 'YYYY/MM/DD')} format='DD/MM/YYYY' onChange={date=>{date && setStartDate(dayjs(date?.$d).format('YYYY/MM/DD')); console.log('datepicker-start', date)}} /></Col>
            <Col span={9}><DatePicker disabled={!prodData || loading} defaultValue={dayjs(endDate ?? dayjs().format('YYYY/MM/DD'), 'YYYY/MM/DD')} format='DD/MM/YYYY' disabledDate={curr=>{return(dayjs(startDate) >= curr || dayjs() < curr);}} onChange={date=>{date && setEndDate(dayjs(date?.$d).format('YYYY/MM/DD')); console.log('datepicker-end', date)}} /></Col>
            <Col span={6}><Button disabled={!prodData || loading} style={{background: '#002140'}} type="primary" onClick={searchBtnFunc}>Search</Button></Col>
          </Row>
        </Col>
      </Row>
    )
  }

  const VendorDetails = () => {
    return(
      <Drawer width={400} placement="right" onClose={()=>setVendorDrawerVisibility(false)} open={vendorDrawerVisibility}>
        <Row>
          <Typography.Title level={4} style={{marginBottom: 20, textTransform: 'capitalize', color: '#909090'}}>{vendor?.name ?? '--'}</Typography.Title>
        </Row>
        <Row>
          <Col span={24}>
            {vendor && <>
              <Row className="mb-1" gutter={8}>
                <Col span={10}><Typography.Text style={{fontSize: 12, fontWeight: 400, color: '#808080'}}>SiretNumber</Typography.Text></Col>
                <Col span={14}><Typography.Text style={{fontSize: 14, color: '#606060'}}>{vendor?.siretNumber ?? '--'}</Typography.Text></Col>
              </Row>
              <Row className="mb-1" gutter={8}>
                <Col span={10}><Typography.Text style={{fontSize: 12, fontWeight: 400, color: '#808080'}}>IdentificationNumber</Typography.Text></Col>
                <Col span={14}><Typography.Text style={{fontSize: 14, color: '#606060'}}>{vendor?.identificationNumber ?? '--'}</Typography.Text></Col>
              </Row>
              <Row className="mb-1" gutter={8}>
                <Col span={10}><Typography.Text style={{fontSize: 12, fontWeight: 400, color: '#808080'}}>Address DTO</Typography.Text></Col>
                <Col span={14}><Typography.Text style={{fontSize: 14, color: '#606060'}}>{vendor?.addressDto ?? '--'}</Typography.Text></Col>
              </Row>
              <Row className="mb-1" gutter={8}>
                <Col span={10}><Typography.Text style={{fontSize: 12, fontWeight: 400, color: '#808080'}}>Admin Contact DTO</Typography.Text></Col>
                <Col span={14}><Typography.Text style={{fontSize: 14, color: '#606060'}}>{vendor?.adminContactDto ?? '--'}</Typography.Text></Col>
              </Row>
              <Row className="mb-1" gutter={8}>
                <Col span={10}><Typography.Text style={{fontSize: 12, fontWeight: 400, color: '#808080'}}>Amount of Capital</Typography.Text></Col>
                <Col span={14}><Typography.Text style={{fontSize: 14, color: '#606060'}}>{vendor?.amountOfCapital ?? '--'}</Typography.Text></Col>
              </Row>
              <Row className="mb-1" gutter={8}>
                <Col span={10}><Typography.Text style={{fontSize: 12, fontWeight: 400, color: '#808080'}}>Phone:</Typography.Text></Col>
                <Col span={14}><Typography.Text style={{fontSize: 14, color: '#606060'}}>{vendor?.phone ?? '--'}</Typography.Text></Col>
              </Row>
              <Row className="mb-1" gutter={8}>
                <Col span={10}><Typography.Text style={{fontSize: 12, fontWeight: 400, color: '#808080'}}>Fax</Typography.Text></Col>
                <Col span={14}><Typography.Text style={{fontSize: 14, color: '#606060'}}>{vendor?.fax ?? '--'}</Typography.Text></Col>
              </Row>
            </>}
          </Col>
        </Row>
      </Drawer>
    )
  }

  const vendorLinkClick = (id) => {
    let filteredVendor = prodData?.topVendors ? prodData?.topVendors?.filter(item=>item?.id == id)[0] : null
    setVendor(filteredVendor)
    setVendorDrawerVisibility(true)
  }

  return (
    <>
      {vendorDrawerVisibility && <VendorDetails />}
      {drawerVisibility && <DetailedView prodData={prodData} drawerVisibility={drawerVisibility} drawerIdentifier={drawerIdentifier} onClose={()=>{setDrawerIdentifier(null); setDrawerVisibility(false)}} />}
      {contextHolder}
      <Row gutter={16} style={{marginBottom:10}}>
        <Col span={24}>
          <Card>
            <Row justify='space-between'>
              <Col>
                <Typography.Title level={3} style={{ fontFamily: 'Arial, sans-serif', fontSize: '2em', color: '#001529' }}>{t("Product Summary")}</Typography.Title>
              </Col>
                <Col>
                  <Row gutter={24} align='middle'>
                    <Col>
                      <Popover title={<Typography.Text style={{fontSize: 14, color: '#606060'}}>Product dropdown</Typography.Text>} trigger="hover"
                      content={
                        <Typography.Text style={{color: '#808080'}}>Select a product from dropdown to<br />
                        see detail and graphical representation</Typography.Text>
                      }>
                        <ExclamationCircleOutlined style={{fontSize: 16, color: '#808080', cursor: 'pointer'}} />
                      </Popover>
                    </Col>
                    <Col>
                      {productList ?
                        <Select
                          defaultValue={productList.find(prod => prod?.id === prodId)?.value}
                          showSearch
                          placeholder="Select a product"
                          optionFilterProp="children"
                          onChange={(_, option)=>setProdId(option.id)}
                          filterOption={(input, option) => (option?.value ?? "").toLowerCase().includes(input.toLowerCase())}
                          // options={productList} --> leads to duplication of products list
                          options={productList.map(prod => ({ ...prod, key: prod.id }))}
                          style={{width: 400}}
                        />
                        :
                        <Input placeholder="Loading..." disabled style={{width: 400}} />
                      }
                    </Col>
                  </Row>
                </Col>
                
            </Row>
            <Divider style={{margin: '10px 0'}} />
            {prodId ? 
              prodData ?
                <Row gutter={16}>
                  <Col span={8}>
                      <Typography.Title style={{fontSize: '2em', fontWeight: '400px', minHeight: 32, color: '#001529'}}>{t(prodData?.name ?? '')}</Typography.Title>
                      {prodData?.productImageURL ? <Image src={prodData.productImageURL} alt="Product" width={260} height={260} /> :
                        <Image width={260} height={260} fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg==" />
                      }
                  </Col>
                  <Col span={9}>
                    <Card style={{height: '100%'}} type='inner'>
                      <Typography.Title style={{fontSize: '1.5em', fontWeight: '400px', lineHeight: 2, color: '#001529'}}>{t("Details")}</Typography.Title>
                      <Typography.Paragraph style={{fontSize: '1.1em', lineHeight: 1, color: '#808080'}}>{t("Category Name")}: <span style={{color: '#001529', marginLeft: 10}}>{prodData?.productCategory?.categoryName ?? 'N/A'}</span></Typography.Paragraph>
                      <Typography.Paragraph style={{fontSize: '1.1em', lineHeight: 1, color: '#808080'}}>{t("Category Type")}: <span style={{color: '#001529', marginLeft: 10}}>{prodData?.productCategory?.categoryType ?? 'N/A'}</span></Typography.Paragraph>
                      <Typography.Paragraph style={{fontSize: '1.1em', lineHeight: 1, color: '#808080'}}>{t("Created On")}: <span style={{color: '#001529', marginLeft: 10}}>{prodData?.productCategory?.createdOn ? dayjs(prodData?.productCategory?.createdOn).format('MMM DD, YYYY') : prodData?.productCategory?.updatedOn ? dayjs(prodData?.productCategory?.updatedOn).format('MMM DD, YYYY') : 'N/A' }</span></Typography.Paragraph>
                      <Typography.Paragraph style={{fontSize: '1.1em', color: '#808080'}}>{t("Description")}: <span style={{color: '#001529', marginLeft: 10}}>{prodData?.description ?? 'No Description'}</span></Typography.Paragraph>
                    </Card>
                  </Col>
                  <Col span={7}>
                    <Card style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}} type='inner'>
                      <Row gutter={[0, 40]}>
                        <Col flex='100%' style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                          <Typography.Title style={{fontSize: '4em', marginBottom: 0, color: '#0096bc', minHeight: 64}}>{prodData?.availableStock ? prodData.availableStock.toLocaleString('fr-FR') : 0}</Typography.Title>
                          <Typography.Title style={{fontSize: '1em', fontWeight: 0, marginTop: 0, color: /*'#00556b'*/'#001529'}}>{t("Available Stock")}</Typography.Title>
                        </Col>
                        <Col flex='100%' style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                          <Typography.Title style={{fontSize: '4em', marginBottom: 0, color: '#ba0600', minHeight: 64}}>{prodData?.damagedStock ? prodData.damagedStock.toLocaleString() : 0}</Typography.Title>
                          <Typography.Title style={{fontSize: '1em', fontWeight: 0, marginTop: 0, color: /*'#6b0000'*/'#001529'}}>{t("Damaged Stock")}</Typography.Title>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
                :
                <Row gutter={16}>
                  <Col span={8}>
                    <Row gutter={[0,12]}>
                      <Col span={24}><Skeleton.Input active={loading} size="large" block /></Col>
                      <Col span={24}><Skeleton.Image active={loading} style={{width: 260, height: 260}} /></Col>
                    </Row>
                  </Col>
                  <Col span={9}>
                    <Card style={{height: '100%'}} type='inner'>
                      <Row gutter={[0,24]}>
                        <Col span={24}><Skeleton.Input active={loading} size={18} /></Col>
                        <Col span={24}>
                          <Row gutter={[0,6]}>
                            <Col span={24}><Skeleton.Input active={loading} size={14} /></Col>
                            <Col span={24}><Skeleton.Input active={loading} size={14} /></Col>
                            <Col span={24}><Skeleton.Input active={loading} size={14} /></Col>
                            <Col span={24}><Skeleton active={loading} size={14} /></Col>
                          </Row>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                  <Col span={7}>
                    <Card style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}} type='inner'>
                      <Row gutter={[0, 40]}>
                        <Col span={24}>
                          <Row gutter={[0, 10]}>
                            <Col span={24} style={{textAlign: 'center'}}><Skeleton.Input active={loading} size={48} /></Col>
                            <Col span={24} style={{textAlign: 'center'}}><Skeleton.Input active={loading} size={12} /></Col>
                          </Row>
                        </Col>
                        <Col span={24}>
                          <Row gutter={[0, 10]}>
                            <Col span={24} style={{textAlign: 'center'}}><Skeleton.Input active={loading} size={48} /></Col>
                            <Col span={24} style={{textAlign: 'center'}}><Skeleton.Input active={loading} size={12} /></Col>
                          </Row>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>                
            :
            <Row justify='center'>
              <Col span={24} style={{background: '#f8f8f8', height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                <SelectOutlined style={{fontSize: 60, color: '#8f8f8f'}} />
                <Typography.Text style={{fontSize: 18, color: '#8f8f8f', marginTop: 15}}>Select a product to see results</Typography.Text>
              </Col>
            </Row>
            }
          </Card>
        </Col>
      </Row>
      {prodId &&
        (prodData ?
          <>
            <Row gutter={16} style={{marginBottom:10}}>
              <Col span={12} style={{minHeight: 110}}>
                <Card style={{height: '100%'}}>
                  <Typography.Title style={{fontSize: '1.5em', fontWeight: '400px', color: '#001529'}}>{t("Purchases")}</Typography.Title>
                  <Row align='bottom'>
                    <Col flex='22%'><Typography.Text style={{fontSize: 16, color: '#808080'}}>{t("Top Vendors")} :</Typography.Text></Col>
                    <Col flex='78%'>{!prodData?.topVendors ? 
                      (<Typography.Text style={{fontSize: 14, color: '#606060'}}>No Vendors Available</Typography.Text>)
                      :
                      prodData.topVendors.map((item, i)=>(<Button key={i} type="text" size='small' style={{color: '#001529', fontWeight: 500}} onClick={()=>vendorLinkClick(item?.id)}>{item?.name}</Button>))
                    }</Col>
                  </Row>
                </Card>
              </Col>
              <Col span={12} style={{minHeight: 110}}>
                <Card style={{height: '100%'}}>
                  <Typography.Title style={{fontSize: '1.5em', fontWeight: '400px', color: '#001529'}}>{t("Sales")}</Typography.Title>
                  <div className="d-flex flex-row justify-content-start align-items-baseline">
                    <Typography.Text style={{fontSize: 16, color: '#808080', marginRight: 18}}>{t("Total Sales")} :</Typography.Text>
                    {!prodData?.productSales ?
                      <Typography.Text style={{fontSize: 14, color: '#606060'}}>No Sales Available</Typography.Text>
                      :
                      <Typography.Text style={{fontSize: 14, fontWeight: 500, color: '#001529'}}>
                        {prodData?.productSales?.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR'})}
                      </Typography.Text>
                    }
                  </div>
                </Card>
              </Col>
            </Row>
            <Row gutter={16} style={{marginBottom:10}}>
              <Col span={24}>
                <Card size='small'>
                  <SearchBar />
                </Card>
              </Col>
            </Row>
            <Row gutter={[16, 16]} justify='center' style={{marginBottom:10}}>
              <Col span={view.colSpan ?? 12}>
                <Card style={{height: 285}}>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <Typography.Title style={{fontSize: '1.5em', fontWeight: '400px', color: '#001529'}}>{t("Sales Trend")}</Typography.Title>
                    <Button type='text' shape='circle' onClick={()=>{setDrawerVisibility(true); setDrawerIdentifier('sales')}}><EyeFilled style={{fontSize: 16, color: '#002140'}} /></Button>
                  </div>
                  {
                    prodData?.sales?.values.length != 0 ?
                      <MUI_Chart
                        chartType='line'
                        tickLabels={prodData?.sales?.names}
                        data={prodData?.sales?.values}
                        margin={{top: 10, right: 10, bottom: 10, left: 70}} width={view.chartWidth ?? 450} height={200} color='#4f9fbc'
                        tickLabelStyle={{transform: 'translate(-8px, 5px) rotate(-50deg)', textAnchor: 'end', textTransform: 'capitalize'}} />
                      : <Skeleton.Node style={{width: view.chartWidth ?? 450, height: 200, display: 'flex', flexDirection: 'column', background: '#f6f6f6'}}>
                          <StopOutlined style={{fontSize: 60, color: '#8f8f8f'}} />
                          <Typography.Text style={{fontSize: 18, color: '#8f8f8f', marginTop: 5}}>No Data</Typography.Text>
                        </Skeleton.Node>
                  }
                </Card>
              </Col>
              <Col span={view.colSpan ?? 12}>
                <Card style={{height: 285}}>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <Typography.Title style={{fontSize: '1.5em', fontWeight: '400px', color: '#001529'}}>{t("Price Trend")}</Typography.Title>
                    <Button type='text' shape='circle' onClick={()=>{setDrawerVisibility(true); setDrawerIdentifier('prices')}}><EyeFilled style={{fontSize: 16, color: '#002140'}} /></Button>
                  </div>
                  {
                    prodData?.prices?.values.length != 0 ?
                      <MUI_Chart
                        chartType='line'
                        tickLabels={prodData?.prices?.names}
                        data={prodData?.prices?.values} barGap={.3}
                        margin={{top: 10, right: 10, bottom: 10, left: 70}} width={view.chartWidth ?? 450} height={200} color='#a080a0'
                        tickLabelStyle={{transform: 'translate(-4px, 10px) rotate(-50deg)', textAnchor: 'end', textTransform: 'capitalize'}} />
                      : <Skeleton.Node style={{width: view.chartWidth ?? 450, height: 200, display: 'flex', flexDirection: 'column', background: '#f6f6f6'}}>
                          <StopOutlined style={{fontSize: 60, color: '#8f8f8f'}} />
                          <Typography.Text style={{fontSize: 18, color: '#8f8f8f', marginTop: 5}}>No Data</Typography.Text>
                        </Skeleton.Node>
                  }
                </Card>
              </Col>
              <Col span={view.colSpan ?? 12}>
                <Card style={{height: 285}}>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <Typography.Title style={{fontSize: '1.5em', fontWeight: '400px', color: '#001529'}}>{t("Purchases Trend")}</Typography.Title>
                    <Button type='text' shape='circle' onClick={()=>{setDrawerVisibility(true); setDrawerIdentifier('purchases')}}><EyeFilled style={{fontSize: 16, color: '#002140'}} /></Button>
                  </div>
                  {
                    prodData?.purchases?.values.length != 0 ?
                      <MUI_Chart
                        chartType='line'
                        tickLabels={prodData?.purchases?.names}
                        data={prodData?.purchases?.values}
                        margin={{top: 10, right: 10, bottom: 10, left: 70}} width={view.chartWidth ?? 450} height={200} color='#a04040'
                        tickLabelStyle={{transform: 'translate(0, 30px) rotate(-50deg)', textAnchor: 'end', textTransform: 'capitalize'}} />
                      : <Skeleton.Node style={{width: view.chartWidth ?? 450, height: 200, display: 'flex', flexDirection: 'column', background: '#f6f6f6'}}>
                          <StopOutlined style={{fontSize: 60, color: '#8f8f8f'}} />
                          <Typography.Text style={{fontSize: 18, color: '#8f8f8f', marginTop: 5}}>No Data</Typography.Text>
                        </Skeleton.Node>
                  }
                </Card>
              </Col>
            </Row>
          </>
          :
          <>
            <Row gutter={16} style={{marginBottom:10}}>
              <Col span={12}>
                <Card style={{height: '100%'}}>
                  <Row gutter={[0,20]}>
                    <Col span={24}><Skeleton.Input active={loading} size={18} /></Col>
                    <Col span={24}>
                      <Row gutter={24}>
                        <Col span={8}><Skeleton.Input active={loading} size={16} /></Col>
                        <Col span={8}><Skeleton.Input active={loading} size={16} /></Col>
                        <Col span={8}><Skeleton.Input active={loading} size={16} /></Col>
                      </Row>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{height: '100%'}}>
                  <Row gutter={[0,20]}>
                    <Col span={24}><Skeleton.Input active={loading} size={18} /></Col>
                    <Col span={24}>
                      <Row gutter={24}>
                        <Col span={8}><Skeleton.Input active={loading} size={16} /></Col>
                        <Col span={8}><Skeleton.Input active={loading} size={16} /></Col>
                        <Col span={8}><Skeleton.Input active={loading} size={16} /></Col>
                      </Row>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
            <Row gutter={16} style={{marginBottom:10}}>
              <Col span={24}>
                <Card size='small'>
                  <SearchBar />
                </Card>
              </Col>
            </Row>
            <Row gutter={16} justify='center' style={{marginBottom:10}}>
              <Col span={12}>
                <Card style={{height: 285}}>
                  <Row gutter={[0,12]}>
                    <Col span={24}>
                      <Row justify='space-between'>
                        <Col><Skeleton.Input active={loading} size={16} /></Col>
                        <Col><Skeleton.Avatar active={loading} size={18} /></Col>
                      </Row>
                    </Col>
                    <Col span={24}>
                      <Skeleton.Node style={{width: 450, height: 200}} active={loading}>
                        <LineChartOutlined style={{fontSize: 120, color: '#bfbfbf'}} />
                      </Skeleton.Node>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{height: 285}}>
                  <Row gutter={[0,12]}>
                    <Col span={24}>
                      <Row justify='space-between'>
                        <Col><Skeleton.Input active={loading} size={16} /></Col>
                        <Col><Skeleton.Avatar active={loading} size={18} /></Col>
                      </Row>
                    </Col>
                    <Col span={24}>
                      <Skeleton.Node style={{width: 450, height: 200}} active={loading}>
                        <LineChartOutlined style={{fontSize: 120, color: '#bfbfbf'}} />
                      </Skeleton.Node>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </>)
      }
    </>
  );
};

export default ProductSummary;


const DetailedView = ({prodData, drawerVisibility, drawerIdentifier, onClose}) => {
  const [visibleItems, setVisibleItems] = useState(30);
  const renderedProdDataRef = useRef([]);
  renderedProdDataRef.current = prodData[drawerIdentifier].data.slice(0, visibleItems)
  return(
    <Drawer width={370} placement="right" onClose={onClose} open={drawerVisibility}>
      <Typography.Title level={4} style={{marginBottom: 20, textTransform: 'capitalize', color: '#909090'}}>{prodData[drawerIdentifier].heading} Trend</Typography.Title>
      {renderedProdDataRef.current.length != 0 && renderedProdDataRef.current.map((item, i)=>(<>
        <Card key={i} size='small' style={{marginBottom: 15, boxShadow: '1px 1px 6px 0px rgba(128, 128, 128, .2)'}}>
          <Row justify='start' style={{ margin: 0, padding: 0}}><Col><Typography.Text style={{fontSize: 10, fontWeight: 'bold', color: '#001529'}}>#{i+1}</Typography.Text></Col></Row>
          <Row align='bottom'>
            <Col span={9} className="mb-1">
              <Typography.Text style={{fontSize: 14, fontWeight: 500, textTransform: 'capitalize', color: '#909090', marginBottom: 5}}>{item?.name}</Typography.Text>
            </Col>
            <Col span={7}>
              <Row justify='start' align='bottom'>
                <Col span={24}><Typography.Text style={{fontSize: 8, fontWeight: 500, color: '#909090'}}>{prodData[drawerIdentifier].heading}</Typography.Text></Col>
                <Col span={24}><Typography.Text style={{fontSize: 14, fontWeight: 500, color: '#606060'}}>{item?.value}</Typography.Text></Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row justify='start' align='bottom'>
                <Col span={24}><Typography.Text style={{fontSize: 8, fontWeight: 500, color: '#909090'}}>Change in %</Typography.Text></Col>
                <Col span={24}>
                {item?.percentageChange == 'NaN' || item?.percentageChange == 'Infinity' || !item?.percentageChange ?
                  <Typography.Text style={{fontSize: 10, fontWeight: 700, color: '#3f3435'}}>N / A</Typography.Text>
                  : item?.percentageChange!=0 ? <>
                      {Math.sign(item?.percentageChange) == -1 ?
                      <CaretDownOutlined style={{fontSize: 18, color: '#ea4b02', marginRight: 2}} />
                      : <CaretUpOutlined style={{fontSize: 18, color: '#02ea19', marginRight: 2}} />}
                    <Typography.Text style={{fontSize: 14, fontWeight: 600, color: Math.sign(item?.percentageChange) == -1 ? '#ea4b02' : '#02ea19'}}>{Math.sign(item?.percentageChange) == 1 && '+'}
                      {item?.percentageChange}%</Typography.Text>
                  </>
                  : <Typography.Text style={{fontSize: 12, fontWeight: 600, color: '#c0c0c0'}}>no change</Typography.Text>}
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
        {(visibleItems < prodData[drawerIdentifier].data.length) && (i === renderedProdDataRef.current.length-1) &&
          <Button size="small" type="link" block onClick={()=>setVisibleItems(prev => prev + 30)}>{`Show more items (${prodData[drawerIdentifier].data.length - visibleItems} remains)`}</Button>}
        </>
      ))}
    </Drawer>
  )
}