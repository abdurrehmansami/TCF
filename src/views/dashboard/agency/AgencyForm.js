import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import Content from '../../../components/Content'
import useFetch from '../../../hooks/useFetch'
import { MyDropzone } from '../../../components/MyDropZone'
import { MyTextField, MyDateField, MuiAutocomplete, MySelectField, MyProgress } from '../../../components/FormFields'
import { Formik, Form } from "formik";
import { postData, postFormData } from '../../../services/NetworkService';
import * as yup from "yup";
import Loading from 'src/components/Loading'
import { SuccessMsg } from './../order/LocationFields';

const validationSchema = yup.object({
    name: yup
        .string()
        .required()
        .max(30),
});

function AgencyForm(props) {
    const { t } = useTranslation();
    const history = useHistory();
    const { data: rgn } = useFetch('regions', null, 1000)
    const { data: emps } = useFetch('employees', null, 1000)
    const agencyData = props?.data
    let [successMsg, setSuccessMsg] = useState('')
    const [err, setErr] = useState(false)
    const [initialValues, setInitialValues] = useState({
        name: '',
        regionId: 0,
        agencyDirectoryId: 0,
        agencyType: '',
        denominationValue: '',
        phone: '',
        fax: '',
        email: '',
        TVANumber: '',
        codeAPE: '',
        identificationNumber: '',
        siretNumber: '',
        amountOfCapital: '',
        denomination: '',
        dob: '',
        addressDto: { street: '', street2: '', postalCode: '', city: '', country: '' },
        addressHeadQuarterDto: { street: '', street2: '', postalCode: '', city: '', country: '' },
        photoDto: null,
        contractDto: null
    })
    const [isLoaded, setLoaded] = useState(false)
    const [selectedRgn, setSelectedRgn] = useState(null)
    const [selectedEmp, setSelectedEmp] = useState(null)
    const edit = props.data ? true : false
    const title = `${edit ? t('Edit') : t('Add')} ${t('Agency')}`
    const reloadCallback = props.reloadCallback
    const sort = props.sort;
    const setErrorMsg = () => {
        setErr(true)
        setSuccessMsg(t("Some error occured, Sorry for inconvenience, Please try again later"))
        setTimeout(() => { setSuccessMsg(''); setErr(false); }, 2500)
    }

    useEffect(() => {
        if (edit && agencyData && rgn && emps) {
            setInitialValues(agencyData)
            if (rgn.data) {
                let region = rgn.data.content.filter(o => o.id == agencyData.regionId)
                setSelectedRgn(region)
            }
            if (emps.data) {
                let agencyDirectory = emps.data.content.filter(o => o.id == agencyData.agencyDirectoryId)
                setSelectedEmp(agencyDirectory)
            }
            setLoaded(true)
        }
    }, [rgn, emps])

    const handleSubmit = (values, setSubmitting) => {
        let dataFiles = [];
        let artifect_types = '';
        let base_paths = '';
        if (values.photoDto !== initialValues.photoDto) {
            dataFiles.push(values.photoDto[0])
            artifect_types += 'photo' + ","
            delete values.photoDto
        }
        if (values.contractDto !== initialValues.contractDto) {
            dataFiles.push(values.contractDto[0])
            artifect_types += 'contract'
            delete values.contractDto
        }
        var formData = new FormData();
        formData.append('artifect_type', artifect_types)
        postData('agencies', values)
            .then(async response => {
                if (dataFiles.length == 0) {
                    setSubmitting(false)
                    setSuccessMsg(t("Your form is submitted successfully"))
                    reloadCallback(null,null,sort)
                    return
                }
                const id = response.data.data.id;
                artifect_types.split(',').map(type => {
                    base_paths += '/agencies/' + id + '/' + type + ','
                })
                base_paths = base_paths.slice(0, -1);
                formData.append('base_path', base_paths)
                dataFiles.map(o => {
                    formData.append('dataFiles', o)
                })
                postFormData(formData)
                    .then(res => {
                        res.data.files.map(file => {
                            values[file.artifect_type + 'Dto'] = {
                                'path': file.path,
                                'mimeType': file.mimetype,
                                'title': file.filename,
                                'description': values.description,
                                'mediaType': file.artifect_type
                            }
                        })
                        values.id = id
                        postData('agencies/', values)
                            .then(resp => {
                                console.log(resp.data)
                                setSubmitting(false)
                                setSuccessMsg(t("Your form is submitted successfully"))
                                reloadCallback(null,null,sort)
                            })
                            .catch(err => {
                                setErrorMsg()
                                setSubmitting(false)
                            })
                    })
                    .catch(err => {
                        setErrorMsg()
                        setSubmitting(false)
                    })
            })
            .catch(error => {
                setSubmitting(false)
                alert(error)
            })
    }

    const setHeadQuarterAddress = (e, values, setFieldValue) => {
        if (e.target.checked) {
            setFieldValue("addressHeadQuarterDto.street", values.addressDto.street)
            setFieldValue("addressHeadQuarterDto.street2", values.addressDto.street2)
            setFieldValue("addressHeadQuarterDto.postalCode", values.addressDto.postalCode)
            setFieldValue("addressHeadQuarterDto.city", values.addressDto.city)
            setFieldValue("addressHeadQuarterDto.country", values.addressDto.country)
        }
    }

    return (
        edit && !isLoaded ? <Loading /> :
            <Content title={title} >
                <Formik
                    initialValues={initialValues}
                    enableReinitialize={true}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        handleSubmit(values, setSubmitting)
                    }}
                >
                    {({ values, isSubmitting, setFieldValue }) => (
                        <Form>
                            <MyTextField placeholder={t('Agency name')} name="name" label={t('Agency name')} inputProps={{ maxLength: 100 }} required autoFillOff />
                            {rgn && <MuiAutocomplete
                                data={rgn.data.content}
                                setFieldValue={setFieldValue}
                                placeholder={t('Select a region')}
                                displayKey={'name'}
                                name="regionId"
                                valueKey="id"
                                val={selectedRgn ? selectedRgn[0] : null}
                            />}
                            <MySelectField name="agencyType" placeholder={t('Agency type')} required options={
                                [
                                    { label: t('Internal'), value: 'internal' },
                                    { label: t('Distributor'), value: 'distributor' }
                                ]
                            } />
                            {emps && <MuiAutocomplete
                                data={emps.data.content}
                                setFieldValue={setFieldValue}
                                placeholder={t('Enter Employee')}
                                displayKey={'fullname'}
                                name="agencyDirectoryId"
                                valueKey="id"
                                label={t('Responsible')}
                                val={selectedEmp ? selectedEmp[0] : null}
                            />}
                            <div className="form-group row">
                                <label className="col-sm-4 col-form-label" >{t('Manager')}</label>
                                <div className="col-sm-8">
                                    <input className="form-check-input" type="checkbox" />
                                </div>
                            </div>
                            <MyTextField type="tel" placeholder="" name="phone" label={t("Phone")} required />
                            <MyTextField placeholder="" name="fax" label={t("Fax")} />
                            <MyTextField placeholder="" name="email" label={t("EmailADV")} />
                            <legend><span>{t('Additional Information')}</span></legend>
                            <MyTextField placeholder="" name="TVANumber" label={t('VAT number')} required />
                            <MyTextField placeholder="" name="codeAPE" label={t('APE code')} required />
                            <MyTextField placeholder="" name="identificationNumber" label={t('Number')} required />
                            <MyTextField placeholder="" name="siretNumber" label={t('Siret number')} required />
                            <MyTextField placeholder="" name="amountOfCapital" label={t('Capital')} required />
                            <MySelectField name="denominationValue" placeholder={t('Denomination')} required options={
                                [
                                    { label: t('Other'), value: 'Other' },
                                    { label: t('Liberal profession'), value: 'Liberal profession' },
                                    { label: t('Association'), value: 'Association' },
                                    { label: t('SAS'), value: 'SAS' },
                                ]
                            } />
                            <MyDateField name="dob" label={t('Creation date')} setFieldValue={setFieldValue} required />
                            <MyTextField multiple rows={3} placeholder="Description" name="description" label={t('Description of the agency')} required />
                            <legend><span>{t('Agency Address address information')} </span></legend>
                            <MyTextField placeholder={t("Address")} name="addressDto.street" label={t('Address')} required />
                            <MyTextField placeholder="" name="addressDto.street2" label={t('Address (supplement)')} />
                            <MyTextField placeholder="" name="addressDto.postalCode" label={t('Postal code')} required />
                            <MyTextField placeholder="" name="addressDto.city" label={t('City')} required />
                            <MyTextField placeholder={t("France")} name="addressDto.country" label={t('Country')} required />
                            <legend><span>{t('Headquarters Address address information')}</span></legend>
                            <div className="form-group row">
                                <label className="col-sm-4 col-form-label" > {t('Use the same address as the agency')}</label>
                                <div className="col-sm-8">
                                    <input className="form-check-input" type="checkbox" onChange={e => setHeadQuarterAddress(e, values, setFieldValue)} />
                                </div>
                            </div>
                            <MyTextField placeholder={t("Address")} name="addressHeadQuarterDto.street" label={t('Address')} />
                            <MyTextField placeholder="" name="addressHeadQuarterDto.street2" label={t('Address (supplement)')} />
                            <MyTextField placeholder="" name="addressHeadQuarterDto.postalCode" label={t('Postal code')} />
                            <MyTextField placeholder="" name="addressHeadQuarterDto.city" label={t('City')} />
                            <MyTextField placeholder={t("France")} name="addressHeadQuarterDto.country" label={t('Country')} />
                            <legend><span>{t('Related documents')}</span></legend>
                            <MyDropzone name="photoDto" label={t("Photo")} setFieldValue={setFieldValue} />
                            {agencyData && agencyData.photoDto &&
                                <div>
                                    <a href={agencyData.photoDto.path} target="_blank">{t('Photo')}</a>
                                    <br />
                                    <br />
                                </div>
                            }
                            <MyDropzone name="contractDto" label={t("Contract")} setFieldValue={setFieldValue} />
                            {agencyData && agencyData.contractDto &&
                                <div>
                                    <a href={agencyData.contractDto.path} target="_blank">{t('Contract')}</a>
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

export default AgencyForm;
