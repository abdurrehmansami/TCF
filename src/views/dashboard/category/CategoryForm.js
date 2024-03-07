import { useHistory } from 'react-router'
import Content from '../../../components/Content'
import { MyTextField, MyProgress, MuiAutocomplete } from '../../../components/FormFields'
import { Formik, Form } from "formik";
import Loading from 'src/components/Loading'
import { postData } from '../../../services/NetworkService'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import useFetch from '../../../hooks/useFetch'
import { SuccessMsg } from '../order/LocationFields';
import toast from 'react-hot-toast';

function CategoryForm(props) {
    const { t } = useTranslation();
    const history = useHistory();
    const categoryData = props.data
    const { data: prestaCategories } = useFetch('prestashop/categories')
    const [initialValues, setInitialValues] = useState({
        name: '',
        type: ''
    })
    const [isLoaded, setLoaded] = useState(false)
    const [selectedPrestaCategory, setSelectedPrestaCategory] = useState(null)
    const edit = props.data ? true : false
    const title = `${edit ? t('Edit') : t('Add')} ${t('Category')}`
    const [successMsg,setSuccessMsg] = useState('');
    const reloadCallback = props.reloadCallback;
    const sort = props.sort;
    useEffect(() => {
        if (edit && categoryData && prestaCategories) {
            setInitialValues(categoryData)
            if(prestaCategories.data){
                let selectedPrestaCategory = categoryData.prestashopCategoryId ? prestaCategories.data.filter(o => o.id == categoryData.prestashopCategoryId) : ''
                setSelectedPrestaCategory(selectedPrestaCategory)
            }
            setLoaded(true)
        }
    },[edit,categoryData,prestaCategories])

    const handleSubmit = (values, setSubmitting) => {
        postData('categories', values)
            .then(response => {
                console.log(response)
                setSubmitting(false)
                if(edit)
                    toast.success(t("Category is edited successfully"))
                else
                    toast.success(t("New Category is created successfully"))
                reloadCallback(null,null,sort);
                setTimeout(()=>props.onClose(),1500);
            })
            .catch(error => {
                setSubmitting(false)
                toast.error("Some error occurred. Sorry for the inconvenience. Please try again later.");
            })
    }

    return (
        edit && !isLoaded ? <Loading /> :
            <Content title={title} >
                <Formik
                    initialValues={initialValues}
                    enableReinitialize={true}
                    onSubmit={(values, { setSubmitting }) => {
                        handleSubmit(values, setSubmitting)
                    }}
                >
                    {({ values, isSubmitting, setFieldValue }) => (
                        <Form>
                            <MyTextField placeholder={t('Category Name')} name="name" label={t('Category Name')} />
                            {prestaCategories && <MuiAutocomplete
                                data={prestaCategories.data}
                                setFieldValue={setFieldValue}
                                placeholder={t('Ecommerce Store Category')}
                                displayKey={'name'}
                                name="prestashopCategoryId"
                                valueKey="id"
                                label={t('Ecommerce Store Category')}
                                val={selectedPrestaCategory ? selectedPrestaCategory[0] : null}
                                value={selectedPrestaCategory || null}
                                onChange={(event,value)=>{
                                    setSelectedPrestaCategory(value ? [value] : null);
                                    setFieldValue("prestashopCategoryId", value ? value.id : null);
                                }}
                                disabled = {selectedPrestaCategory && selectedPrestaCategory.length > 0}
                            />}
                            <MyTextField placeholder={t('Type')} name="type" label={t('Type')} />
                            <div>
                                <button type="submit" disabled={isSubmitting} className="btn btn-sm btn-primary">{t('Submit')}</button>
                            </div>
                            <SuccessMsg successMsg={successMsg} />
                            <MyProgress isSubmitting={isSubmitting} />
                        </Form>
                    )}
                </Formik>
            </Content>

    )
}
export default CategoryForm;
