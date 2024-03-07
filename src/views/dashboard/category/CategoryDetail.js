import useFetch from '../../../hooks/useFetch'
import DetailsTable from 'src/components/DetailsTable';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SuccessMsg } from "../order/LocationFields";
import { putData} from 'src/services/NetworkService';



function CategoryDetails(props) {
  const id = props.data.id
  const { error, isPending, data } = useFetch('categories/' + id)
  const [confirmDialog, setConfirmDialog] = useState(false)
  const { t } = useTranslation();
  let [successMsg, setSuccessMsg] = useState('')
  const [err] = useState(false)
  let [submitting, setSubmitting] = useState(false)

  const handleAction = () => {

    setConfirmDialog(false)
    setSubmitting(true)
    data.data.action = 'PUBLISH'
    putData('categories/' + data.data.id, data.data)
      .then(response => {
        setSubmitting(false)
        setSuccessMsg(t("Your form is submitted successfully"))
        setTimeout(() => { setSuccessMsg('') }, 2500)
        data.data.prestashopCategoryId = response.data.data.prestashopCategoryId
      })
      .catch(error => {
        // setErrorMsg()
        setSubmitting(false)
      })
  }
  return (
    <>
      <DetailsTable
        title={data && data.data.name}
        fields={fields}
        data={data && data.data}
        error={error}
        isPending={isPending}
      />
      < SuccessMsg successMsg={successMsg} err={err} />
      {data && !data.data.prestashopCategoryId && confirmDialog == false &&
        <button type="button" disabled={submitting} className="btn btn-success" onClick={() => { setConfirmDialog(true) }}>{t('Add Category on ecommerce store')}</button>

      }

      {confirmDialog === true &&
        <>
          <div className="row">
            <div className="col-sm-12" style={{ backgroundColor: '#ffffff', paddingTop: 10, paddingBottom: 10 }}>
              <label className="col-form-label" htmlFor="flexCheckDefault" >
                <b>{t('Are you sure you want to continue?')}</b>&nbsp;&nbsp;&nbsp;
              </label>
              <button type="button" disabled={submitting} className="btn-sm btn-primary" onClick={() => { handleAction() }}>{t('Yes')}</button>&nbsp;
              <button type="button" disabled={submitting} className="btn-sm btn-danger" onClick={() => { setConfirmDialog(false) }}>
                {t('No')}
              </button>
            </div>
          </div>
        </>
      }
    </>
  )
}
export default CategoryDetails;

const fields = [
  { key: 'name', headerName: 'Category' },
  { key: 'type', headerName: 'Type' }
]