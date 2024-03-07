import { postData, postFormData, putData } from '../../../services/NetworkService';
import { useHistory } from 'react-router'
import { useTranslation } from 'react-i18next'
import { MyTextField, MyDateField, MuiAutocomplete, MySelectField, MyProgress, MyRadioGroup } from '../../../components/FormFields'
import { MyDropzone } from '../../../components/MyDropZone'
import { Formik, Form } from "formik";
import Content from '../../../components/Content'
import useFetch from '../../../hooks/useFetch'
import * as yup from "yup";
import { useEffect, useState } from 'react'
import Loading from 'src/components/Loading';
import { getData } from 'src/services/NetworkService';
import { SuccessMsg } from './../order/LocationFields';

const validationSchema = yup.object({
    name: yup
        .string()
        .required()
        .max(30),
    firstName: yup
        .string()
        .required(),
    login: yup
        .string()
        .required(),
    email: yup
        .string()
        .required(),
});

function EmployeeForm(props) {
    const { t } = useTranslation();
    const history = useHistory();
    const { data: agn } = useFetch('agencies', null, 1000)
    const { data: roles } = useFetch('roles', null, 1000)
    const { data: jobs } = useFetch('jobs', null, 1000)
    const employeeData = props?.data
    const [initialValues, setInitialValues] = useState({
        addressDto: {}, name: '', roleId: null, jobId: null, employeeStatus: null,
        familyStatus: null, firstName: '', agencyId: null, teamId: null, knowActiv: null, civility: null,
        recruitmentDate: null, birthday: null, login: "", photoMedia: null,
        idCardMedia: null, residenceProofMedia: null, securityCardMedia: null, workContractMedia: null, password: '123456'
    })
    const [isLoaded, setLoaded] = useState(false)
    const [teams, setTeams] = useState(null)
    const [selectedAgn, setSelectedAgn] = useState(null)
    const [selectedTeam, setSelectedTeam] = useState(null)
    const edit = props.data ? true : false
    const title = `${edit ? t('Edit') : t('Add')} ${t('Employee')}`
    let [successMsg, setSuccessMsg] = useState('')
    const [err, setErr] = useState(false)
    const reloadCallback = props.reloadCallback;
    const sort = props.sort;
    const selectTeams = (agencyId) => {
        getData(`agencies/${agencyId}/teams`)
            .then(response => {
                let teams = response.data.data
                setTeams(response.data.data)
                if (edit) {
                    if (teams) {
                        let team = teams.filter(o => o.id === employeeData.teamId)
                        setSelectedTeam(team)
                        setLoaded(true)
                    }
                }
            }).catch(e => console.log(e))
    }

    useEffect(() => {
        if (edit && employeeData && agn && roles && jobs) {
            setInitialValues(employeeData)
            if (agn.data && employeeData.agencyId !== null && employeeData.agencyId !== 0) {
                let agency = agn.data.content.filter(o => o.id === employeeData.agencyId)
                setSelectedAgn(agency)
                selectTeams(employeeData.agencyId)
            } else {
                setLoaded(true)
            }
        }
    }, [agn, roles, jobs, edit, employeeData])

    const setErrorMsg = () => {
        setErr(true)
        setSuccessMsg(t("Some error occured, Sorry for inconvenience, Please try again later"))
        setTimeout(() => { setSuccessMsg(''); setErr(false); }, 2500)
    }

    const handleSubmit = (values, setSubmitting) => {
        let dataFiles = [];
        let artifect_types = '';
        let base_paths = '';
        if (values.photoMedia !== initialValues.photoMedia) {
            dataFiles.push(values.photoMedia[0])
            artifect_types += 'photo,'
            delete values.photoMedia
        }
        if (values.idCardMedia !== initialValues.idCardMedia) {
            dataFiles.push(values.idCardMedia[0])
            artifect_types += 'idCard,'
            delete values.idCardMedia
        }
        if (values.residenceProofMedia !== initialValues.residenceProofMedia) {
            dataFiles.push(values.residenceProofMedia[0])
            artifect_types += 'residenceProof,'
            delete values.residenceProofMedia
        }
        if (values.securityCardMedia !== initialValues.securityCardMedia) {
            dataFiles.push(values.securityCardMedia[0])
            artifect_types += 'securityCard,'
            delete values.securityCardMedia

        } if (values.workContractMedia !== initialValues.workContractMedia) {
            dataFiles.push(values.workContractMedia[0])
            artifect_types += 'workContract,'
            delete values.workContractMedia
        }
        if (values.carDocumentMedia !== initialValues.carDocumentMedia) {
            dataFiles.push(values.carDocumentMedia[0])
            artifect_types += 'carDocument,'
            delete values.carDocumentMedia
        }
        var formData = new FormData();
        formData.append('artifect_type', artifect_types)
        if (edit) {
            putData('employees', values)
                .then(async response => {
                    if (dataFiles.length === 0) {
                        setSubmitting(false)
                        setSuccessMsg(t("Your form is updated successfully"))
                        reloadCallback(null,null,sort)
                        return
                    }
                    const id = response.data.data.id;
                    artifect_types.split(',').map(type => {
                        return base_paths += '/employees/' + id + '/' + type + ','
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
                            putData('employees/', values)
                                .then(resp => {
                                    setSubmitting(false)
                                    setSuccessMsg(t("Your form is updated successfully"))
                                    reloadCallback(null,null,sort)
                                    console.log(resp.data)
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
        else {
            postData('employees', values)
                .then(async response => {
                    if (dataFiles.length === 0) {
                        setSubmitting(false)
                        setSuccessMsg(t("Your form is submitted successfully"))
                        reloadCallback(null,null,sort)
                        return
                    }
                    const id = response.data.data.id;
                    artifect_types.split(',').map(type => {
                        return base_paths += '/employees/' + id + '/' + type + ','
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
                            postData('employees/', values)
                                .then(resp => {
                                    console.log(resp.data)
                                    setSubmitting(false)
                                    setSuccessMsg(t("Your form is submitted   successfully"))
                                    reloadCallback(null,null,sort)
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
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        handleSubmit(values, setSubmitting)
                    }}
                >
                    {({ isSubmitting, setFieldValue }) => (
                        <Form>
                            <legend><span>{t('Employee agency')}</span></legend>
                            {agn && <MuiAutocomplete
                                data={agn.data.content}
                                setFieldValue={setFieldValue}
                                placeholder={t('Agency')}
                                displayKey={'name'}
                                name="agencyId"
                                valueKey="id"
                                parentCallbackOpt={selectTeams}
                                val={selectedAgn ? selectedAgn[0] : null}
                                required
                            />}
                            <legend><span>{t('Personal Information')}</span></legend>
                            <MyRadioGroup
                                name="civility"
                                label=""
                                options={
                                    [
                                        { value: 'MR', label: t('Mr.') },
                                        { value: 'MRS', label: t('Mrs') },
                                        { value: 'MISS', label: t('Miss') }
                                    ]
                                }
                            />
                            <MyTextField
                                placeholder={t("Name")}
                                name="name"
                                required
                                label={t("Name")} />
                            <MyTextField
                                placeholder={t("First name")}
                                name="firstName"
                                label={t("First name")} required />
                            <MyTextField
                                placeholder={t("Other first name")}
                                name="otherNames"
                                label={t("Other first name")} />
                            <MyTextField
                                placeholder={t("Address")}
                                name="addressDto.street"
                                label={t("Address")} required />
                            <MyTextField
                                placeholder={t("Address (supplement)")}
                                name="addressDto.street2"
                                label={t("Address (supplement)")} />
                            <MyTextField
                                placeholder={t("Postal code")}
                                name="addressDto.postalCode"
                                label={t("Postal code ")} required />
                            <MyTextField
                                placeholder={t("City")}
                                name="addressDto.city"
                                label={t("City")} required />
                            <MyTextField
                                placeholder={t("Country")}
                                name="addressDto.country"
                                label={t("Country")} required />
                            <MyTextField
                                placeholder={t("Nationality")}
                                name="nationality"
                                label={t("Nationality")} required />
                            <MyDateField
                                name="birthday"
                                label={t("Date of birth")}
                                setFieldValue={setFieldValue} />
                            <MyTextField
                                placeholder={t("Place of birth")}
                                name="birthplace"
                                label={t("Place of birth")} required />
                            <MyRadioGroup
                                name="zus"
                                label={t("ZUS")}
                                options={
                                    [
                                        { value: 'Yes', label: t('Yes') },
                                        { value: 'No', label: t('No') },
                                    ]
                                }
                            />
                            <MySelectField
                                placeholder={t("Family Situation")}
                                name="familyStatus"
                                options={
                                    [
                                        { label: t('Single'), value: 'SINGLE' },
                                        { label: t('Married'), value: 'MARRIED' },
                                        { label: t('Separate'), value: 'SEPARATED' },
                                        { label: t('Divorced'), value: 'DIVORCED' },
                                        { label: t('Pasce'), value: 'PACS' },
                                    ]
                                } required />
                            <MyTextField
                                placeholder={t("Home phone")}
                                name="homePhone"
                                label={t("Home phone")} required />
                            <MyTextField
                                placeholder={t("Cell phone")}
                                name="mobilePhone"
                                label={t("Cell phone")} required />
                            <MyTextField
                                placeholder={t("Professional phone")}
                                name="_"
                                label={t("Professional phone")} />
                            <MyTextField
                                placeholder={t("Emergency Email")}
                                name="emergencyEmail"
                                label={t("Emergency Email")} required />
                            <MyTextField
                                placeholder={t("Social security number")}
                                name="numberSocialSecurity"
                                label={t("Social security number")} required />
                            <MyTextField
                                placeholder={t("RIB")}
                                name="bban"
                                label={t("RIB")} required />
                            <legend><span>{t('Company')}</span></legend>
                            <MyDateField
                                name="recruitmentDate"
                                label={t("Recruitment Date")}
                                setFieldValue={setFieldValue} />
                            <MyTextField
                                placeholder={t("ID number")}
                                name="identificationNumber"
                                label={t("ID number")} required />
                            {jobs && <MySelectField
                                placeholder={t("Function")}
                                name="jobId"
                                options={
                                    jobs.data.content.map(o => {
                                        return { label: o.name, value: o.id }
                                    })
                                } />}
                            <MySelectField
                                placeholder={t("Status")}
                                name="employeeStatus"
                                options={
                                    [
                                        { label: t('Employee'), value: 'employee' },
                                        { label: t('Auto entrepreneur'), value: 'selfcontractor' },
                                        { label: t('VDI'), value: 'vdi' },
                                        { label: t('VRP'), value: 'vrp' },
                                        { label: t('Learning'), value: 'learning' },
                                        { label: t('Other'), value: 'other' },
                                    ]
                                } required />
                            <MySelectField
                                placeholder={t('Application')}
                                name="knowActiv"
                                options={
                                    [
                                        { label: t('Press'), value: 'pressOrFlyer' },
                                        { label: t('Internet'), value: 'internet' },
                                        { label: t('Employment center'), value: 'employmentCenter' },
                                        { label: t('Social networks'), value: 'socialNetwork' },
                                        { label: t('Other'), value: 'other' },
                                    ]
                                } />
                            <MyTextField
                                placeholder={t("Email")}
                                name="email"
                                label={t("Email")} required />

                            <MyTextField
                                placeholder={t("Commision Percentage")}
                                name="commissionPercentage"
                                label={t("Commission Percentage")} />

                            <MyTextField
                                placeholder={t("Car Number")}
                                name="carNumber"
                                label={t("Car Number")} />

                            <legend><span>{t('Contact Person')}</span></legend>
                            <MyTextField
                                placeholder={t("Name")}
                                name="contactPersonName"
                                label={t("Name")} />
                            <MyTextField
                                placeholder={t("First name")}
                                name="contactPersonFirstName"
                                label={t("First name")} />
                            <MyTextField
                                placeholder={t("Home phone")}
                                name="contactPersonPhone"
                                label={t("Home Phone")} />
                            <MyTextField
                                placeholder={t("Cell phone")}
                                name="contactPersonMobile"
                                label={t("Cell Phone")} />

                            <legend><span>{t('Related Documents')}</span></legend>
                            <MyDropzone name="photoMedia" label={t("Photo")} setFieldValue={setFieldValue} />
                            {employeeData && employeeData.photoMedia &&
                                <div>
                                    <a href={employeeData.photoMedia.path} target="_blank" rel="noreferrer">{t('Photo')}</a>
                                    <br />
                                    <br />
                                </div>
                            }
                            <MyDropzone name="idCardMedia" label={t("ID")} setFieldValue={setFieldValue} />
                            {employeeData && employeeData.idCardMedia &&
                                <div>
                                    <a href={employeeData.idCardMedia.path} target="_blank" rel="noreferrer">{t('ID')}</a>
                                    <br />
                                    <br />
                                </div>
                            }
                            <MyDropzone name="residenceProofMedia" label={t("Proof of address")} setFieldValue={setFieldValue} />
                            {employeeData && employeeData.residenceProofMedia &&
                                <div>
                                    <a href={employeeData.residenceProofMedia.path} target="_blank" rel="noreferrer">{t('Proof of address')}</a>
                                    <br />
                                    <br />
                                </div>

                            }
                            <MyDropzone name="securityCardMedia" label={t("Vital card")} setFieldValue={setFieldValue} />
                            {employeeData && employeeData.securityCardMedia &&
                                <div>
                                    <a href={employeeData.securityCardMedia.path} target="_blank" rel="noreferrer">{t('Vital Card')}</a>
                                    <br />
                                    <br />
                                </div>
                            }
                            <MyDropzone name="workContractMedia" label={t("Employment contract")} setFieldValue={setFieldValue} />
                            {employeeData && employeeData.workContractMedia &&
                                <div>
                                    <a href={employeeData.workContractMedia.path} target="_blank" rel="noreferrer">{t('Employee Contract')}</a>
                                    <br />
                                    <br />
                                </div>
                            }
                            <MyDropzone name="carDocumentMedia" label={t("Car Document")} setFieldValue={setFieldValue} />
                            {employeeData && employeeData.carDocumentMedia &&
                                <div>
                                    <a href={employeeData.carDocumentMedia.path} target="_blank" rel="noreferrer">{t('Car Document')}</a>
                                    <br />
                                    <br />
                                </div>
                            }
                            <legend><span>{t('User Account')}</span></legend>
                            {roles && <MySelectField
                                placeholder={t("Select a role")}
                                name="roleId"
                                options={
                                    roles.data.content.map(o => {
                                        return { label: o.role, value: o.id }
                                    })
                                } />}
                            {teams && <MuiAutocomplete
                                data={teams}
                                setFieldValue={setFieldValue}
                                placeholder={t('Select a team')}
                                displayKey={'name'}
                                val={selectedTeam ? selectedTeam[0] : null}
                                name="teamId"
                                valueKey="id"
                            />}
                            <MyTextField
                                placeholder={t("Email")}
                                name="login"
                                label={t('Login')} required />
                            {!edit && <><legend><span style={{ fontSize: 18 }}>{t('Password:')}</span><span style={{ fontSize: 'small' }}>&nbsp;{t('Will be generated automatically and emailed to the user')}</span></legend>
                            </>
                            }
                            <div>
                                <button type="submit" disabled={isSubmitting} className="btn btn-sm btn-primary">{t("Submit")}</button>
                            </div>
                            <SuccessMsg successMsg={successMsg} err={err} />
                            <MyProgress isSubmitting={isSubmitting} />
                        </Form>
                    )}
                </Formik>
            </Content>
    )
}

export default EmployeeForm;
