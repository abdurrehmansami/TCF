import React, { lazy, useState, useEffect } from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { getData } from 'src/services/NetworkService';
import { MyDateField } from '../../components/FormFields'
import { Formik, Form } from "formik"
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CRow, CCallout, CCardFooter } from '@coreui/react'
import useFetch from 'src/hooks/useFetch';
import Loading from '../../components/Loading'
import CorePagination from 'src/components/CorePagination';
import { Pagination } from 'antd';
const WidgetsDropdown1 = lazy(() => import('../widgets/WidgetsDropdown1.js'))

const Dashboard = () => {
  const { t } = useTranslation()
  const [startDate, setStartDate] = useState(moment().date(1).valueOf())
  const [endDate, setEndDate] = useState(moment().endOf('month').valueOf())
  const [stats, setStats] = useState(null)
  const { data: employee } = useFetch('employeeprofile')
  const [page, setPage] = useState(0);

  console.log('page', page)
  console.log('stats',stats)
  useEffect(() => {
    getData('orders/dashboard?' + `page=${page}&size=10&sort=expiryDate&startDate=${moment().startOf('month').valueOf()}&endDate=${moment().endOf('month').valueOf()}`)
      .then(response => {
        if (response && response.data) {
          setStats(response.data.data)
        }
      })
      .catch(error=>console.log('error', error))
  }, [page])

  // const handlePage = pageNo => setPage(pageNo);

  return (
    <>
      <Formik
        initialValues={{ startDate: moment().startOf('month').valueOf(), endDate: moment().endOf('month').valueOf() }}
        onSubmit={(values, { setSubmitting }) => {
          setStats(null)
          let queryString = '';
          for (const key in values) {
            if (values[key]) {
              queryString += key + '=' + values[key] + '&'
            }
          }
          values.startDate && setStartDate(values.startDate)
          values.endDate && setEndDate(values.endDate)
          queryString = queryString.slice(0, -1)
          getData(`orders/dashboard?page=${page}&size=10&sort=expiryDate&` + queryString)
            .then(response => {
              setSubmitting(false)
              if (response.data) {
                setStats(response.data.data)
                setSubmitting(false)
              }
            })
            .catch(error => {
              setSubmitting(false)
              console.log(error)
            })
            .catch(error => {
              setSubmitting(false)
              console.log(error)
            })
        }}>
        {({ isSubmitting, setFieldValue }) => (
          <Form>
            <div className="row" style={{ background: 'white', paddingTop: 20, margin: '0 1px 25px 0px', borderRadius: 5 }}>
              <div className="col-sm-3"></div>
              <div className="col-sm-4"></div>
              <div className="col-sm-2">
                <MyDateField
                  name="startDate"
                  label={t("Start date")}
                  setFieldValue={setFieldValue} />
              </div>
              <div className="col-sm-2">
                <MyDateField
                  name="endDate"
                  label={t("End date")}
                  setFieldValue={setFieldValue} />
              </div>
              <div className="col-sm-1">
                <button style={{ marginTop: 2 }} disabled={isSubmitting} className="btn btn-primary">{t('Search')}</button>&nbsp;
              </div>
            </div>
          </Form>
        )}
      </Formik>
      {employee && stats && <WidgetsDropdown1 employee={employee} startDate={startDate} endDate={endDate} stats={stats} />}
      {stats ?
      <>
        {stats && stats.damagedLocationWiseCounts && stats.damagedLocationWiseCounts.length > 0 &&
        <CRow>
          <CCol>
            
          </CCol>
        </CRow>
        }
        {stats && stats.expiryDaysThreshold /*&& stats.expiredLocationWiseCounts.length > 0 */&&
        <CRow>
          <CCol>
            
          </CCol>
        </CRow>
        }
        {/* <CorePagination totalPages={stats.totalPagesOfProductExpiryLocationWise} parentCallback={handlePage} /> */}
        {/* {stats && <Pagination total={stats?.totalPagesOfProductExpiryLocationWise} showSizeChanger showQuickJumper />} */}
      </> : <Loading />
      }
    </>
  )
}

export default Dashboard
