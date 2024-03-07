import useFetch from '../../../hooks/useFetch'
import { useState, useEffect } from 'react';
import Expiry from "./ProductExpiryField";
import { useTranslation } from 'react-i18next';
import { Formik, Form } from "formik";
import { putData } from 'src/services/NetworkService';
import { getData } from '../../../services/NetworkService';
import { SuccessMsg } from './../order/LocationFields';
import Moment from 'moment'
import { useHistory } from 'react-router'
import toast from 'react-hot-toast'

const PrestashopOrderDetail = (props) => {
    console.log(props)
    let id = props.match.params.id;
    const [page, setPage] = useState(1);
    const history = useHistory();
    const { error: processingerror, pending, data: processed } = useFetch('prestashop/order/' + id);
    const { error, isPending, data } = useFetch('prestashop/order/' + id + "/products?page=" + (page - 1));
    const [products, setProducts] = useState(null);
    const [initialValues, setInitialValues] = useState({ orderId: id, updatedBy: '', reference: '', dateAdded: '', products: [], action: '' });
    const [disabled, setDisabled] = useState(false);
    const [processState, setProcessState] = useState(null);
    const { data: user } = useFetch('employeeprofile');
    const [submit, setSubmitting] = useState(false);
    let [successMsg, setSuccessMsg] = useState('')
    const { t } = useTranslation();
    const [loader, setLoader] = useState(false);
    const [resp, setResp] = useState(false);



    /**
     * Below description by usmanjaved
     * Non réglée - Traitement en cours = id 26
     * or
     * Réglée - Traitement en cours = id 29
     * <p>
     * <p>
     * then switch to :
     * Non réglée - En cours de préparation = 33
     * or
     * Réglée - En cours de préparation = 35
     * when order is prepare then switch to :
     * Non réglée - Commande prête = 34
     * or
     * Réglée - Commande prête = 36
     * <p>
     * when order is controlled then switch to :
     * Non réglée - Commande prête pour envoi = id 38
     * or
     * Réglée - Commande prête pour envoi = id 37
     */
    useEffect(() => {
        prodHandling()
    }, [data && user && processed])


    const prodHandling = () => {
        if (user) {
            if (processed) {
                console.log(processed.data.processed)
                initialValues.reference = processed.data.reference;
                initialValues.dateAdded = processed.data.updatedDate;
                initialValues.updatedBy = processed.data.updatedBy;
                initialValues.processed = processed.data.processed;
                initialValues.userId = user.id
                if (processed.data.currentState == '37' || processed.data.currentState == '38' || (user.jobId == '13' && (processed.data.currentState == '34' || processed.data.currentState == '36'))) {
                    getData('prestashop/order/' + id + '/processed-products')
                        .then(response => {
                            response.data.data.products.map((element, ind) => {
                                let imageUrl = null;
                                if (element.imageUrl != null) {
                                    imageUrl = element.imageUrl.substring(element.imageUrl.indexOf("/api"))
                                    // let host = 'https://intranet-staging.sdfoods.caansoft.com'
                                    // imageUrl = host.concat(imageUrl)
                                }
                                initialValues.products.push({
                                    id: element.prestashopProductId,
                                    name: element.name,
                                    quantity: element.quantity,
                                    imageUrl: imageUrl,
                                    fields: []
                                })
                                element.fields.map((ele, index) => {
                                    if (ele.flag == "ACTIVE") {
                                        initialValues.products[ind].fields.push({
                                            quantity: ele.quantity,
                                            expiry: ele.expiry ? Moment(ele.expiry).format('DD/MM/YYYY') : ele.expiry,
                                            lotNumber: ele.lotNumber,
                                            flag: ele.flag
                                        })
                                    }
                                })
                            })
                            setProducts(data);
                            setInitialValues(initialValues);
                            setLoader(true);
                            setDisabled(true)
                            setResp(true)
                        }
                        ).catch(error => {
                            console.log(error)
                        })
                } else if (processed.data.currentState == '33' || processed.data.currentState == '35' || processed.data.currentState === '34' || processed.data.currentState === '36') {
                    if (user && data) {
                        let hasUnMapped = false
                        let leng = data.data.content.filter((element) =>
                            element?.expiry || element?.lotNumber
                        )?.length
                        initialValues.updatedBy = processed.data.updatedBy == '' ? user.login : processed.data.updatedBy;

                        /* Single call for all product expiries and lot numbers 
                         * Nested call applied to resolve the delaying response issue 
                        */

                        let ids = 'ids=';
                        data.data.content.map((element, index) => {
                            if (element.systemProductId && (element.expiry || element.lotNumber)) {
                                ids += element.systemProductId + ','
                            }
                        })
                        ids = ids.substring(0, ids.length - 1)
                        getData('prestashop/product/expiries?' + ids)
                            .then((resp) => {
                                let expiriesMap = new Map();                                
                                if (resp.data.data) {
                                    resp.data.data.map((element, index) => {
                                        expiriesMap.set(element.productId, element.productLocationDtoList)
                                    })
                                }
                                console.log(expiriesMap)
                                data.data.content.map((element, index, elements) => {
                                    let imageUrl = null;
                                    if (element.imageUrl != null) {
                                        imageUrl = element.imageUrl.substring(element.imageUrl.indexOf("/api"))
                                        // let host = 'https://intranet-staging.sdfoods.caansoft.com'
                                        // imageUrl = host.concat(imageUrl);
                                    }
                                    let array = {
                                        id: element.systemProductId,
                                        name: element.productName,
                                        quantity: element.productQuantity,
                                        hasExpiry: element.expiry,
                                        hasLotNumber: element.lotNumber,
                                        lotNumberList: [],
                                        expiryList: [],
                                        fields: [],
                                        imageUrl: imageUrl,
                                        mapped: 1
                                    }
                                    if (processed.data.currentState == '33' || processed.data.currentState == '35') {
                                        array.fields = [{
                                            quantity: element.productQuantity,
                                            lotNumber: null,
                                            expiry: null
                                        }]
                                    }
                                    initialValues.products.push(array)

                                    if (!element.systemProductId) {
                                        initialValues.products[index].mapped = 0
                                        hasUnMapped = true
                                    }

                                    if (leng > 0) {
                                        if (element.systemProductId && (element.expiry || element.lotNumber)) {
                                            console.log(element.systemProductId)
                                            let mapEntry = expiriesMap.get(element.systemProductId)
                                            if (mapEntry) {
                                                if (element.lotNumber) {
                                                    mapEntry.map((ele, lotInd) => {
                                                        if (ele.lotNumber) {
                                                            initialValues.products[index].lotNumberList.push({
                                                                id: ele.lotNumber,
                                                                value: ele.lotNumber,
                                                            })
                                                        }
                                                    })
                                                }
                                                if (element.expiry) {
                                                    mapEntry.map((ele, expInd) => {
                                                        if (ele.expiry) {
                                                            initialValues.products[index].expiryList.push({
                                                                id: ele.expiry,
                                                                value: Moment(ele.expiry).format('DD/MM/YYYY'),
                                                            })
                                                        }
                                                    })
                                                }
                                            }
                                        }
                                    }
                                })
                                if (processed.data.currentState === '34' || processed.data.currentState === '36') {
                                    setLoader(false);
                                    getData('prestashop/order/' + id + '/processed-products')
                                        .then(response => {
                                            response.data.data.products.map((element, ind) => {
                                                element.fields.map((ele, index) => {
                                                    initialValues.products[ind]?.fields.push({
                                                        quantity: ele.quantity,
                                                        expiry: ele.expiry,
                                                        lotNumber: ele.lotNumber,
                                                        flag: ele.flag
                                                    })
                                                })
                                            })
                                            setInitialValues(initialValues);
                                            setLoader(true)
                                            console.log(initialValues.products)
                                            if (hasUnMapped) {
                                                toast.error('Highlighted products are not mapped with E-commerce. Contact admin for support!', { style: { minWidth: '500px' }, position: "top-center" })
                                            }
                                        }
                                        ).catch(error => {
                                            console.log(error)
                                        })
                                } else {
                                    setInitialValues(initialValues);
                                    setLoader(true)
                                    console.log(initialValues.products)
                                    if (hasUnMapped) {
                                        toast.error('Highlighted products are not mapped with E-commerce. Contact admin for support!', { style: { minWidth: '500px' }, position: "top-center" })
                                    }
                                }
                            })
                    }
                }
            }
        }
    }
    const handleSubmit = (values, setSubmitting) => {
        if (values.action == 'sync') {
            toast.promise(getData('prestashop/order/' + id + '/update'),
                {
                    loading: "Loading",
                    success: (resp) => {
                        setSubmitting(false)
                        //prodHandling()
                        window.location.reload()
                        return "Order synced successfully"
                    },
                    error: (e) => {
                        setSubmitting(false)
                        return "Error syncing order. Contact technical support."
                    }
                },
                {
                    style: {
                        minWidth: '180px',
                    },
                    position: "top-center"
                }

            )

        } else {

            if (values.products.filter(o => o.mapped === 0).length > 0) {
                toast.error('Highlighted products are not mapped with E-commerce. Contact admin for support!', { style: { minWidth: '500px' }, position: "bottom-center" })
                setSubmitting(false)
                return
            }

            toast.promise(putData('product/quantity/' + id + "?" + "action=" + values.action, values),
                {
                    loading: "Loading",
                    success: (resp) => {
                        if (resp.data.data === 'OK') {
                            setSubmitting(true);
                            let path = '';
                            if (user.jobId == '13') {
                                path = '/sales-orders'
                            } else {
                                path = '/sales-orders/' + id
                            }
                            setTimeout(() => history.push({
                                pathname: path,
                                data: id
                            }), 2000)
                            return "Order processed successfully."
                        } else {
                            return "Error processing order. Contact technical support."
                        }
                    },
                    error: (e) => {
                        setSubmitting(false)
                        return "Error processing order. Contact technical support."
                    }
                },
                {
                    style: {
                        minWidth: '180px',
                    }
                }
            )
        }
    }
    return (
        <>
            {loader &&
                <>
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize={true}
                        onSubmit={(values, { setSubmitting }) => {
                            handleSubmit(values, setSubmitting);
                        }}
                    >
                        {({ values, isSubmitting, setFieldValue, setValues }) => (
                            <Form>
                                {<Expiry
                                    orderData={processed}
                                    setFieldValue={setFieldValue}
                                    values={values}
                                    setValues={setValues}
                                    isSubmitting={isSubmitting}
                                    orderId={id}
                                    disabled={isSubmitting}
                                    disableForm={disabled}
                                    updated={submit}
                                    loader={loader}
                                    resp={resp}
                                />}
                            </Form>
                        )}
                    </Formik>
                </>
            }
        </>
    )
}

export default PrestashopOrderDetail;
