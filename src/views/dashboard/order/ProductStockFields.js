import { MyTextField, MyDateField, MuiAutocomplete } from '../../../components/FormFields'
import { useTranslation } from 'react-i18next';
import useFetch from '../../../hooks/useFetch'
import { useState, useEffect } from 'react';
import { setNestedObjectValues } from 'formik';
import { postData, postFormData } from 'src/services/NetworkService';
import { gridColumnsTotalWidthSelector } from '@material-ui/data-grid';
import MainTable from '../../../components/MainTable'
import toast from 'react-hot-toast';
import moment from 'moment'
import { MyDropzone } from '../../../components/MyDropZone'

const ProductStockFields = ({ orderData, values, setFieldValue, setValues, locations, isSubmitting, confirmDialog, setConfirmDialog, edit, disabled, comments }) => {

    const { t } = useTranslation();
    const { error, isPending, data } = useFetch('products/all/');
    const { data: user } = useFetch('employeeprofile')
    const [products, setProducts] = useState(null)
    const [productData, setProductData] = useState(null)
    values.stockObject[0].orderId = orderData.id
    const [lineItems, setLineItems] = useState(null)

    useEffect(() => {
        if (data && user) {
            let li = []
            orderData.products.map(p => {
                p.productLocation?.map(pl => {
                    pl.product = p.name
                    pl.quantity = p.quantity
                    li.push(pl)
                })

            })
            li.sort((a, b) => b.id - a.id)
            setLineItems(li)
            setProducts(data.data.content)
        }
    }, [data && user])

    const handleProductData = (value) => {        
        setProductData(value)        
        values.stockObject[0].productId = value.id  
        setValues(values)       
    }

    const addProductStock = () => {  
        if (values.stockObject[0].photos && values.stockObject[0].photos.length > 0) {     
        let dataFiles = [];
        let artifect_types = '';
        let base_paths = '';        
        values.stockObject[0].photos.map(o => {                                  
            dataFiles.push(o[0])
            if (artifect_types.length > 0)
                        artifect_types += ','
                artifect_types += 'photo_'
                base_paths += '/orders/' + values.id + '/' + "photo/orderproduct/" + values.stockObject[0].productId + ','
        })
        var formData = new FormData();
        formData.append('artifect_type', artifect_types)
        base_paths = base_paths.slice(0, -1);
        formData.append('base_path', base_paths)
        dataFiles.map(file => {            
            formData.append('dataFiles', file)
        })        
        postFormData(formData)
            .then((res) => {                
                let files = res.data.files.map(file =>
                ({
                    'path': file.path,
                    'mimeType': file.mimetype,
                    'title': file.filename,
                    'description': values.description,
                    'mediaType': file.artifect_type,
                })
                )                
                values.stockObject[0].photos = files                

                let item = values.stockObject[0]
                item.id = item.orderId + item.productId
                item.receivedNumberofUnits = item.receivedNumberOfUnits
                item.product = products.find(o => o.id === item.productId).name
                item.createdOn = moment().valueOf()
                item.createdBy = user.login
                toast.promise(postData('order/addSubtituteProduct', values.stockObject),
                    {
                        loading: 'Loading',
                        success: (resp) => { setLineItems([item, ...lineItems]); return "Product line item added successfully" },
                        error: "Error adding line item"
                    }
                )
                values.stockObject[0].photos = [] 
                setValues(values)               
            })
        } else {
            let item = values.stockObject[0]
                item.id = item.orderId + item.productId
                item.receivedNumberofUnits = item.receivedNumberOfUnits
                item.product = products.find(o => o.id === item.productId).name
                item.createdOn = moment().valueOf()
                item.createdBy = user.login
                toast.promise(postData('order/addSubtituteProduct', values.stockObject),
                    {
                        loading: 'Loading',
                        success: (resp) => { setLineItems([item, ...lineItems]); return "Product line item added successfully" },
                        error: "Error adding line item"
                    }
                )
        }

    }

    return (<>
        {products && <>
            <hr />
            <strong> Ordered Products</strong>
            <hr />
            <div className="row" style={{ fontWeight: 'bold' }}>
                <div className="col-sm-5">Product</div>
                <div className="col-sm-3 text-center">Qty</div>
                <div className="col-sm-3 text-center">Pallets</div>
            </div><hr />
            {orderData.products.filter(o => o.quantity !== -1).map(o => {
                return (<>
                    <div className="row">
                        <div className="col-sm-5">{o.name}</div>
                        <div className="col-sm-3 text-center">{o.numberOfUnits}</div>
                        <div className="col-sm-3 text-center">{o.quantity}</div>
                    </div><hr /></>
                )

            })
            }


            <strong> Add Goods Received</strong>
            <hr />

            <div className='col-sm-12' style={{ padding: '0px' }}>
                <MuiAutocomplete
                    data={products}
                    setFieldValue={setFieldValue}
                    placeholder={t('Select Products')}
                    displayKey={'name'}
                    name={`stockObject.${0}.productId`}
                    // valueKey="id"
                    label={t('Products')}
                    parentCallbackOpt={(value) => handleProductData(value)}

                />
            </div>
            {productData && <>
                <div className="row">
                    {(productData.isFresh) &&
                        <div className="col-sm-3">
                            <MyTextField name={`stockObject.${0}.lotNumber`}
                                // disabled={disabled}
                                // inputLabelProps={locationField?.locationFields?.lotNumber && { shrink: true }}
                                // val={locationField?.locationFields?.lotNumber ?? ""}
                                label={t('Lot Number')}
                                type='number' />
                        </div>
                    }
                    <div className="col-sm-3">
                        <MyTextField name={`stockObject.${0}.receivedPallets`}
                            // disabled={disabled}
                            // inputLabelProps={locationField.locationFields?.receivedPallets && { shrink: true }}
                            // val={locationField?.locationFields?.receivedPallets ?? 0}
                            label={t('Received Pallets')} type='number' required
                        />
                    </div>
                    <div className="col-sm-3">
                        <MyTextField name={`stockObject.${0}.receivedNumberOfUnits`}
                            // disabled={disabled}
                            // inputLabelProps={locationField.locationFields?.receivedNumberofUnits && { shrink: true }}
                            // val={locationField.locationFields?.receivedNumberofUnits ?? ''}
                            label={t('Received Qty')} type='number' required
                        />
                    </div>
                    <div className="col-sm-3">
                        <MyTextField name={`stockObject.${0}.damagedNumberOfUnits`}
                            // disabled={disabled}
                            // val={locationField?.locationFields?.damageNumberOfUnits ?? ''}
                            label={t('Damaged Qty')}
                            // inputLabelProps={locationField.locationFields?.damageNumberOfUnits && { shrink: true }}
                            type='number' />
                    </div>
                    {
                        (productData.isExpiry) &&
                        <div className="col-sm-3">
                            <MyDateField
                                // disabled={disabled}
                                name={`stockObject.${0}.expiry`} label={"Expiry Date"}
                                setFieldValue={setFieldValue}
                            // required={(values["receivedPallets" + locationField.name] ?? locationField?.locationFields?.receivedPallets) > 0 ? true : false}
                            // val={locationField?.locationFields?.expiry ?? 0}
                            />
                        </div>
                    }
                    <div className="col-sm-3" style={{ bottom: "21px" }}>
                        <MuiAutocomplete
                            data={locations}
                            // disabled={disabled}
                            setFieldValue={setFieldValue}
                            placeholder={t('Location')}
                            displayKey={'name'}
                            name={`stockObject.${0}.locationId`}
                            valueKey="id"
                            val={locations?.filter(loc => loc.id == values[`stockObject.${0}.locationId`])?.[0] ?? null}
                        // required={(values["receivedPallets" + locationField.name] ?? locationField?.locationFields?.receivedPallets) > 0 ? true : false}

                        />
                    </div>
                </div>
                <div>
                    <MyDropzone name={`stockObject.${0}.photos.${0+values.stockObject[0].photos.length}`} label='Photo' setFieldValue={setFieldValue} multiple />
                </div>
                <div className="row">
                    <div className="col-sm-3"
                    // style={{ marginTop: '21px', paddingTop: '5px' }}
                    >
                        <button className="btn btn-sm btn-primary"
                            type="button" disable={isSubmitting}
                            onClick={() => addProductStock()}
                        >{t('Add Product Stock')}</button>&nbsp;
                    </div>
                </div>
            </>
            }
        </>
        }
        {
            lineItems && lineItems.length > 0 && <>
                <hr />
                <strong> Received Products</strong>

                <hr />
                <div className="row" style={{ fontWeight: 'bold' }}>
                    <div className="col-sm-4">Product</div>
                    <div className="col-sm-1 text-center">Qty</div>
                    <div className="col-sm-1 text-center">Received Qty</div>
                    <div className="col-sm-1 text-center">Damaged Qty</div>
                    <div className="col-sm-1 text-center">Received Pallets</div>
                    <div className="col-sm-2 text-center">Created</div>
                    <div className="col-sm-1 text-center">Initiator</div>
                </div>
                <hr />
                {lineItems.map(o => {
                    return (
                        <><div className="row">
                            <div className="col-sm-4">{o.product}</div>
                            <div className="col-sm-1 text-center">{o.numberOfUnits}</div>
                            <div className="col-sm-1 text-center">{o.receivedNumberofUnits}</div>
                            <div className="col-sm-1 text-center">{o.damagedNumberOfUnits}</div>
                            <div className="col-sm-1 text-center">{o.receivedPallets}</div>
                            <div className="col-sm-2 text-center">{moment(o.createdOn).format('DD/MM/YY hh:mm')}</div>
                            <div className="col-sm-1 text-center">{o.createdBy}</div>
                        </div><hr /></>

                    )
                })
                }

            </>
        }

        {comments}
        <div className="row">
            {(confirmDialog === false && !edit) &&
                <div className="col-sm-1">
                    <button type="button" disabled={isSubmitting || disabled} className="btn btn-success" onClick={() => { setFieldValue('status', 'STOCKED'); setConfirmDialog(true) }}>{t('Stocked')}</button>
                </div>
            }

        </div>
    </>
    )
}

export default ProductStockFields;
