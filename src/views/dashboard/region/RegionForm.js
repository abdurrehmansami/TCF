import { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { useTranslation } from 'react-i18next'
import useFetch from '../../../hooks/useFetch'
import { postData, postFormData } from '../../../services/NetworkService';
import { MyTextField, MuiAutocomplete, MyProgress } from '../../../components/FormFields'
import { MyDropzone } from '../../../components/MyDropZone'
import { Formik, Form } from "formik";
import Content from '../../../components/Content'
import Loading from 'src/components/Loading';
import * as yup from "yup";
import { SuccessMsg } from '../order/LocationFields';

const validationSchema = yup.object({
    name: yup
        .string()
        .required()
        .max(30),
});

function RegionForm(props) {
    const { t } = useTranslation();
    const history = useHistory();
    const { data: emps } = useFetch('employees', null, 1000)
    const regionData = props?.data
    const [initialValues, setInitialValues] = useState({ name: '', description: '', chiefId: 0, photoDto: null })
    const [isLoaded, setLoaded] = useState(false)
    let [successMsg, setSuccessMsg] = useState('')
    const [err, setErr] = useState(false)
    const [selectedChf, setSelectedChf] = useState(null)
    const edit = props.data ? true : false
    const title = `${edit ? t('Edit') : t('Add')} ${t('Region')}`
    const reloadCallback = props.reloadCallback;
    const sort = props.sort;
    useEffect(() => {
        if (edit && regionData && emps) {
            setInitialValues(regionData)
            if (emps.data) {
                let chief = emps.data.content.filter(o => o.id == regionData.chiefId)
                setSelectedChf(chief)
            }
            setLoaded(true)
        }
    }, [emps])

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
        postData('regions', values)
            .then(async response => {
                if (dataFiles.length == 0) {
                    setSubmitting(false)
                    setSuccessMsg(t("Your form is submitted successfully!"))
                    reloadCallback(null,null,sort)
                    return
                }
                const id = response.data.data.id;
                artifect_types.split(',').map(type => {
                    base_paths += '/regions/' + id + '/' + type + ','
                })
                base_paths = base_paths.slice(0, -1);
                formData.append('base_path', base_paths)
                dataFiles.map(o => {
                    formData.append('dataFiles', o)
                })
                const res = await postFormData(formData);
                if (res && res.data.files) {
                    const file = res.data.files[0]
                    values.photoDto = {
                        'path': file.path,
                        'mimeType': file.mimetype,
                        'title': file.filename,
                        'description': values.description,
                        'mediaType': file.artifect_type
                    }
                    values.id = id
                    const resp = await postData('regions/', values)
                    if (resp.data) {
                        console.log(resp.data)
                    }
                    setSubmitting(false)
                    reloadCallback(null,null,sort)
                }
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
                    {({ isSubmitting, setFieldValue }) => (
                        <Form>
                            <MyTextField placeholder={t("Region name")} name="name" label={t("Region name")} required />
                            <MyTextField multiple rows={3} placeholder={t("Description")} name="description" label={t("Description")} />
                            {emps && <MuiAutocomplete
                                data={emps.data.content}
                                setFieldValue={setFieldValue}
                                placeholder={t('Enter Employee')}
                                displayKey={'fullname'}
                                name="chiefId"
                                valueKey="id"
                                val={selectedChf ? selectedChf[0] : null}
                            />}
                            <legend><span>{t('Related documents')}</span></legend>
                            <MyDropzone name="photoDto" label={t("Photo")} setFieldValue={setFieldValue} />
                            {regionData && regionData.photoDto &&
                                <div>
                                    <a href={regionData.photoDto.path} target="_blank">{t('Photo')}</a>
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

export default RegionForm;
