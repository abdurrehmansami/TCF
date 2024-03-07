import { useTranslation } from 'react-i18next'
import { MyTextField, MyProgress } from '../../../components/FormFields'
import { Formik, Form } from "formik";
import { postData } from '../../../services/NetworkService';
import { useState } from 'react'
import * as yup from "yup";
import {
    CCard,
    CCardBody,
    CCardGroup,
    CCol,
    CContainer,
    CRow, CCardHeader
} from '@coreui/react'
import { Link } from 'react-router-dom';

const validationSchema = yup.object({
    login: yup.string().required('Login is required'),
});


function ForgotPassword() {
    const { t } = useTranslation();
    const [error, setError] = useState(null)
    const [msg, setMsg] = useState(null)
    return (
        <div className="c-app c-default-layout flex-row align-items-center">
            <CContainer>
                <CRow className="justify-content-center">
                    <CCol md="4">
                        <CCardGroup>
                            <CCard className="p-4">
                                <CCardHeader>
                                    <h3 className="text-uppercase">{t('Forgot password')}</h3>
                                </CCardHeader>
                                <CCardBody>
                                    <Formik
                                        validationSchema={validationSchema}
                                        initialValues={{ login: '' }}
                                        onSubmit={(values, { setSubmitting, resetForm }) => {
                                            postData('forgotpassword', values)
                                                .then(response => {
                                                    if (response.data.success === "true") {
                                                        setError(false)
                                                        resetForm()
                                                    } else {
                                                        setError(true)
                                                    }
                                                    setMsg(response.data.message)
                                                    setSubmitting(false)
                                                })
                                                .catch(error => {
                                                    setSubmitting(false)
                                                    console.log(error)
                                                })
                                        }}
                                    >
                                        {({ isSubmitting }) => (<>
                                            {error != null && <div className={error ? "alert alert-danger" : "alert alert-success"}>{msg}</div>}
                                            <Form>
                                                <MyTextField placeholder={t("Login")} name="login" label={t("Login")} required />
                                                <Link to='/' className="pr-2">{t('Back to Login')}</Link>
                                                <button type="submit" disabled={isSubmitting} className="btn btn-sm btn-primary">{t('Submit')}</button>
                                                <MyProgress isSubmitting={isSubmitting} />
                                            </Form></>
                                        )}
                                    </Formik>
                                </CCardBody>
                            </CCard>
                        </CCardGroup>
                    </CCol>
                </CRow>
            </CContainer>
        </div>
    )
}

export default ForgotPassword
