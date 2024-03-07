import useFetch from '../../../hooks/useFetch'
import DetailsTable from 'src/components/DetailsTable';
import { putData } from '../../../services/NetworkService';
import { useTranslation } from 'react-i18next'
import React, { useState, useEffect } from 'react'
import { SuccessMsg} from "../order/LocationFields";
import toast from 'react-hot-toast';
function ProductDetails(props) {
  const id = props.data.id
  const { error, isPending, data } = useFetch('products/' + id)
  const [confirmDialog, setConfirmDialog] = useState(false)
  const { t } = useTranslation();
  let [successMsg, setSuccessMsg] = useState('')
  const [err] = useState(false)
  let [submitting, setSubmitting] = useState(false)
  const [product, setProduct] = useState(null)
  let success = false;
    useEffect(() => {
        if (data) {
          if (data.data.imageUrl)
            data.data.image = { path: data.data.imageUrl.substring(data.data.imageUrl.indexOf("/api")) }
          setProduct(data)
        }
    }, [data])

    const handleAction = async () => {
      setConfirmDialog(false);
      setSubmitting(true);
  
      if (!product.data.category.prestashopCategoryId) {
          alert("The product category is either not available on the ecommerce store or not synced with SDFoods data. Please publish the category from the category edit/detail page.");
          setSubmitting(false);
          return;
      }
  
      product.data.action = 'PUBLISH';
  
      try {
          const response = await putData(`products/${product.data.id}`, product.data);
          setSubmitting(false);
          product.data.prestashopProductId = response.data.data.prestashopProductId;
  
          // Show success notification
          toast.success("Your form is submitted successfully");
  
          // Reload data and close modal after a delay
          props.reloadCallback(null, null, props.sort);
          setTimeout(() => {
              setSuccessMsg('');
              props.onClose();
          }, 1000);
      } catch (error) {
          setSubmitting(false);
  
          // Show error notification
          toast.error("Some error occurred. Sorry for the inconvenience. Please try again later.");
      }
  };

  return (
    <>
    <DetailsTable
      title={product && product.data.name}
      fields={fields}
      data={product && product.data}
      photo="image"
      error={error}
      isPending={isPending}
    />
    <div>
    <SuccessMsg successMsg={successMsg} err={err} />

    <div style={{display:'flex', justifyContent:'start'}}>
      {product && !product.data?.prestashopProductId && confirmDialog == false &&
        <button type="button" disabled={submitting} className="btn btn-success" onClick={() => {setConfirmDialog(true) }}>{t('Sync product')}</button>

      }
    </div>

    {confirmDialog === true &&
        <>
          <div className="col-sm-12" style={{ backgroundColor: '#ffffff', paddingTop: 10, paddingBottom: 10 }}>
            <label className="col-form-label" htmlFor="flexCheckDefault" >
              <b>{t('Are you sure you want to continue?')}</b>&nbsp;&nbsp;&nbsp;
            </label>
             <button type="button" disabled={submitting}  className="btn-sm btn-primary" onClick={() => {handleAction() }}>{t('Yes')}</button>&nbsp;
            <button type="button" disabled={submitting}  className="btn-sm btn-danger" onClick={() => { setConfirmDialog(false) }}>
                {t('No')}
            </button>
          </div>

        </>
      }
    </div>
    </>
    )
}
export default ProductDetails;
const fields = [
  { key: 'name', headerName: 'Name' },
  { key: 'category', headerName: 'Category' },
  { key: 'ref', headerName: 'Ref' },
  { key: 'description', headerName: 'Description' },
  { key: 'htPrice', headerName: 'Price' },
  { key: 'unit', headerName: 'Unit' },
  { key: 'tva', headerName: 'TVA' },
  // { key: 'partner', headerName: 'Vendor' }
]
