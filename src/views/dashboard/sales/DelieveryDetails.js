import '../../../scss/style.scss';
import { useTranslation } from 'react-i18next';
import useFetch from '../../../hooks/useFetch'
import { useEffect, useState } from 'react';
import Textarea from '@mui/joy/Textarea';
import { MyTextField, MyDateField, MuiAutocomplete } from '../../../components/FormFields'
import { Formik, Form, Field } from "formik";
import Moment from 'moment'
import { useMediaQuery, useTheme } from '@material-ui/core';
import { getData, putData } from 'src/services/NetworkService';
import toast from 'react-hot-toast'
import Loading from 'src/components/Loading';
import { useHistory } from 'react-router'

const { CCardHeader, CCardText, CCardBody, CCard, CContainer, CRow, CCol } = require("@coreui/react")

const DelieveryDetails = (props) => {
    let id = props.match.params.id;
    const { t } = useTranslation();
    const theme = useTheme();
    const isMatch = useMediaQuery(theme.breakpoints.down('sm'));
    const displayType = isMatch ? { display: 'flex' } : { display: '' }
    const [loader, setLoader] = useState(false);
    const { error: processingerror, pending, data: orderData } = useFetch('prestashop/order/' + id);
    const { data: productsData } = useFetch('prestashop/order/' + id + '/processed-products');
    const [customer, setCustomer] = useState();
    const [products, setProducts] = useState();
    const [address, setAddress] = useState();
    const history = useHistory()
    const [buttonText, setButtonText] = useState(null);
    const [initialValues, setInitialValues] = useState({ orderId: id, updatedBy: '', reference: '', dateAdded: '', message: '', products: [], action: '' });

    useEffect(() => {
        if (orderData && productsData?.data) {
            if (orderData.data.currentState == '37' || orderData.data.currentState == '38') {
                setButtonText('Pick')
            } else if (orderData.data.currentState == '27' || orderData.data.currentState == '30') {
                setButtonText('Deliver')
            }
            if (!customer) {
              getData('prestashop/customer/' + orderData.data.idCustomer).
                  then(response => {
                      console.log(response);
                      setCustomer(response.data.data)
                  }).catch(error => {
                      console.log(error)
                  })
            }
            if (!address) {
                getData('prestashop/address/' + orderData.data.idAddressDelivery).
                    then(response => {
                        console.log(response);
                        setAddress(response.data.data == null ? {} : response.data.data)
                    }).catch(error => {
                        console.log(error)
                    })
            }
            let map = new Map()
            let prod_ = {}
            productsData.data.products.map((element, ind) => {
                element.fields.map((ele, index) => {
                if (ele.flag !== 'INACTIVE') {
                    prod_ = map.get(element.prestashopProductId)
                    if (prod_ == null) {
                        prod_ = {name: element.name, quantity: ele.quantity}
                    } else {
                        prod_.quantity += ele.quantity
                    }
                    map.set(element.prestashopProductId, prod_)
                }
                })
            })
            setProducts(Array.from(map.values()))
        }

        if (orderData && address && customer && productsData){
            setLoader(true)
            if(productsData.data.fake) {
                toast.error('Order was not prepared and reviewed in our system. Actual quantities may vary.',
                        {
                            style: {minWidth: '500px',
                            background: '#333',
                            color: '#fff',},
                            position: "top-center"
                        })
             }
        }
    }, [orderData && productsData && address && customer])

    return (
        <>
            {loader ?
                <>
                    <CCard>
                        <CCardHeader className='col-sm-12 header-background' style={{ display: 'flex' }}>
                            <div className='col-sm-6' style={{ paddingLeft: '0px' }}>
                                <h3>{t('ORDER DETAIL')}</h3>
                            </div>
                        </CCardHeader>
                        <CCardBody>
                            {!isMatch &&
                                <table>
                                    <tbody className='col-sm-12'>
                                        <tr className='col-sm-12'>
                                            <th className='row-padding col-sm-3'>Reference</th>
                                            <td className='row-padding col-sm-3'>{orderData.data.reference}</td>
                                            <th className='col-sm-2 row-padding'>Status</th>
                                            <td className='col-sm-4 row-padding'>{orderData.data.processed}</td>
                                        </tr>
                                        <tr className='col-sm-12'>
                                            <th className='row-padding col-sm-3'>Date Added</th>
                                            <td className='row-padding col-sm-3'>{Moment.utc(orderData.data.dateAdd).format('DD/MM/YYYY')}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            }
                            {isMatch &&
                                <table>
                                    <tbody className='col-sm-12'>
                                        <tr className='col-sm-12'>
                                            <th className='row-padding col-sm-6'>Reference</th>
                                            <td className='row-padding col-sm-6'>{orderData.data.reference}</td>
                                        </tr>
                                        <tr>
                                            <th className='col-sm-6 row-padding'>Status</th>
                                            <td className='col-sm-6 row-padding'>{orderData.data.processed}</td>
                                        </tr>
                                        <tr className='col-sm-12'>
                                            <th className='row-padding col-sm-6'>Date Added</th>
                                            <td className='row-padding col-sm-6'>{Moment.utc(orderData.data.dateAdd).format('DD/MM/YYYY')}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            }
                        </CCardBody>
                    </CCard>
                    <div className="row">
                      <div className="col-sm-12">
                          {products && <CCard>
                              <CCardHeader className='header-background'>Products</CCardHeader>
                              <CContainer>
                                  <CRow className='list-row-padding col-headers-weight'>
                                      <CCol>#</CCol>
                                      <CCol>Product</CCol>
                                      <CCol>Quantity</CCol>
                                  </CRow>
                                  {
                                      products.map((e, idx) => {
                                          return (
                                              <CRow className='border-bottom list-row-padding'>
                                                  <CCol>{idx + 1}</CCol>
                                                  <CCol>{e.name}</CCol>
                                                  <CCol>{e.quantity}</CCol>
                                              </CRow>
                                          )
                                      })
                                  }
                              </CContainer>
                          </CCard>
                          }
                      </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-6">
                        {address && customer && <CCard>
                          <CCardHeader className='card-header header-background'>Delivery Details</CCardHeader>
                          <CCardBody style={{height: '208px'}}>
                              <div>
                                  <CCardBody className='customer-card-name'>
                                      <CCardText>{customer.firstName} {customer.lastName}</CCardText>
                                  </CCardBody>
                              </div>
                              <div className='detail-margin'>
                                  <div className="col-sm-6" style={{ paddingLeft: "0px" }}>
                                      <CCardText className='card-sub-heading'>Email:</CCardText>
                                      <CCardText>{customer.email}</CCardText>
                                  </div>
                                  <div className="col-sm-6">
                                      <CCardText className='card-sub-heading'>Contact: </CCardText>
                                      <CCardText>{address.phone == "" ? address.phoneMobile : ""}</CCardText>
                                  </div>
                              </div>
                              <div className='detail-margin'>
                                  <div className="col-sm-12" style={{ paddingLeft: "0px" }}>
                                      <CCardText className='card-sub-heading'>Shipping Address:</CCardText>
                                      <CCardText>{address.address1} {address.address2} {address.city} {address.postCode}</CCardText>
                                  </div>
                              </div>
                          </CCardBody>
                      </CCard>}
                      </div>
                      <div className="col-sm-6">
                       {orderData?.data && ("|37|38|27|30|".indexOf("|"+orderData.data.currentState+"|") !== -1) && <Formik
                        initialValues={initialValues}
                        enableReinitialize={true}
                        onSubmit={(values, { setSubmitting }) => {
                            console.log(values);
                            toast.promise(putData('product/quantity/' + id + "?" + "action=delivery" , values),
                                {
                                    loading: "Loading",
                                    success: (resp) => {
                                        let path = '';
                                        if ("|37|38|".indexOf("|"+orderData.data.currentState+"|") !== -1)
                                            path = '/pickOrder'
                                        else if ("|27|30|".indexOf("|"+orderData.data.currentState+"|") !== -1)
                                            path = '/ordersToDeliver'

                                        setTimeout(() => {history.push({pathname: path})}, 1000)

                                        return "Order processed successfully."
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
                        }}>
                        {({ errors, isSubmitting, setFieldValue, setSubmitting, values }) =>
                            <Form>
                              <CCard>
                                  <CCardHeader className='header-background'>Notes</CCardHeader>
                                  <CCardBody>
                                    <div className="row">
                                      <div className="col-sm-12">
                                        <MyTextField  setFieldValue={setFieldValue} placeholder='Comments' name={"message"} rows={4} multiple={true}/>
                                      </div>
                                    </div>
                                    <div className="row">
                                      <div className="col-sm-6">
                                        {
                                          buttonText == 'Pick' &&
                                          <div className='button-margin' style={{ paddingRight: '0px' }}>
                                              <button className="btn btn-sm btn-primary header-font-size" style={{ marginBottom: "9px" }} >Pick Order</button>
                                          </div>
                                        }
                                        {
                                          buttonText == 'Deliver' &&
                                          <>
                                              <div className='button-margin' style={{ paddingRight: '0px' }}>
                                                  <button className="btn btn-sm btn-primary header-font-size" style={{ marginBottom: "9px" }} >Mark Delivered</button>
                                                  &nbsp;
                                                  {/*<button className="btn btn-sm btn-danger header-font-size" style={{ marginBottom: "9px" }} >Mark Returned</button>*/}
                                              </div>
                                          </>
                                        }
                                       </div>
                                    </div>
                                  </CCardBody>
                              </CCard>
                            </Form>
                        }
                      </Formik>
                      }
                      </div>

                    </div>
                </> : <Loading/>
            }
        </>
    )
}

export default DelieveryDetails;
