import { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { useTranslation } from 'react-i18next'
import useFetch from '../../../hooks/useFetch'
import { postData, postFormData } from '../../../services/NetworkService';
import { MyTextField, MyDateField, MuiAutocomplete, MyProgress } from '../../../components/FormFields'
import { Formik, Form } from "formik";
import Content from '../../../components/Content'
import Loading from 'src/components/Loading';
import * as yup from "yup";
import { MyDropzone } from '../../../components/MyDropZone'
import { SuccessMsg } from './../order/LocationFields';

const validationSchema = yup.object({
    name: yup
        .string()
        .required()
        .max(30),
});

function TeamForm(props) {
    const { t } = useTranslation();
    const history = useHistory();
    const { data: agn } = useFetch('agencies', null, 1000)
    const { data: emps } = useFetch('employees', null, 1000)
    const teamData = props.data
    const [initialValues, setInitialValues] = useState({ agencyId: 0, name: '', creationDate: '', chiefId: 0, employeeDtos: [], flag: 'ACTIVE', photoDto: null })
    const [isLoaded, setLoaded] = useState(false)
    const [selectedAgn, setSelectedAgn] = useState(null)
    const [selectedChf, setSelectedChf] = useState(null)
    const edit = props.data ? true : false
    const title = `${edit ? t('Edit') : t('Add')} ${t('Team')}`
    let [successMsg, setSuccessMsg] = useState('')
    const [err, setErr] = useState(false)

    useEffect(() => {
        if (edit && teamData && agn && emps) {
            setInitialValues(teamData)
            if (agn.data) {
                let agency = agn.data.content.filter(o => o.id === teamData.agencyId)
                setSelectedAgn(agency)
            }
            if (emps.data) {
                let chief = emps.data.content.filter(o => o.id === teamData.chiefId)
                setSelectedChf(chief)
            }
            setLoaded(true)
        }
    }, [agn, emps, edit, teamData])

    const setErrorMsg = () => {
        setErr(true)
        setSuccessMsg(t("Some error occured, Sorry for inconvenience, Please try again later"))
        setTimeout(() => { setSuccessMsg(''); setErr(false); }, 2500)
    }

    const handleSubmit = (values, setSubmitting) => {
        let dataFiles = [];
        let artifect_types = '';
        let base_paths = '';
        if (values.photoDto !== initialValues.photoDto) {
            dataFiles.push(values.photoDto[0])
            artifect_types += 'photo'
            delete values.photoDto
        }
        var formData = new FormData();
        formData.append('artifect_type', artifect_types)
        postData('teams', values)
            .then(async response => {
                if (dataFiles.length === 0) {
                    setSubmitting(false)
                    setSuccessMsg(t("Your order is updated successfully"))
                    setTimeout(() => { setSuccessMsg(''); history.push("/teams"); }, 2500)
                    return
                }
                const id = response.data.data.id;
                artifect_types.split(',').map(type => {
                    return base_paths += '/teams/' + id + '/' + type + ','
                })
                base_paths = base_paths.slice(0, -1);
                formData.append('base_path', base_paths)
                dataFiles.map(o => {
                    return formData.append('dataFiles', o)
                })
                postFormData(formData)
                    .then(res => {
                        const file = res.data.files[0]
                        values.photoDto = {
                            'path': file.path,
                            'mimeType': file.mimetype,
                            'title': file.filename,
                            'description': values.description,
                            'mediaType': file.artifect_type
                        }
                        values.id = id
                        postData('teams/', values)
                            .then(resp => {
                                console.log(resp.data)
                                setSubmitting(false)
                                setSuccessMsg(t("Your order is updated successfully"))
                                setTimeout(() => { setSuccessMsg(''); history.push("/teams"); }, 2500)
                            })
                            .catch(err => {
                                setErrorMsg()
                                setSubmitting(false)
                            })
                        setSubmitting(false)
                    })
                    .catch(err => {
                        setErrorMsg()
                        setSubmitting(false)
                    })
            })
            .catch(error => {
                setSubmitting(false)
                setErrorMsg()
                alert(error)
            })
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
                            {agn && <MuiAutocomplete
                                data={agn.data.content}
                                setFieldValue={setFieldValue}
                                placeholder={t('Agency')}
                                displayKey={'name'}
                                name="agencyId"
                                valueKey="id"
                                val={selectedAgn ? selectedAgn[0] : null}
                            />}
                            <MyTextField placeholder={t('Team name')} name="name" label={t('Team name')} />
                            <MyDateField name="creationDate" label={t('Creation date')} setFieldValue={setFieldValue} />
                            {emps && <MuiAutocomplete
                                data={emps.data.content}
                                setFieldValue={setFieldValue}
                                itemDisplayOpts={{ showItems: false, showImage: true, imgKey: 'photoMedia' }}
                                placeholder={t('Enter Employee')}
                                displayKey={'fullname'}
                                name="chiefId"
                                valueKey="id"
                                val={selectedChf ? selectedChf[0] : null}
                            />}
                            <legend><span>{t('Related documents')}</span></legend>
                            <MyDropzone name="photoDto" label={t('Photo')} setFieldValue={setFieldValue} multiple />
                            {teamData && teamData.photoDto &&
                                <div>
                                    <a href={teamData.photoDto.path} rel="noreferrer" target="_blank">{t('Photo')}</a>
                                    <br />
                                    <br />
                                </div>
                            }
                            <div className="form-group row">
                                <label className="col-form-label col-sm-4" >{t('Photo')}</label>
                                <div className="col-sm-8">
                                    <label className="col-form-label col-sm-4" >{t('Others')}</label>
                                </div>
                            </div>
                            <legend><span>{t('Members')}</span></legend>
                            {emps &&
                                <MuiAutocomplete
                                    label={t('Members')}
                                    data={emps.data.content}
                                    setFieldValue={setFieldValue}
                                    placeholder={t('Enter Employee')}
                                    displayKey={'fullname'}
                                    val={values.employeeDtos}
                                    name="employeeDtos"
                                    itemDisplayOpts={{ showItems: true, showImage: true, imgKey: 'photoMedia' }}
                                    multiple={true}
                                />
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

export default TeamForm;