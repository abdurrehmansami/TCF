import MainTable from '../../../components/MainTable'
import { useState, useEffect } from 'react';
import useFetch from '../../../hooks/useFetch'
import { putData } from 'src/services/NetworkService';
import { useHistory } from 'react-router'
import { gridColumnsTotalWidthSelector } from '@material-ui/data-grid';
import { CCard, CCardBody, CCardHeader, CCardText } from '@coreui/react';
import { useTranslation } from 'react-i18next'
import Moment from 'moment'
import toast from 'react-hot-toast'

const ViewPrestashopOrderDetails = (props) => {

    console.log(props);
    let id = props.match.params.id;
    const [products, setProducts] = useState(null);
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const { error, isPending, data } = useFetch('prestashop/order/' + id + "/products?page=" + (page - 1));
    const { data: user } = useFetch('employeeprofile');
    const { error: processingerror, pending, data: processed } = useFetch('prestashop/order/' + id);
    const [editButton, setEditButton] = useState('');
    const [initialValues, setInitialValues] = useState({ orderId: '', updatedBy: '', reference: '', dateAdded: '', products: [] });
    const fields = [];
    const history = useHistory();
    const [isButtonEnable, setIsButtonEnable] = useState(false)

    fields.push(
        { field: 'productId', headerName: 'ID', dataId: 'id', flex: 0.5 },
        { field: 'productName', headerName: 'Product Name', flex: 1 },
        { field: 'productQuantity', headerName: 'Quantity', flex: 0.5 }
    )
    if (user && user.jobId != '13' && user.jobId != '9') {
        fields.push(
            { field: 'productPrice', headerName: 'Price VAT Excl', flex: 0.5 },
            { field: 'unitPriceTaxIncl', headerName: 'Price VAT Incl', flex: 0.5 },
            { field: 'costPrice', headerName: 'Cost Price', flex: 0.5 }
        )
    }


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
        if (data && user && processed) {
            console.log(data);
            if ((user.jobId == '1' || user.jobId == '13' || user.jobId == '9')) {

                if(user.jobId == '13' && !(processed.data.currentState == '26' || processed.data.currentState == '29' || processed.data.currentState == '33' || processed.data.currentState == '35' )) {
                    history.push({
                        pathname: '/sales-orders'
                    })
                }

                if (processed.data.currentState == '26' || processed.data.currentState == '29' || processed.data.currentState == '33' || processed.data.currentState == '35') {
                    setEditButton('Prepare Order')
                } else if (processed.data.currentState == '34' || processed.data.currentState == '36' ) {
                    setEditButton('Controller Review')
                } else if (processed.data.currentState == '38' || processed.data.currentState == '37') {
                    setEditButton('View History')
                }
            }
            setProducts(data);
        }
    }, [data && user && processed])

    const handlePage = (page) => {
        setPage(page);
    };

    const handleSubmit = () => {
        initialValues.orderId = id;
        setIsButtonEnable(true)
        if (processed.data.currentState == '26' || processed.data.currentState == '29') {
            toast.promise(
              putData('product/quantity/' + id + "?" + "action=" + "prepare", initialValues),
              {
                loading: 'Loading',
                success: (resp) => {
                              if (resp.data.data === 'OK') {
                                  history.push({
                                      pathname: '/orderDetail' + '/' + id,
                                      data: id
                                  })
                                  return "Order updated successfully"
                              } else {
                                    setIsButtonEnable(false)
                                    return "Some problem occured. Contact system support."
                              }
                         },
                error: (err) => "Some problem occured. Contact system support.",
              },
              {
                style: {
                  minWidth: '180px',
                },
                position: 'top-center'
              }
            );
        } else {
            history.push({
                pathname: '/orderDetail' + '/' + id,
                data: id
            })
        }

    }

    return (
        <>
            {data && user && processed &&
                <>
                    <CCard>
                        <CCardHeader className='col-sm-12 header-background' style={{ display: 'flex' }}>
                                <div className='col-sm-6' style={{paddingLeft: '0px'}}>
                                    <h3>{t('ORDER DETAIL')}</h3>
                                    </div>
                                {
                                  editButton != '' &&
                                    <div className='col-sm-6 button-end' style={{paddingRigh: '0px'}}>
                                        <button className="btn btn-sm btn-primary header-font-size" disabled={isButtonEnable} style={{ marginBottom: "9px" }} onClick={() => handleSubmit()}>{editButton}</button>
                                    </div>
                                }
                        </CCardHeader>
                        <CCardBody>
                            <table>
                                <tbody className='col-sm-12'>
                                    <tr className='col-sm-12'>
                                        <th className='row-padding col-sm-3'>Reference</th>
                                        <td className='row-padding col-sm-3'>{processed.data.reference}</td>
                                        <th className='col-sm-2 row-padding'>Status</th>
                                        <td className='col-sm-4 row-padding'>{processed.data.processed}</td>
                                    </tr>
                                    <tr className='col-sm-12'>
                                        <th className='row-padding col-sm-3'>Date Added</th>
                                        <td className='row-padding col-sm-3'>{Moment.utc(processed.data.dateAdd).format('DD/MM/YYYY')}</td>
                                        {processed.data.rider && 
                                            <>
                                                <th className='col-sm-2 row-padding'>Rider</th>
                                                <td className='col-sm-4 row-padding'>{(processed.data.rider.fullname ? 
                                                    processed.data.rider.fullname : processed.data.rider.name)}</td>
                                            </>
                                        }
                                    </tr>
                                </tbody>
                            </table>

                        </CCardBody>
                    </CCard>
                    <MainTable
                        fields={fields}
                        data={products}
                        error={error}
                        isPending={isPending}
                        handlePage={handlePage}
                    ></MainTable>
                </>
            }
        </>
    )
}

export default ViewPrestashopOrderDetails;
