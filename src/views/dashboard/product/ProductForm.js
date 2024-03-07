import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import Content from '../../../components/Content'
import useFetch from '../../../hooks/useFetch'
import { MyTextField, MyProgress, MuiAutocomplete } from '../../../components/FormFields'
import { Formik, Form } from "formik";
import { postData } from '../../../services/NetworkService'
import Loading from 'src/components/Loading'
import { SuccessMsg } from './../order/LocationFields';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import toast from 'react-hot-toast'

function ProductForm(props) {
    const { t } = useTranslation();
    const history = useHistory();
    const { data: cate } = useFetch('categories', null, 1000)
    const { data: prestaProducts } = useFetch('prestashop/products')
    const { error, isPending, data: products } = useFetch('products/all')
    const { data: taxRuleGroups } = useFetch('prestashop/tax-rule-groups')
    const [filteredTaxRuleGroups, setFilteredTaxRuleGroups] = useState(null)
    const [filteredPrestaProducts, setFilteredPrestaProducts] = useState(null)
    const productData = props?.data
    console.log('productData?.tva', productData?.tva)
    const reloadFunc = props.handleReload
    let [successMsg, setSuccessMsg] = useState('')
    const [err, setErr] = useState(false)
    const [initialValues, setInitialValues] = useState({
        name: '',
        category: { id: null },
        ref: '',
        description: '',
        htPrice: null,
        unit: '',
        tva: '',
        isExpiry: false,
        isFresh: false
    })
    const [isLoaded, setLoaded] = useState(false)
    const [selectedCate, setSelectedCate] = useState(null)
    const [selectedPrestaProduct, setSelectedPrestaProduct] = useState(null)
    const edit = props?.data ? true : false
    const title = `${edit ? t('Edit') : t('Add')} ${t('Product')}`;
    const [undertakenCondition, setUndertakenCondition] = useState(true);
    const reloadCallback = props.reloadCallback;
    const sort = props.sort;
    const setErrorMsg = () => {
        setErr(true)
        setSuccessMsg(t("Some error occured, Sorry for inconvenience, Please try again later"))
        setTimeout(() => { setSuccessMsg(''); setErr(false); }, 2500)
    }

    useEffect(() => {
        if(taxRuleGroups) {
            let _taxRuleGroups = taxRuleGroups.data.filter(item=>item.deleted === false && item.active === true).map(item=>({...item, name: item.id + ' - ' + item.name}))
            setFilteredTaxRuleGroups(_taxRuleGroups)
            console.log('taxRuleGroups',_taxRuleGroups)
        }
    }, [taxRuleGroups])
    

    useEffect(() => {

        if (edit && productData && cate && prestaProducts) {
            setInitialValues(productData)
            if (cate.data) {
                let category = productData.category ? cate.data.content.filter(o => o.id === productData.category.id) : ''
                setSelectedCate(category)
            }
            if(prestaProducts.data){
                let selectedPrestaProduct = productData.prestashopProductId ? prestaProducts.data.filter(o => o.id == productData.prestashopProductId) : ''
                setSelectedPrestaProduct(selectedPrestaProduct)
            }
            setLoaded(true)
        }

        if(products && prestaProducts){
            const productMap = new Map();
            products.data.content.map(product => productMap.set(product.prestashopProductId, product))
            let filterdPrestaProducts = prestaProducts.data.filter(prestaProduct => !(productMap.has(prestaProduct.id)))
            // alert(JSON.stringify(filterdPrestaProducts))
            console.log(filterdPrestaProducts)
            setFilteredPrestaProducts(filterdPrestaProducts)
        }

    }, [cate, edit, productData, prestaProducts, products, taxRuleGroups])

    const handleSubmit = (values, setSubmitting) => {
        toast.promise(
            postData('products', values),
            {
              loading: 'Loading',
              success: (resp) => {
                setSubmitting(false)
                reloadCallback(null,null,sort)
                setTimeout(()=>props.onClose(),1500)
                if (resp.data.data.id) {
//                    reloadFunc()
                    return "Form submitted successfully"
                } else {
                      return "Some problem occured. Contact system support."
                }
              },
              error: (err) => {setSubmitting(false); return "Some problem occured. Contact system support."}
            },
            {
              style: {
                minWidth: '180px',
              },
              position: 'bottom-center'
            }
        );
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
                            <MyTextField placeholder={t('Product Name')} name="name" label={t('Product Name')} />
                            {filteredPrestaProducts && <MuiAutocomplete
                                data={filteredPrestaProducts}
                                setFieldValue={setFieldValue}
                                placeholder={t('Ecommerce Store Products')}
                                displayKey={'name'}
                                name="prestashopProductId"
                                valueKey="id"
                                label={t('Ecommerce Store Products')}
                                val={selectedPrestaProduct ? selectedPrestaProduct[0] : null}
                                disabled = {selectedPrestaProduct && selectedPrestaProduct.length > 0}
                            />}
                            <MyTextField placeholder={t('Price')} name="htPrice" label={t('Price')} type='number' required />
                            {cate && <MuiAutocomplete
                                data={cate.data.content}
                                setFieldValue={setFieldValue}
                                placeholder={t('Category')}
                                displayKey={'name'}
                                name="category.id"
                                valueKey="id"
                                label={t('Category')}
                                val={selectedCate ? selectedCate[0] : null}
                                required
                            />}
                            <MyTextField multiple rows={3} placeholder={t('Description')} name="description" label={t('Description')} />
                            <MyTextField placeholder={t('Ref')} name="ref" label={t('Ref')} required />
                            <MyTextField placeholder={t('Unit')} name="unit" label={t('Unit')} />
                            {filteredTaxRuleGroups && <MuiAutocomplete
                                data={filteredTaxRuleGroups}
                                setFieldValue={setFieldValue}
                                placeholder={t('Tax Rule Group')}
                                displayKey={'name'}
                                name="tva"
                                valueKey="id"
                                label={t('Tax Rule Group')}
                                val={filteredTaxRuleGroups?.filter(o => o.id.toString() === productData?.tva)[0]}
                                required
                            />}
                            {/* <MyTextField placeholder={t('Tva')} name="tva" label={t('Tva')} /> */}
                            <FormControlLabel
                                                required
                                                control={
                                                    <Checkbox
                                                        checked={values.isExpiry}
                                                        onChange={e => setFieldValue('isExpiry', e.target.checked)}
                                                        name="isExpiry"
                                                        color="primary"
                                                        size="small"
                                                    />
                                                }
                                                label={"Has product expiry date"}
                                            />
                            <FormControlLabel
                                                required
                                                control={
                                                    <Checkbox
                                                        checked={values.isFresh}
                                                        onChange={e => setFieldValue('isFresh', e.target.checked)}
                                                        name="isFresh"
                                                        color="primary"
                                                        size="small"
                                                    />
                                                }
                                                label={"Lot Number"}
                                            />
                            <div>
                                <button type="submit" disabled={isSubmitting} className="btn btn-sm btn-primary">{t('Submit')}</button>
                            </div>
                            <SuccessMsg successMsg={successMsg} err={err} />
                            <MyProgress isSubmitting={isSubmitting} />
                        </Form>
                    )}
                </Formik>
            </Content>

    )
}
export default ProductForm;
