import { CCard, CCardHeader } from "@coreui/react";
import { useState, useEffect } from 'react';
import { MyTextField, MyDateField } from '../../../components/FormFields'
import { useTranslation } from 'react-i18next';
import { Formik, Form } from "formik";
import moment from 'moment';
import useFetch from '../../../hooks/useFetch'
import MainTable from '../../../components/MainTable'
import { useHistory } from 'react-router'
import { Link } from 'react-router-dom';

const DeliveryOrders = () => {

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('&startDate=' + moment().subtract(1, "days").valueOf()
        + '&endDate=' + moment().valueOf() + '&id=-1' + '&page=' + (page - 1));
    const { error, isPending, data } = useFetch('prestashop/orders?url=/orderToDeliver' + search);
    const [orders, setOrders] = useState(null);
    const { t } = useTranslation();
    const history = useHistory();

    useEffect(() => {
        if (data) {
            let formattedDateData = []
            data.data.content.forEach((o) => {
                o.dateAdd = moment(o.dateAdd).format("DD/MM/YY hh:mm");
                formattedDateData.push(o)
            })
            data.data.content = formattedDateData;
            setOrders(data)
        }
        console.log(orders)
    },[data])

    const fields = [

        { field: 'dateAdd', headerName: 'Created Date', flex: 1 },
        {
            field: 'reference', headerName: 'Reference', flex: 1, dataId: 'id', renderCell: (params) => (
                <Link to="#" onClick={(e) => {
                    history.push({
                        pathname: ("|37|38|".indexOf("|"+params.currentState+"|") !== -1 ? '/pickOrder' : 'ordersToDeliver') + '/' + params.id,
                        data: params
                    })
                }}>{params.value}</Link>
            )
        },
        { field: 'giftMessage', headerName: 'Status', flex: 1 }
    ]

    const handlePage = (page_) => {
        setPage(page_);
        setSearch(search.replace('&page=' + (page - 1), '&page=' + (page_ - 1)))
    };

    return (
        <>
            <CCard>
                <CCardHeader className={'col-sm-12 header-background'}>Filters</CCardHeader>
                <Formik
                    initialValues={{
                        startDate: moment().subtract(1, "days").valueOf(),
                        endDate: moment().valueOf()
                    }}
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
                                {/* <div className="col-sm-2">
                                        <MyTextField placeholder={t("Status")} name="status" label={t("Order Status")} />
                                    </div> */}
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
            { orders && <MainTable
                tableTitle={'Orders to be delievered'}
                fields={fields}
                data={orders}
                error={error}
                isPending={isPending}
                handlePage={handlePage}
            >
            </MainTable>}
        </>
    )
}

export default DeliveryOrders;
