import useFetch from '../../../hooks/useFetch'
import { useState, useEffect } from 'react';
import MainTable from '../../../components/MainTable'
import { useTranslation } from 'react-i18next';
import { Formik, Form } from "formik";
import { getData } from '../../../services/NetworkService';
import moment from 'moment';
import { MyTextField, MyDateField, MuiAutocomplete } from '../../../components/FormFields'
import { CSVLink } from "react-csv";
import { Link } from 'react-router-dom';
import { useHistory } from 'react-router'
import { CCard, CCardBody, CCardHeader, CCardText } from '@coreui/react';
import '../../../scss/style.scss';

const PrestashopOrders = () => {
    const [page, setPage] = useState(1);
    const { t } = useTranslation();
    const [sDate, setSdate] = useState(moment().subtract(1, "days").valueOf());
    const [eDate, setEdate] = useState(moment().valueOf());    
    const [productFilter, setProductFilter] = useState(null);
    const [referenceFilter, setReferenceFilter] = useState(null);
    const [exportDate, setExportDate] = useState(null);
    const [exportData, setExportData] = useState(null);
    const [search, setSearch] = useState('startDate=' + moment().subtract(1, "days").valueOf()
                            + '&endDate=' + moment().valueOf() + '&id=-1' + '&page=' + (page - 1));
    const [id, setId] = useState(null);
    const history = useHistory();
    const [initialValues, setInitialValues] = useState({ orderId: '', updatedBy: '', reference: '', dateAdded: '', products: [] });
    const { data: user } = useFetch('employeeprofile');
    const [userJobId, setUserJobId] = useState({id:''});
    let date = '';
    const { error, isPending, data } = useFetch('prestashop/orders?' + search);
    const {statusError, statusIsPending, data:orderStatuses} = useFetch('prestashop/order/statuses')
    const [orders, setOrders] = useState(null);
    const [statuses, setStatuses] = useState([])

    const fields = [

        { field: 'dateAdd', headerName: 'Created Date', flex: 1 },
        { field: 'clientName', headerName: 'Customer Name', flex: 1 },
        {
            field: 'reference', headerName: 'Reference', flex: 1, dataId: 'id', renderCell: (params) => (
                <Link to="#" onClick={(e) => {
                    console.log(e)
                        setId(params);
                        history.push({
                            pathname: '/sales-orders' + '/' + params.id,
                            data: params
                        })
                }}>{params.value}</Link>
            )
        },
        { field: 'totalPaidTaxIncl', headerName: 'Price Tax Incl', flex: 1 },
        { field: 'totalPaidTaxExcl', headerName: 'Price Tax Excl', flex: 1 },
        { field: 'giftMessage', headerName: 'Status', flex: 1 }
    ]

    const headers = [
        { label: 'Created Date', key: 'dateAdd' },
        { label: 'Customer Name', key: 'clientName' },
        { label: 'Reference', key: 'reference' },
        { label: 'Price Tax Incl', key: 'totalPaidTaxIncl' },
        { label: 'Price Tax Excl', key: 'totalPaidTaxExcl' },
        { label: 'Status', key: 'giftMessage' }
    ]

    const handlePage = (page_) => {
            setPage(page_);
            setSearch(search.replace('&page=' + (page - 1), '&page=' + (page_ - 1)))
    };

    useEffect(() => {
        if (data) {
            let formattedDateData = []
            data.data.content.forEach((o) => {
                if (o.currentState == 26 || o.currentState == 29 || o.currentState == 33 || o.currentState == 35
                    || o.currentState == 34 || o.currentState == 36) {
                    console.log(o.dateAdd)
                    o.dateAdd = moment(o.dateAdd).format("DD/MM/YY hh:mm");
                    console.log(o.dateAdd)
                    formattedDateData.push(o)
                }
            })
            data.data.content = formattedDateData;
            if (formattedDateData.length == 0) {
                data.data.totalPages = 0;
            }
            setOrders(data);
        }
    }, [data])

    useEffect(() => {
        if (orderStatuses) {
            orderStatuses?.data?.map(e => {
                if (e != null) {
                    statuses.push({
                        id: e,
                        value: e
                    })
                }
            })
            setStatuses(statuses)
            console.log(statuses)
        }
    }, [orderStatuses])

    useEffect(() => {
        if (user) {
            setSearch(search.replace('&id=-1', '&id=' + user.jobId))
        }
    }, [user])

    useEffect(() => {
        if (exportData) {
            setTimeout(() => document.getElementById('export_link').click(), 500)
        }
    }, [exportData])

    const export_ = (values, setSubmitting) => {
        setSubmitting(false)
        let queryString = '';
        for (const key in values) {
            if (values[key]) {
                queryString += key + '=' + values[key] + '&'
            }

        }
        getData('prestashop/orders?' + queryString + 'isPageable=false')
            .then(response => {
                if (response.data) {
                    let _exportData = []
                    let responseData = response.data.data.content
                    responseData.forEach((o) => {
                        let data = {
                            dateAdd: o.dateAdd, clientName: o.clientName,
                            reference: o.reference, totalPaidTaxIncl: o.totalPaidTaxIncl, totalPaidTaxExcl: o.totalPaidTaxExcl, currentState: o.currentState
                        }
                        _exportData.push(data)
                    })
                    setExportDate(new Date().getTime())
                    setExportData(_exportData)
                    setSubmitting(false)
                }
            })
            .catch(error => {
                setSubmitting(false)
                console.log(error)
            })

    }

    return ( <>
        {orders && orderStatuses &&
        <><CCard >
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
                                    queryString += key + '=' + values[key] + '&'
                                }

                            }
                            queryString += 'id=' + user.jobId + '&page=0';
                            setSearch(queryString)
                            setSubmitting(false)
                        }}>
                        {({ errors, isSubmitting, setFieldValue, setSubmitting, values }) =>
                            <Form style={{padding:'20px', paddingBottom: '0px'}}>
                                <div className="row">
                                    <div className="col-sm-2">
                                        <MyTextField placeholder={t("Reference")} name="referenceNo" label={t("Order Ref")} />
                                    </div>
                                    <div className="col-sm-2">
                                        <MyTextField placeholder={t("Product Name")} name="productName" label={t("Product Name")} />
                                    </div>
                                    <div className="col-sm-2 auto-complete-display" >
                                        <MuiAutocomplete
                                            data={statuses || []}
                                            setFieldValue={setFieldValue}
                                            placeholder={t('Status')}
                                            displayKey={'value'}
                                            valueKey={'id'}
                                            name="status"                                                                                                                                                                                                                                                                                                            
                                        /> 
                                    </div>                               
                                    {/* <div className="col-sm-2">
                                        <MyTextField placeholder={t("Status")} name="status" label={t("Order Status")} />
                                    </div> */}
                                    <div className="col-sm-2">
                                        <MyDateField
                                            name="startDate"
                                            label={t("Start date")}
                                            setFieldValue={setFieldValue}
                                        />
                                    </div>
                                    <div className="col-sm-2">
                                        <MyDateField
                                            name="endDate"
                                            label={t("End date")}
                                            setFieldValue={setFieldValue}
                                        />
                                    </div>
                                    <div className="col-sm-2">
                                        <button disabled={isSubmitting} className="btn btn-sm btn-primary">{t('Search')}</button>&nbsp;
                                        {
                                            <><button type="button" disabled={isSubmitting} color='default' style={{ textDecoration: 'underline' }} className="btn btn-link btn-sm" onClick={() => { export_(values, setSubmitting); }}>{t('Export')}</button>&nbsp;</>
                                        }
                                        {exportData && <CSVLink hidden color='default' style={{ textDecoration: 'underline' }} filename={`${exportDate}.csv`} headers={headers} id="export_link" data={exportData}>{t('Export')}</CSVLink>}
                                    </div>
                                </div>
                            </Form>
                        }

                    </Formik>
                    </CCard>
            {
                <MainTable
                    tableTitle={'Prestashop Orders'}
                    fields={fields}
                    data={orders}
                    error={error}
                    isPending={isPending}
                    handlePage={handlePage}
                >
                </MainTable>
            }
        </>
        }
        </>
    )
}

export default PrestashopOrders;
