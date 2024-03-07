import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik, Form } from "formik";
import useFetch from '../../../hooks/useFetch'
import AdjustFields from "./AdjustmentFields";
import { putData, postData } from 'src/services/NetworkService';
import { SuccessMsg } from './../order/LocationFields';
import { getData } from '../../../services/NetworkService';
import toast from 'react-hot-toast';
import {
  useParams,
} from "react-router-dom"
import MainTable from '../../../components/MainTable'
import moment from 'moment'
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const Adjustment = (props) => {

    const { t } = useTranslation();
    const { error, isPending, data } = useFetch('products/all/');
    const [successMsg, setSuccessMsg] = useState('')
    const [err, setError] = useState('');
    const { id } = useParams();
    const { data:stockCountDetail } = useFetch(`stock-counts/${id}`);
    const [lineItems, setLineItems] = useState()
    const [products, setProducts] = useState()
    const [autoCompleteValue, setAutoCompleteValue] = useState(null);

    let typeArray = [
        { id: 1, name: 'Quantity In' },
        { id: 2, name: 'Quantity Out' }
    ];

    const [initialValues, setInitialValues] = useState({
        id: null,
        name: null,
        externalSystemId: null,
        lotNumber: null,
        expiry: null,
        quantity: null,
        location:null,
        balance: null,
        recordedDate: null,
        recordedTime: null,
        transactionType: null,
        selectedDate: moment().valueOf(),
        prestashopProductId: null
    });

    const [stockUpdateDTO, setStockUpdateDTO] = useState([{
        productId: null,
        count: null
    }])

    useEffect(() => {
        if (data && stockCountDetail) {
            setInitialValues(initialValues);
            // var prod_ = []
            // let countedMap = new Map()
            // stockCountDetail.data.stockCountLineItemDtos.map(o => {
            //     countedMap.set(o.productId, o.productId)
            // })
            // data.data.content.map(o => {
            //     if (countedMap.get(o.id) == null) {
            //         prod_.push(o)
            //     }
            //     return o
            // })
            // data.data.content = prod_
            setProducts(data)
            setLineItems(stockCountDetail.data.stockCountLineItemDtos)
        }
    }, [data, stockCountDetail])

    // const handleSubmit = (values, setSubmitting, setFieldValue) => {
    //     if (window.confirm('Are you sure you want to publish this stock on e-commerce?')) {
    //         values.stockUpdateDTO[0].productId = values.initialValues.prestashopProductId;
    //         values.stockUpdateDTO[0].count = values.initialValues.quantity;
    //         toast.promise(putData('prestashop/product/stock', values.stockUpdateDTO),
    //             {
    //                 loading: "Loading",
    //                 success: (response) => {                        
    //                     putData('prestashop/adjustment', values)
    //                         .then((resp) => {                                
    //                         }).catch((e) => console.log(e))
    //                     postData(`stock-counts/${id}/line-items`, { quantity: values.initialValues.quantity, productId: values.initialValues.id })
    //                         .then((resp) => {
    //                             resp.data.data.productName = data.data.content.find(o => o.id === values.initialValues.id)?.name
    //                             data.data.content = data.data.content.filter(o => o.id !== values.initialValues.id)
    //                             setProducts(data)
    //                             setInitialValues(values.initialValues)
    //                             setLineItems([...lineItems, resp.data.data])
    //                         }).catch((e) => console.log(e))
    //                     setSubmitting(false)
    //                     return "Stock count successful"
    //                 },
    //                 error: (e) => {
    //                     console.log(e)
    //                     setSubmitting(false)
    //                     return "Error while update. Contact technical support."
    //                 }
    //             },
    //             {
    //                 style: {
    //                     minWidth: '180px',
    //                 },
    //                 position: "bottom-center"
    //             })                            
    //     }        
    //     setSubmitting(false)
    //     return false
    // }

    const handleSubmit = async (values, setSubmitting, setFieldValue) => {
        const isDuplicate = lineItems.some(item => (
            item.productId === values.initialValues.id &&
            item.location === values.initialValues.location?.name &&
            item.lotNumber === values.initialValues.lotNumber
        ));
    
        if (isDuplicate) {
            toast.error("Duplicate stock entry. Please choose a different combination.");
            setSubmitting(false);
            return;
        }
        Modal.confirm({
            title: 'Confirmation',
            content: (
              <div>
                <p>{t(`Product quantity will be synced with ecommerce store. Are you sure you want to continue?`)}</p>
              </div>
            ),
            onCancel(){
                setSubmitting(false)
            },
            async onOk() {
                try{
                    const response = await putData('prestashop/adjustment',values)
                    let resp;   
                    if(values.initialValues.location === null || values.initialValues.lotNumber === null){
                        resp = await postData(`stock-counts/${id}/line-items`,{quantity:values.initialValues.quantity,productId:values.initialValues.id});    
                    }
                    else{
                        resp = await postData(`stock-counts/${id}/line-items`,{location:values.initialValues.location.name,
                                                                                    locationId: parseInt(values.initialValues.location.id, 10),
                                                                                    lotNumber:values.initialValues.lotNumber,
                                                                                    quantity:values.initialValues.quantity,
                                                                                    productId:values.initialValues.id});
                    }

                    if(!resp && !resp?.data.data){
                        toast.error(t("This Product does not exist on Prestashop. Try again later"));
                        setSubmitting(false);
                        return;
                    }
                    else{
                        resp.data.data.productName = values.initialValues.name;
                        // data.data.content = data.data.content.filter(o => o.id !== values.initialValues.id)
                        setProducts(data)
                        setInitialValues({
                            ...values.initialValues,
                            lotNumber:'',
                            quantity: '',
                            location:{
                                id:'',
                                name:''
                            },
                        })
                        setAutoCompleteValue(null);
                        setLineItems([...lineItems, resp.data.data])
                        toast.success("Stock count successful");
                    }
                }
                catch{
                    console.log(error);
                    toast.error("Error while updating. Contact technical support.");
                }
                finally{
                    setSubmitting(false);
                }
        }})
    }

    const fields = [

        { field: 'productName', headerName: 'Product', flex: 2, },
        {
            field:'location',
            headerName:'Location',
            flex:1,
        },
        {
            field:'lotNumber',
            headerName:'Lot Number',
            flex:1,
        },
        {
            field: 'quantity',
            headerName: 'Stock Count',
            flex: 1,
        },
        {
            field: 'createdBy',
            headerName: 'Initiator',
            flex: 1,
        },
    ]

    return (
        <>
            {products && initialValues && stockCountDetail?.data && !(stockCountDetail.data.status === 'CLOSED' || stockCountDetail.data.status === 'CANCELLED') &&
                <Formik
                    initialValues={{ initialValues, stockUpdateDTO }}
                    enableReinitialize={true}
                    onSubmit={(values, { setSubmitting }) => {
                        if(values.initialValues.prestashopProductId)
                            handleSubmit(values, setSubmitting);
                        else{
                            Modal.info({
                                title:"Info",
                                icon: <ExclamationCircleOutlined/>,
                                content:(
                                    <div>
                                        <p>“Product is not mapped with ecommerce, please map before adding the stock count”</p>
                                    </div>
                                ),
                                onOk(){
                                    setSubmitting(false)
                                }
                            })
                        }
                    }}>
                    {({ errors, isSubmitting, setFieldValue, setSubmitting, values, setValues }) =>
                        <Form>
                            <AdjustFields
                                productsData={products}
                                values={values}
                                stockCountDetail={stockCountDetail.data}
                                setValues={setValues}
                                isSubmitting={isSubmitting}
                                setFieldValue={setFieldValue}
                                setAutoCompleteValue={setAutoCompleteValue}
                                autoCompleteValue={autoCompleteValue}
                                typeArray={typeArray}>
                            </AdjustFields>
                        </Form>
                    }
                </Formik>
            }

            {
                lineItems &&
                <MainTable
                    tableTitle='Product Line Items'
                    fields={fields}
                    data={lineItems.reverse()}
                    error={error}
                />
            }
        </>
    )
}

export default Adjustment;
