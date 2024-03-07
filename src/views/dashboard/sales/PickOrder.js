import { CButton, CCard, CCardBody, CCardHeader, CCollapse, CContainer, CModal, CModalBody, CModalHeader, CDataTable } from "@coreui/react";
import { useState, useEffect } from 'react';
import { MyTextField, MyDateField, MuiAutocomplete } from '../../../components/FormFields'
import { useTranslation } from 'react-i18next';
import { Formik, Form } from "formik";
import moment from 'moment';
import useFetch from '../../../hooks/useFetch'
import { useHistory } from 'react-router'
import { Link } from 'react-router-dom';
import { IconButton } from "@material-ui/core";
import CIcon from "@coreui/icons-react";
import toast from 'react-hot-toast'
import { putData } from "src/services/NetworkService";

const PickOrder = () => {

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('&startDate=' + moment().subtract(1, "days").valueOf()
        + '&endDate=' + moment().valueOf() + '&id=-1' + '&page=' + (page - 1));
    const { error, isPending, data } = useFetch('prestashop/orders?url=/pickOrder' + search);
    const [orders, setOrders] = useState(null);
    const { t } = useTranslation();
    const history = useHistory();
    const { data: user } = useFetch('employeeprofile');
    const { data: riders } = useFetch('employees?jobId=7');
    const [fields, setFields] = useState([])
    const [order, setOrder] = useState(null)
    useEffect(() => {
        if (data && user) {                   
            console.log('1')            
            if (user.jobId != '16' && user.jobId != '1') {
                data.data.content = data.data.content.filter(o => o.rider?.id == user.id)
            }            
            let formattedDateData = []
            data.data.content.forEach((o) => {
                o.dateAdd = moment(o.dateAdd).format("DD/MM/YY hh:mm");
                formattedDateData.push(o)
            })
            data.data.content = formattedDateData;
            setOrders(data) 
            fields.length = 0;          
            fields.push(
                { key: 'dateAdd', label: 'Date', _style: { flex: '20%'} },
                { key: 'reference', label: 'Reference', _style: { width: '15%'}, renderCell: (params) => ( 
                    <Link to="#" onClick={(e) => {
                                        console.log(e)
                                        history.push({
                                            pathname: '/pickOrder' + '/' + params.id,
                                            data: params
                                        })
                                    }}>{params.value}</Link>
                ) },
                { key: 'giftMessage', label: 'Status', _style: { width: '30%'} }                
                )
            if (user.jobId != '7') {                
                fields.push(
                    {key: 'rider', label: 'Assigned to', _style: { width: '20%'}},
                    {key: 'assignLead', label: 'Assign Rider', _style: { width: '15%'}, sorter: false, filter: false}
                )
            }
            setFields(fields)
        }        
    },[data, user])  

    const handlePage = (page_) => {
        setPage(page_);
        setSearch(search.replace('&page=' + (page - 1), '&page=' + (page_ - 1)))
    };
    
    const [visibility, setVisibility] = useState(false)    
    const selectRider = (item, index) => {
        setOrder(item)
        // setVisibility(!visibility)
        toggleDetails(index)
    }    

    const [details, setDetails] = useState([])    
    const toggleDetails = (index) => {
        const position = details.indexOf(index)
        let newDetails = details.slice()
        if (position !== -1) {
          newDetails.splice(position, 1)
        } else {
          newDetails = [...details, index]
        }
        setDetails(newDetails)
    }

    return (
        <>
            <CCard>
            <CCardHeader className={'col-sm-12 header-background'}>Filters</CCardHeader>
            <Formik
                initialValues={{
                    startDate: moment().subtract(1, "days").valueOf(),
                    endDate: moment().valueOf()
                }}
                enableReinitialize={false}
                onSubmit={(values, { setSubmitting }) => {
                    setSubmitting(true)
                    let queryString = '';
                    for (const key in values) {
                        if (values[key]) {
                            queryString += '&' + key + '=' + values[key]
                        }
                    }
                    queryString += '&page=0';
                    setSearch(queryString)
                    console.log(queryString)
                    setSubmitting(false)
                }}>
                {({ errors, isSubmitting, setFieldValue, setSubmitting, values }) =>
                    <Form style={{ padding: '20px', paddingBottom: '0px' }}>
                        <div className="row">
                            <div className="col-sm-2">
                                <MyTextField placeholder={t("Reference")} name="referenceNo" label={t("Order Ref")} />
                            </div>
                            <div className="col-sm-2">
                                <MyTextField placeholder={t("Product Name")} name="productName" label={t("Product Name")} />
                            </div>                            
                            <div className="col-sm-3">
                                <MyDateField
                                    name="startDate"
                                    label={t("Start date")}
                                    setFieldValue={setFieldValue}
                                />
                            </div>
                            <div className="col-sm-3">
                                <MyDateField
                                    name="endDate"
                                    label={t("End date")}
                                    setFieldValue={setFieldValue}
                                />
                            </div>
                            <div className="col-sm-2">
                                <button disabled={isSubmitting} className="btn btn-sm btn-primary">{t('Search')}</button>&nbsp;
                            </div>
                            {/* <div className="col-sm-2">
                                        <button disabled={isSubmitting} className="btn btn-sm btn-primary">{t('Search')}</button>&nbsp;
                                        {
                                            <><button type="button" disabled={isSubmitting} color='default' style={{ textDecoration: 'underline' }} className="btn btn-link btn-sm" onClick={() => { export_(values, setSubmitting); }}>{t('Export')}</button>&nbsp;</>
                                        }
                                        {exportData && <CSVLink hidden color='default' style={{ textDecoration: 'underline' }} filename={`${exportDate}.csv`} headers={headers} id="export_link" data={exportData}>{t('Export')}</CSVLink>}
                                    </div> */}
                        </div>
                    </Form>
                }
            </Formik>
        </CCard>        
        {
            orders && 
            <>                
                <CCard style={{padding: '30px 20px'}}>
                    <CCardBody style={{border: '1px solid #D8DBE0', padding: '0px 0px 25px 0px'}}>
                        <CDataTable
                            items={orders.data.content}
                            fields={fields}                        
                            scopedSlots={{
                                'rider':
                                (item)=>(
                                    <td>{item.rider?.fullname}</td>
                                ),
                                'reference': (item) => (<td><Link to={`/pickOrder/${item.id}`}>{item.reference}</Link></td>),
                                'assignLead':
                                (item, index)=>(
                                    <td style={{padding: '10px 40px'}}>
                                        <IconButton size="small" href="#" onClick={(e) => {
                                            e.preventDefault()
                                            selectRider(item, index)
                                        }}>
                                            <CIcon title="Assign Rider" size={'sm'} name={'cilArrowRight'} />
                                        </IconButton>
                                    </td>
                                ),
                                'details':
                                (item, index)=>{
                                return (
                                <CCollapse show={details.includes(index)}>
                                    <CCard style={{margin: 0, borderRadius: 0, borderWidth: 0, display: 'flex', alignItems: 'flex-end'}}>
                                        <CCardBody style={{padding: '35px 50px 0px'}}>
                                            <Formik
                                                initialValues={{
                                                    rider: ''
                                                }}
                                                onSubmit={(values,{resetForm, setSubmitting }) => {
                                                    setSubmitting(true)
                                                    toast.promise(putData('prestashop/order/map-rider?orderId=' + item.id + "&empId=" + values.rider.id,
                                                                                                        item
                                                                                                    ),
                                                                    {
                                                                        loading: "Loading",
                                                                        success: (resp) => {
                                                                            setSubmitting(false)
                                                                            let orders_ = orders
                                                                            setOrders(null)
                                                                            orders_.data.content.map(o => {
                                                                                if (o.id === item.id) {
                                                                                    o.rider = riders?.data.content.find(r => r.id === values.rider.id)
                                                                                }
                                                                            })
                                                                            setOrders(orders_)
                                                                            toggleDetails(index)
                                                                            return "Rider assigned successfully"
                                                                        },
                                                                        error: (e) => {
                                                                            setSubmitting(false)
                                                                            return "Error assigning rider. Contact technical support."
                                                                        }
                                                                    },
                                                                    {
                                                                        style: {
                                                                            minWidth: '180px',
                                                                        },
                                                                        position: "bottom-center"
                                                                    }

                                                                )

                                                    setVisibility(false)
                                                    setSubmitting(false)
                                                }}
                                            >
                                                {({values, setFieldValue, isSubmitting}) => (
                                                    <Form style={{width: '300px', display: 'flex', flexDirection: 'column',}}>
                                                        <div className="row">
                                                            <div className="col-sm-10" style={{marginTop: -25}}>
                                                                <MuiAutocomplete
                                                                    data={riders?.data?.content || []}
                                                                    setFieldValue={setFieldValue}
                                                                    placeholder={t('Enter Rider Name')}
                                                                    displayKey={'fullname'}
                                                                    name="rider"
                                                                    val={item.rider}
                                                                />

                                                            </div>
                                                            <div className="col-sm-2">
                                                                <CButton type="submit" disabled={isSubmitting} color="primary" size="sm" shape="rounded">{t("Submit")}</CButton>
                                                            
                                                            </div>
                                                        </div>
                                                    </Form>
                                                )}
                                            </Formik>
                                        </CCardBody>
                                    </CCard>
                                </CCollapse>
                                )
                            }
                            }}
                        />
                    </CCardBody>
                </CCard>
            </>
        }
        {
            // visibility &&
            // <CCollapse show={visibility}>

            //     <CContainer
            //         style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: 0, position: 'relative', bottom: '200px'}}
            //     >
            //         <CCard style={{backgroundColor: 'white',padding: '5px 0px 20px 30px',
            //             display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: '2px'}
            //         }>
            //             <CCardBody style={{display: 'flex', justifyContent: 'center'}}>
            //                 <Formik
            //                     initialValues={{
            //                         rider: ''
            //                     }}
            //                     onSubmit={(values,{resetForm, setSubmitting }) => {
            //                         setSubmitting(true)
            //                         toast.promise(putData('prestashop/order/mapRider?orderId=' + order.id + "&empId=" + values.rider.id,
            //                                                                               order
            //                                                                           ),
            //                                         {
            //                                             loading: "Loading",
            //                                             success: (resp) => {
            //                                                 setSubmitting(false)
            //                                                 let orders_ = orders
            //                                                 setOrders(null)
            //                                                  orders_.data.content.map(o => {
            //                                                      if (o.id === order.id) {
            //                                                          o.rider = riders?.data.content.find(r => r.id === values.rider.id)
            //                                                      }
            //                                                  })
            //                                                 setOrders(orders_)
            //                                                 return "Rider assigned successfully"
            //                                             },
            //                                             error: (e) => {
            //                                                 setSubmitting(false)
            //                                                 return "Error assigning rider. Contact technical support."
            //                                             }
            //                                         },
            //                                         {
            //                                             style: {
            //                                                 minWidth: '180px',
            //                                             },
            //                                             position: "bottom-center"
            //                                         }

            //                                     )

            //                         setVisibility(false)
            //                         setSubmitting(false)
            //                     }}
            //                 >
            //                     {({values, setFieldValue, isSubmitting}) => (
            //                         <Form style={{width: '300px', display: 'flex', flexDirection: 'column'}}>
            //                             <div className="row">
            //                               <div className="col-sm-12">
            //                                 <MuiAutocomplete
            //                                     data={riders?.data?.content}
            //                                     setFieldValue={setFieldValue}
            //                                     placeholder={t('Enter Rider Name')}
            //                                     displayKey={'fullname'}
            //                                     name="rider"
            //                                     val={order.rider}
            //                                 />

            //                               </div>
            //                             </div>
            //                             <div className="row">
            //                               <div className="col-sm-12">
            //                                 <CButton type="submit" disabled={isSubmitting} color="primary" size="sm" shape="rounded">{t("Submit")}</CButton>
            //                                 &nbsp;
            //                                 <CButton type="button" onClick={()=>setVisibility(false)} disabled={isSubmitting} color="dark" size="sm" shape="rounded">{t("Dismiss")}</CButton>
            //                               </div>
            //                             </div>
            //                         </Form>
            //                     )}
            //                 </Formik>
            //             </CCardBody>
            //         </CCard>
            //     </CContainer>
            // </CCollapse>
        }
    </>
    )
}

export default PickOrder;
