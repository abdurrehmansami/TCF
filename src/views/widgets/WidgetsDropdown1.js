import React, { useEffect, useState } from 'react'
import { CWidgetDropdown, CRow, CCol, } from '@coreui/react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import Loading from '../../components/Loading'

const WidgetsDropdown1 = ({ employee, startDate, endDate, stats }) => {
    const { t } = useTranslation()
    const history = useHistory();
    const [director, setdirector] = useState(false)
    useEffect(() => {
        if (employee && (employee.jobName === 'Directeur général' || employee.jobName === 'Directeur Administratif' || employee.jobName === 'Floor manager')) {
            setdirector(true)
        }
    }, [employee])

    const handleAction = (data) => {
        if (!director) {
            return;
        }
        history.push({
            pathname: '/orders',
            data: data
        })
    }

    const handleSalesAction = (startDate, endDate) => {
        history.push({
            pathname: '/product-sales',
            data: {
                startDate: startDate , 
                endDate: endDate
            }
        })
    }
    return (
        <>
            <CRow>
                <CCol mb="12" lg="4">
                    <a href={null} style={{ cursor: 'pointer' }} onClick={() => handleAction('startDate=' + startDate + '&endDate=' + endDate +"&status=NEW" )}>
                        <CWidgetDropdown className="card-padding"
                            color="gradient-primary"
                            header={stats && stats?.newOrders?.toString()}
                            text={(stats?.newOrders > 1 ? t('New Orders') : t('New Order'))
                            }
                        />
                    </a>
                </CCol>
                <CCol sm="4" lg="4">
                    <a href={null} style={{ cursor: 'pointer' }} onClick={() => handleAction('startDate=' + startDate + '&endDate=' + endDate +"&status=VALIDATED")}>
                        <CWidgetDropdown className="card-padding"
                            color="gradient-warning"
                            header={stats?.validatedOrders?.toString()}
                            text={(stats?.validatedOrders > 1 ? t('Orders Validated') : t('Order Validated'))}
                        />
                    </a>
                </CCol>
                <CCol sm="4" lg="4">
                    <a href={null} style={{ cursor: 'pointer' }} onClick={() => handleAction('startDate=' + startDate + '&endDate=' + endDate +"&status=CONFIRMED")}>
                        <CWidgetDropdown className="card-padding"
                            color="gradient-success"
                            header={stats?.inTransitOrders?.toString()}
                            text={(stats?.inTransitOrders > 1 ? t('Orders In Transit') : t('Order In Transit'))
                            }
                        />
                    </a>
                </CCol>
            </CRow>
            <CRow>
                <CCol sm="6" lg="4">
                    <a href={null} style={{ cursor: 'pointer' }} onClick={() => handleAction('startDate=' + startDate + '&endDate=' + endDate +"&status=RECEIVED")}>
                        <CWidgetDropdown className="card-padding"
                            color="gradient-info"
                            header={stats?.receivedOrders?.toString()}
                            text={(stats?.receivedOrders > 1 ? t('Orders Received') : t('Order Received'))}
                        />
                    </a>
                </CCol>
                <CCol sm="6" lg="4">
                    <a href={null} style={{ cursor: 'pointer' }} onClick={() => handleAction('startDate=' + startDate + '&endDate=' + endDate +"&status=STOCKED")}>
                        <CWidgetDropdown className="card-padding"
                            color="gradient-success"
                            header={stats?.stockedOrders?.toString()}
                            text={(stats?.stockedOrders > 1 ? t('Orders Stocked') : t('Order Stocked'))}
                        />
                    </a>
                </CCol>
                <CCol sm="6" lg="4">
                    <a href={null} style={{ cursor: 'pointer' }} onClick={() => handleAction('startDate=' + startDate + '&endDate=' + endDate +"&status=CANCELLED")}>
                        <CWidgetDropdown className="card-padding"
                            color="gradient-danger"
                            header={stats?.cancelledOrders?.toString()}
                            text={(stats?.cancelledOrders > 1 ? t('Orders Cancelled') : t('Order Cancelled'))}
                        />
                    </a>
                </CCol>
                <CCol sm="6" lg="4">
                    <a href={null} style={{ cursor: 'pointer' }} onClick={() => handleSalesAction(startDate , endDate )} >
                        <CWidgetDropdown className="card-padding"
                            color="gradient-danger"
                            header={stats?.totalSaleAmount !== null ? "€ " + parseFloat(stats?.totalSaleAmount).toFixed(2)?.toString() : "€ 0"}
                            text={(stats?.totalSalesQuantity > 1 ? t('E-Commerce Sales') : t('E-Commerce Sales'))}
                        />
                    </a>
                </CCol>
            </CRow>
        </>
    )
}

export default WidgetsDropdown1
