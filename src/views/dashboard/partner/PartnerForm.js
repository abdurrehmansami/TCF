import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import Content from '../../../components/Content'
import { MyTextField, MySelectField, MyProgress } from '../../../components/FormFields'
import { Formik, Form } from "formik";
import { postData, putData, postFormData } from '../../../services/NetworkService';
import * as yup from "yup";
import { useEffect, useState } from 'react'
import { MyDropzone } from '../../../components/MyDropZone'
import Loading from 'src/components/Loading';
import { SuccessMsg } from './../order/LocationFields';
const validationSchema = yup.object({
    name: yup
        .string()
        .required()
        .max(30),
    phone: yup
        .number()
        .required()
});

function PartnerForm(props) {
    const history = useHistory();
    const { t } = useTranslation();
    const partnerData = props?.data;
    const edit = props?.data ? true : false
    const title = `${edit ? t('Edit') : t('Add')} ${t('Partner')}`
    const [isLoaded, setLoaded] = useState(false)
    let [successMsg, setSuccessMsg] = useState('')
    const [err, setErr] = useState(false)
    const reloadCallback = props.reloadCallback
    const sort = props.sort;
    const [initialValues, setInitialValues] = useState({
        name: '',
        phone: '',
        fax: '',
        tvaNumber: '',
        codeAPE: '',
        identificationNumber: '',
        siretNumber: '',
        amountOfCapital: '',
        denomination: '',
        description: '',
        addressDto: { street: '', street2: '', postalCode: '', city: '', country: '' },
        commercialContactDto: { name: '', firstName: '', function: '', telephone: '', email: '' },
        comptableContactDto: { name: '', firstName: '', function: '', telephone: '', email: '' },
        adminContactDto: { name: '', firstName: '', function: '', telephone: '', email: '' },
        photoMedia: null, workContractMedia: null

    })
    const setErrorMsg = () => {
        setErr(true)
        setSuccessMsg(t("Some error occured, Sorry for inconvenience, Please try again later"))
        setTimeout(() => { setSuccessMsg(''); setErr(false); }, 2500)
    }

    useEffect(() => {
        if (edit && partnerData) {
            setInitialValues(partnerData)
            setLoaded(true)
        }
    }, [edit, partnerData])

    const handleSubmit = (values, setSubmitting) => {
        let dataFiles = [];
        let artifect_types = '';
        let base_paths = '';
        if (values.photoMedia !== initialValues.photoMedia) {
            dataFiles.push(values.photoMedia[0])
            artifect_types += 'photo,'
            delete values.photoMedia

        } if (values.workContractMedia !== initialValues.workContractMedia) {
            dataFiles.push(values.workContractMedia[0])
            artifect_types += 'workContract,'
            delete values.workContractMedia
        }
        var formData = new FormData();
        formData.append('artifect_type', artifect_types)
        if (edit) {
            putData('partners', values)
                .then(async response => {
                    if (dataFiles.length === 0) {
                        setSubmitting(false);
                        setSuccessMsg(t("Your form is updated successfully!"))
                        reloadCallback(null,null,sort)
                        return
                    }
                    const id = response.data.id;
                    artifect_types.split(',').map(type => {
                        return base_paths += '/partners' + id + '/' + type + ','
                    })
                    base_paths = base_paths.slice(0, -1);
                    formData.append('base_path', base_paths)
                    dataFiles.map(o => {
                        return formData.append('dataFiles', o)
                    })
                    postFormData(formData)
                        .then(res => {
                            res.data.files.map(file => {
                                return values[file.artifect_type + 'Media'] = {
                                    'path': file.path,
                                    'mimeType': file.mimetype,
                                    'title': file.filename,
                                    'description': values.description,
                                    'mediaType': file.artifect_type
                                }
                            })
                            values.id = id
                            putData('partners/', values)
                                .then(resp => {
                                    console.log(resp.data)
                                    setSubmitting(false)
                                    setSuccessMsg(t("Your form is updated successfully"))
                                    reloadCallback(null,null,sort)
                                })
                                .catch(error => {
                                    setErrorMsg()
                                    setSubmitting(false)
                                })
                        })
                        .catch(error => {
                            setErrorMsg()
                            setSubmitting(false)
                        })
                })
                .catch(error => {
                    setErrorMsg()
                    setSubmitting(false)
                })
        } else {
            postData('partners', values)
                .then(async response => {
                    if (dataFiles.length === 0) {
                        setSubmitting(false)
                        setSuccessMsg(t("Your form is submitted successfully"))
                        reloadCallback(null,null,sort)
                        return
                    }
                    const id = response.data.id;
                    artifect_types.split(',').map(type => {
                        return base_paths += '/partners/' + id + '/' + type + ','
                    })
                    base_paths = base_paths.slice(0, -1);
                    formData.append('base_path', base_paths)
                    dataFiles.map(o => {
                        return formData.append('dataFiles', o)
                    })
                    postFormData(formData)
                        .then(res => {
                            res.data.files.map(file => {
                                return values[file.artifect_type + 'Media'] = {
                                    'path': file.path,
                                    'mimeType': file.mimetype,
                                    'title': file.filename,
                                    'description': values.description,
                                    'mediaType': file.artifect_type
                                }
                            })
                            values.id = id
                            postData('partners/', values)
                                .then(resp => {
                                    console.log(resp.data)
                                    setSubmitting(false)
                                    setSuccessMsg(t("Your form is submitted successfully"))
                                    reloadCallback(null,null,sort)
                                })
                                .catch(error => {
                                    setErrorMsg()
                                    setSubmitting(false)
                                })
                        })
                        .catch(error => {
                            setErrorMsg()
                            setSubmitting(false)
                        })
                })
                .catch(error => {
                    setErrorMsg()
                    setSubmitting(false)
                })
        }

    }

    return (
        edit && !isLoaded ? <Loading /> :
            <Content title={title} >
                <Formik
                    initialValues={initialValues}
                    enableReinitialize={true}
                    validateOnChange={true}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        handleSubmit(values, setSubmitting)
                    }}
                >
                    {({ isSubmitting, setFieldValue }) => (
                        <Form>
                            <MyTextField placeholder='' name="name" label={t('Partner name')} required />
                            <MySelectField name="type" placeholder={t('Partner Type')} options={
                                [
                                    { label: t('Direct'), value: 'DIRECT' },
                                    { label: t('SubContractor'), value: 'SUBCONTRACTOR' }
                                ]
                            } />
                            <MyTextField placeholder='' name="_" label={t('Customer code')} />
                            <MyTextField type="tel" placeholder="" name="phone" label={t('Phone')} required />
                            <MyTextField placeholder="" name="fax" label={t('Fax')} />
                            <legend><span>{t('Additional Information')}</span></legend>
                            <MyTextField placeholder="" name="tvaNumber" label={t('VAT number')} />
                            <MyTextField placeholder="" name="codeAPE" label={t('APE Code')} />
                            <MyTextField placeholder="" name="identificationNumber" label={t('Registration number')} />
                            <MyTextField placeholder="" name="siretNumber" label={t('Siret number')} />
                            <MyTextField placeholder="" name="amountOfCapital" label={t('Capital')} />
                            <MySelectField name="denomination" placeholder={t('Denomination')} options={
                                [
                                    { label: t('Other'), value: 0 },
                                    { label: t('Liberal profession'), value: 1 },
                                    { label: t('Association'), value: 2 },
                                    { label: t('SAS'), value: 3 },
                                    { label: t('SARL'), value: 4 },
                                    { label: t('EURL'), value: 5 },
                                    { label: t('Anonimoue society'), value: 6 },
                                    { label: t('Administration'), value: 7 },
                                ]
                            } />
                            <MyTextField placeholder="" name="description" label={t('Partner description')} />
                            <legend><span>{t('Address information')}</span></legend>
                            <MyTextField placeholder="" name="addressDto.street" label={t('Address')} />
                            <MyTextField placeholder="" name="addressDto.street2" label={t('Address (supplement)')} />
                            <MyTextField placeholder="" name="addressDto.postalCode" label={t('Postal code')} />
                            <MyTextField placeholder="" name="addressDto.city" label={t('City')} />
                            <MyTextField placeholder={t("France")} name="addressDto.country" label={t('Country')} />
                            <legend><span>{t('Commercial Contacts')}</span></legend>
                            <MyTextField placeholder="" name="commercialContactDto.name" label={t('Last name')} />
                            <MyTextField placeholder="" name="commercialContactDto.firstName" label={t('First name')} />
                            <MyTextField placeholder="" name="commercialContactDto.function" label={t('Position in the company')} />
                            <MyTextField placeholder="" name="commercialContactDto.telephone" label={t('Phone')} />
                            <MyTextField placeholder="" name="commercialContactDto.email" label={t('E-mail')} />
                            <legend><span>{t('Accounting Contacts')}</span></legend>
                            <MyTextField placeholder="" name="comptableContactDto.name" label={t('Last name')} />
                            <MyTextField placeholder="" name="comptableContactDto.firstName" label={t('First name')} />
                            <MyTextField placeholder="" name="comptableContactDto.function" label={t('Position in the company')} />
                            <MyTextField placeholder="" name="comptableContactDto.telephone" label={t('Phone')} />
                            <MyTextField placeholder="" name="comptableContactDto.email" label={t('E-mail')} />
                            <legend><span>{t('Administrative Contacts')}</span></legend>
                            <MyTextField placeholder="" name="adminContactDto.name" label={t('Last name')} />
                            <MyTextField placeholder="" name="adminContactDto.firstName" label={t('First name')} />
                            <MyTextField placeholder="" name="adminContactDto.function" label={t('Position in the company')} />
                            <MyTextField placeholder="" name="adminContactDto.telephone" label={t('Phone')} />
                            <MyTextField placeholder="" name="adminContactDto.email" label={t('E-mail')} />
                            <legend><span>{t('Related documents')}</span></legend>
                            <MyDropzone name="photoMedia" label={t("Photo")} setFieldValue={setFieldValue} />
                            {partnerData && partnerData.photoMedia &&
                                <div>
                                    <a href={partnerData.photoMedia.path} target="_blank" rel="noreferrer">{t('Photo')}</a>
                                    <br />
                                    <br />
                                </div>
                            }
                            <MyDropzone name="workContractMedia" label={t("Contract")} setFieldValue={setFieldValue} />
                            {partnerData && partnerData.workContractMedia &&
                                <div>
                                    <a href={partnerData.workContractMedia.path} target="_blank" rel="noreferrer">{t('Photo')}</a>
                                    <br />
                                    <br />
                                </div>
                            }
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

export default PartnerForm;
