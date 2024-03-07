import { useTranslation } from 'react-i18next'
import { MyTextField, MuiAutocomplete } from '../../../components/FormFields'
import Moment from 'moment'
import { useState, useEffect } from 'react';
import '../../../scss/style.scss';
import { CCard, CCardBody, CCardHeader, CCardText, CContainer, CRow, CCol, CImage } from '@coreui/react';
import { useMediaQuery, useTheme } from '@material-ui/core';


const Expiry = ({ setFieldValue, values, setValues, isSubmitting, disabled, disableForm, orderData, updated, editable, successMsg, loader, resp }) => {
    const { t } = useTranslation();    
    const theme = useTheme();
    console.log(values)
    const isMatch = useMediaQuery(theme.breakpoints.down('sm'));
    let styles = '';
    if (isMatch) {
        styles = {
            flex: {
                display: "inline"
            }
        }
    } else {
        styles = {
            flex: {
                display: "flex"
            }
        }
    }
    if (disableForm == true) {
        disabled = disableForm
    }
    const [syncEnable, setSyncEnable] = useState(true);

    const addData = (values, index, setValues) => {
        values.products[index].fields.push({
            quantity: null,
            expiry: null,
            lotNumber: null
        })
        setValues(values)
    }

    const removeField = (values, ind, index, setValues) => {
        values.products[ind].fields.splice(index)
        setValues(values)
    }
    const handleView = (data) => {
        const win = window.open(`/products?_q=${data.name}`, "_blank");
        win.focus();
    }
    const addQuantity = (prodInd, fieldInd) => {
        values.products[prodInd].fields[fieldInd].quantity += 1
        setValues(values)
    }
    const subtractQuantity = (prodInd, fieldInd) => {
        values.products[prodInd].fields[fieldInd].quantity -= 1
        setValues(values)
    }
    return (
        <>
            {values && loader && <>
                <CCard>
                    <CCardHeader className='col-sm-12 header-background' style={{ display: 'flex' }}>

                        <div className={isMatch ? 'col-sm-11' : 'col-sm-6'} style={{ paddingLeft: '0px' }}>
                            <h3>{t('ORDER DETAIL')}</h3>
                        </div>
                        {(orderData.data.currentState == 33 || orderData.data.currentState == 35) &&
                            <div className={isMatch ? 'col-sm-1 button-end' : 'col-sm-6 button-end'} style={{ paddingRigh: '0px' }}>
                                <button className="btn btn btn-primary header-font-size" style={{ marginBottom: "9px" }} onClick={() => { setSyncEnable(false); setFieldValue("action", "sync") }}>{t('Sync Order')}</button>
                            </div>
                        }
                    </CCardHeader>
                    {isMatch &&
                        <CCardBody>
                            <table>
                                <tbody className='col-sm-12'>
                                    <tr className='col-sm-12'>
                                        <th className='row-padding col-sm-6'>Reference</th>
                                        <td className='row-padding col-sm-6'>{values.reference}</td>
                                    </tr>
                                    <tr>
                                        <th className='col-sm-6 row-padding'>Status</th>
                                        <td className='col-sm-6 row-padding'>{values.processed}</td>
                                    </tr>
                                    <tr className='col-sm-12'>
                                        <th className='row-padding col-sm-6'>Date Updated</th>
                                        <td className='row-padding col-sm-6'>{Moment.utc(values.dateAdded).format('DD/MM/YYYY')}</td>
                                    </tr>
                                    <tr>
                                        <th className='col-sm-6 row-padding'>Updated By</th>
                                        <td className='col-sm-6 row-padding'>{values.updatedBy}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </CCardBody>
                    }
                    {!isMatch &&
                        <CCardBody>
                            <table>
                                <tbody className='col-sm-12'>
                                    <tr className='col-sm-12'>
                                        <th className='row-padding col-sm-3'>Reference</th>
                                        <td className='row-padding col-sm-3'>{values.reference}</td>
                                        <th className='col-sm-2 row-padding'>Status</th>
                                        <td className='col-sm-4 row-padding'>{values.processed}</td>
                                    </tr>
                                    <tr className='col-sm-12'>
                                        <th className='row-padding col-sm-3'>Date Updated</th>
                                        <td className='row-padding col-sm-3'>{Moment.utc(values.dateAdded).format('DD/MM/YYYY')}</td>
                                        <th className='col-sm-2 row-padding'>Updated By</th>
                                        <td className='col-sm-4 row-padding'>{values.updatedBy}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </CCardBody>
                    }
                </CCard>
                {loader &&
                    <CCard>
                        <CCardHeader className={'header-background'} style={{ marginBottom: '0px' }}>{'Products (' + values.products.length + ')'}</CCardHeader>
                        <CCardBody >
                            {values.products.map((prod, ind) =>

                                prod.fields?.map((productField, index) =>
                                    <>
                                        <div className={(prod.mapped === 0 ? 'alert-danger ' : '') + ' row'} style={{ borderRadius: '10px', borderBottom: 'solid 1px', borderColor: 'grey', marginBottom: '10px' }}>

                                            <div className="col-sm-2">
                                              {prod.imageUrl && prod.imageUrl.length > 0 && <img src={prod.imageUrl} style={{ width: "100px", height: "100px" }} alt={prod.name} />}
                                            </div>
                                            <div className="col-sm-10">
                                              {index === 0 &&
                                                  <div className="row">
                                                      <div className="col-sm-12" style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                                                          <strong>
                                                              {
                                                                  values.userId === 1 ? //TODO only valid for user usman
                                                                      <a onClick={e => handleView(prod)} href={null} style={{ textDecoration: 'underline', cursor: 'pointer' }}>

                                                                         {prod.name?.toUpperCase()}
                                                                      </a> :
                                                                      <>
                                                                          {ind + 1}.&nbsp;
                                                                          Name: {prod.name?.toUpperCase()}
                                                                      </>
                                                              }

                                                          </strong>
                                                      </div>
                                                  </div>
                                              }
                                               <div className="row">

                                                                                                  <div className="col-sm-3">
                                                                                                      <div className="row">
                                                                                                      {!disabled && <div className="col-sm-1">
                                                                                                          <button type="button" className="btn btn-sm btn-danger"
                                                                                                              onClick={() => {
                                                                                                                  subtractQuantity(ind, index);
                                                                                                              }}
                                                                                                              style={{ marginTop: 4 }}>
                                                                                                              -
                                                                                                          </button>
                                                                                                       </div>}
                                                                                                        <div className="col-sm-7">
                                                                                                          <MyTextField name={`products.${ind}.fields.${index}.quantity`} style={{textAlign: 'center'}}
                                                                                                               type='number' required={syncEnable} disabled={disabled}
                                                                                                          />
                                                                                                        </div>
                                                                                                        {!disabled && <div className="col-sm-1"><button type="button" className="btn btn-sm btn-primary"
                                                                                                            onClick={() => {
                                                                                                                addQuantity(ind, index);
                                                                                                            }}
                                                                                                            style={{ marginTop: 4, marginLeft: -25}}>+</button>
                                                                                                        </div>}
                                                                                                      </div>
                                                                                                  </div>

                                                                                                  {(resp && productField.lotNumber) &&
                                                                                                      <div className="col-sm-3" style={{ paddingTop: "0px" }}>
                                                                                                          <MyTextField name={`products.${ind}.fields.${index}.lotNumber`}
                                                                                                              label={t('Lot Number')} type='number'
                                                                                                              value={productField.lotNumber} disabled={!editable}
                                                                                                          />
                                                                                                      </div>
                                                                                                  }
                                                                                                  {prod.hasLotNumber && prod.lotNumberList && prod.lotNumberList.length > 0 &&
                                                                                                      <div className="col-sm-3" style={{ bottom: "21px" }}>
                                                                                                          <MuiAutocomplete
                                                                                                              data={prod.lotNumberList || []}
                                                                                                              setFieldValue={setFieldValue}
                                                                                                              placeholder={t('Lot Number')}
                                                                                                              displayKey={'value'}
                                                                                                              name={`products.${ind}.fields.${index}.lotNumber`}
                                                                                                              valueKey="id"
                                                                                                              disabled={disabled}
                                                                                                              val={productField.lotNumber ? { id: productField.lotNumber, value: productField.lotNumber } : { id: '', value: '' }}
                                                                                                              required={syncEnable}
                                                                                                          />
                                                                                                      </div>
                                                                                                  }
                                                                                                  {(resp && productField.expiry) &&
                                                                                                      <div className="col-sm-3">
                                                                                                          <MyTextField name={`products.${ind}.fields.${index}.expiry`}
                                                                                                              label={t('Expiry')}
                                                                                                              value={productField.expiry} disabled={disabled}
                                                                                                          />
                                                                                                      </div>
                                                                                                  }
                                                                                                  {prod.hasExpiry && prod.expiryList && prod.expiryList.length > 0 &&
                                                                                                      <div className="col-sm-3" style={{ bottom: "21px" }}>
                                                                                                          <MuiAutocomplete
                                                                                                              data={prod.expiryList}
                                                                                                              setFieldValue={setFieldValue}
                                                                                                              placeholder={t('Expiry')}
                                                                                                              displayKey={'value'}
                                                                                                              name={`products.${ind}.fields.${index}.expiry`}
                                                                                                              valueKey="id"
                                                                                                              val={productField.expiry ? {
                                                                                                                  id: productField.expiry,
                                                                                                                  value: productField.expiry ? Moment(productField.expiry).format('DD/MM/YYYY') : ''
                                                                                                              } : { id: '', value: '' }}
                                                                                                              disabled={disabled}
                                                                                                              required={syncEnable}
                                                                                                          />
                                                                                                      </div>
                                                                                                  }
                                                                                                  {index + 1 === prod.fields?.length &&
                                                                                                      <>
                                                                                                          <div style={{ display: "flex" }}>

                                                                                                              <div className="col-sm-12" style={{ paddingTop: "0px", marginRight: '10px' }}>
                                                                                                                  {index != 0 && !isSubmitting && !resp && <button
                                                                                                                      type="button"
                                                                                                                      className="btn btn-sm btn-danger"
                                                                                                                      onClick={() => { removeField(values, ind, index, setValues) }}
                                                                                                                      style={{ borderRadius: 40, fontSize: 13, width: 30, marginTop: 4 }}>-</button>}
                                                                                                                  {prod.quantity > 1 && !isSubmitting && !resp && ((prod.hasExpiry || prod.hasLotNumber) && (prod?.expiryList?.length > 0 || prod?.lotNumberList?.length > 0)) &&
                                                                                                                      <>&nbsp;
                                                                                                                          <button type="button" className="btn btn-sm btn-primary"
                                                                                                                              onClick={() => {
                                                                                                                                  addData(values, ind, setValues);
                                                                                                                              }}
                                                                                                                              style={{ borderRadius: 40, fontSize: 13, width: 30, marginTop: 4 }}>+</button></>}
                                                                                                              </div>


                                                                                                          </div>
                                                                                                      </>
                                                                                                  }
                                                                                              </div>
                                            </div>

                                            <div className="col-sm-12">
                                                {/*index === 0 &&
                                                    <div className="row">
                                                        <div className="col-sm-12" style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                                                            <strong>
                                                                {
                                                                    values.userId === 1 ? //TODO only valid for user usman
                                                                        <a onClick={e => handleView(prod)} href={null} style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                                                                            {ind + 1}.&nbsp;
                                                                            Name: {prod.name?.toUpperCase()}
                                                                        </a> :
                                                                        <>
                                                                            {ind + 1}.&nbsp;
                                                                            Name: {prod.name?.toUpperCase()}
                                                                        </>
                                                                }

                                                            </strong>
                                                        </div>
                                                    </div>*/
                                                }
                                            </div>
                                        </div>

                                    </>
                                )
                            )}
                        </CCardBody>
                        <>
                            {(orderData.data.currentState == 33 || orderData.data.currentState == 35) &&
                                <div className="col-sm-2" style={{ marginBottom: '20px', marginTop: '30px' }}>
                                    <button disabled={isSubmitting} className="btn btn btn-primary" onClick={() => setFieldValue("action", "update")}>{t('Finish Prepare')}</button>&nbsp;
                                </div>
                            }

                            {(orderData.data.currentState == 34 || orderData.data.currentState == 36) && !resp &&
                                <div className="col-sm-2" style={{ marginBottom: '20px', marginTop: '30px' }}>
                                    <button disabled={isSubmitting} className="btn btn btn-primary" onClick={() => setFieldValue("action", "confirm")}>{t('Finish Review')}</button>&nbsp;
                                </div>
                            }
                        </>
                    </CCard>
                }
            </>
            }
        </>
    )
}

export default Expiry;
