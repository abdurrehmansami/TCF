import { useEffect, useState } from 'react'
import useFetch from '../../../hooks/useFetch'
import { MyTextField } from '../../../components/FormFields'
import { Formik, Form } from "formik";
import Content from '../../../components/Content'
import Loading from 'src/components/Loading';
import * as yup from "yup";
import { SuccessMsg } from './../order/LocationFields';
import { useTranslation } from 'react-i18next'
import { postData } from '../../../services/NetworkService';
const validationSchema = yup.object({
    name: yup
        .string()
        .required()
        .max(30),
});

function WarehouseDetail(props) {
    const id = props.data.id
    const { data } = useFetch('locations/' + id)
    const [initialValues, setInitialValues] = useState({ name: '', address: '' })
    const [isLoaded, setLoaded] = useState(false)
    const edit = true;
    const title = "Warehouse Details"
    const [locationFields] = useState([])
    let [successMsg, setSuccessMsg] = useState('')
    const [err, setErr] = useState(false)
    const { t } = useTranslation();
    const [locationMap] = useState({})
    const reloadCallback  = props.reloadCallback;
    function addLocationField(values, setValues) {
        locationFields.push({ 'name': 'location_' + (locationFields.length + 1), 'label': 'Location ' + (locationFields.length + 1) })
        setValues(values)
    }
    const setErrorMsg = () => {
        setErr(true)
        setSuccessMsg(t("Some error occured, Sorry for inconvenience, Please try again later"))
        setTimeout(() => { setSuccessMsg(''); setErr(false); }, 2500)
    }

    const removeLocation = (index, values, setValues) => {
        locationFields.splice(index, 1)
        Object.keys(values).forEach(key => {
            if (key.startsWith("location_" + (index + 1))) {
                console.log(key)
                delete values[key]
            }
        })
        console.log(locationFields)
        console.log(Object.keys(values))
        setValues(values)
    }

    const handleSubmit = (values, setSubmitting) => {
        let locations = [];
        Object.keys(values).forEach(key => {
            console.log(key)
            if (key.startsWith('location_')) {
                let loc = key.split('_')[2] ? locationMap[key.split('_')[2]] : {}
                loc.name = values[key]
                locations.push(loc)
            }
        });
        values.locations = locations
        postData('warehouses', values)
            .then(response => {
                if (response.data) {
                    console.log(response)
                    setSubmitting(false)
                    setSuccessMsg(t("Your form is submitted successfully"))
                    // setTimeout(() => { setSuccessMsg(''); }, 2500)
                    reloadCallback(null,null,props.sort)
                    setTimeout(()=>props.onClose(),1000)
                }
            })
            .catch(error => {
                setErrorMsg()
                setSubmitting(false)
            })
    }

    useEffect(() => {
        if (data !== null) {
            let locationData = data.data
            locationData.locations.forEach((location, index) => {
                locationMap[location.id] = location
                if (location.name) {
                    locationFields.push({ 'name': 'location_' + (locationFields.length + 1), 'label': 'Location ' + (locationFields.length + 1), 'value': location?.name })
                    locationData[locationFields[index]?.name] = location?.name
                }
            })
            setInitialValues(locationData)
            setLoaded(true)
        }
    }, [data, locationFields])

    return (
        edit && !isLoaded ? <Loading /> :
            <Content title={title} >
                <Formik
                    initialValues={initialValues}
                    enableReinitialize={true}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        handleSubmit(values, setSubmitting);
                    }}
                >
                    {({ values, setValues, isSubmitting }) => (
                        <Form>
                            <MyTextField placeholder='Name' name="name" label='Name' disabled />
                            <MyTextField placeholder='Address' name="address" label="Address" disabled />
                            {locationFields.map((location, index) => {
                                return (
                                    <div className="row">
                                        <div className="col-sm-11">
                                            <MyTextField placeholder={"Location"} name={location.name} label={location.label} val={location.value ? location.value : ""} disabled={location.value ? true : false} />
                                        </div>
                                        <div className="col-sm-1">
                                            {index + 1 === locationFields.length ? <>
                                                <button type="button" className="btn btn-sm btn-danger" disabled={locationFields.length === 1 || (location.value ? true : false)} onClick={() => removeLocation(index, values, setValues)} style={{ borderRadius: 40, fontSize: 13, width: 30, marginTop: 4 }}>-</button>
                                                &nbsp;
                                                <button type="button" className="btn btn-sm btn-primary" onClick={() => addLocationField(values, setValues)} style={{ borderRadius: 40, fontSize: 13, width: 30, marginTop: 4 }}>+</button>
                                            </>
                                                : null}
                                        </div>
                                    </div>
                                )
                            })}
                            <div>
                                <button type="submit" disabled={isSubmitting} className="btn btn-sm btn-primary">{t('Submit')}</button>
                            </div>
                            <SuccessMsg successMsg={successMsg} err={err} />
                        </Form>
                    )}
                </Formik>
            </Content>
    )
}

export default WarehouseDetail;