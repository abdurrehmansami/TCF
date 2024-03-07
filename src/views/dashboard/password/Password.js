import { useTranslation } from 'react-i18next'
import { MyTextField, MyProgress } from '../../../components/FormFields'
import { Formik, Form } from "formik";
import Content from '../../../components/Content'
import { postData } from '../../../services/NetworkService';
import { useContext, useState } from 'react'
import { UserContext } from '../../../UserProvider'
import * as yup from "yup";

const validationSchema = yup.object({
    newPassword: yup.string().required('Password is required'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
});


function Password() {
    const { t } = useTranslation();
    const { user, } = useContext(UserContext);
    const [error, setError] = useState(null)
    const [msg, setMsg] = useState(null)
    return (
        <Content title={"Password"} >
            <Formik
                validationSchema={validationSchema}
                initialValues={{ login: user.name, password: '', newPassword: '', confirmPassword: '' }}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                    if (values.newPassword === values.confirmPassword) {
                        postData('changepassword', values)
                            .then(response => {
                                if(response.data.success === "true"){
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
                    }
                }}
            >
                {({ isSubmitting }) => (<>
                    {error != null && <div className={error ? "alert alert-danger" : "alert alert-success"}>{msg}</div> }
                    <Form>
                        <MyTextField placeholder={t("Login")} name="login" label={t("Login")} required />
                        <MyTextField placeholder={t("Current password")} type="password" name="password" label={t("Current password")} required />
                        <MyTextField placeholder={t("New password")} type="password" name="newPassword" label={t("New password")} required />
                        <MyTextField placeholder={t("Confirm password")} type="password" name="confirmPassword" label={t("Confirm password")} required />
                        <div>
                            <button type="submit" disabled={isSubmitting} className="btn btn-sm btn-primary">{t('Submit')}</button>
                        </div>
                        <MyProgress isSubmitting={isSubmitting} />
                    </Form></>
                )}
            </Formik>
        </Content>
    )
}

export default Password
