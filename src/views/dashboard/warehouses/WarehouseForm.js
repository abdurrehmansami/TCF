import { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { useTranslation } from 'react-i18next'
import { postData } from '../../../services/NetworkService';
import { MyTextField, MyProgress } from '../../../components/FormFields'
import { Formik, Form } from "formik";
import Content from '../../../components/Content'
import Loading from 'src/components/Loading';
import * as yup from "yup";
import { SuccessMsg } from './../order/LocationFields';
import toast from 'react-hot-toast';
const validationSchema = yup.object({
    name: yup
        .string()
        .required()
        .max(30),
});

function WarehouseForm(props) {
    const { t } = useTranslation();
    const history = useHistory();
    const [initialValues, setInitialValues] = useState({ name: '', address: '' })
    const [isLoaded, setLoaded] = useState(false)
    const locationData = props?.data
    const edit = props.data ? true : false
    const title = `${edit ? t('Edit') : t('Add')} ${t('Site')}`
    const [locationMap] = useState({})
    const [locationFields] = useState([])
    let [successMsg, setSuccessMsg] = useState('')
    const [err, setErr] = useState(false)
    const reloadCallback  = props.reloadCallback;
    const sort = props.sort;
    const setErrorMsg = (msg = "Some error occured, Sorry for inconvenience, Please try again later") => {
        setErr(true)
        setSuccessMsg(t(msg))
        setTimeout(() => { setSuccessMsg(''); setErr(false); }, 2500)
    }

    useEffect(() => {
        if (edit && locationData) {
            let count = 0;
            locationData?.locations?.forEach((location, index) => {
                locationMap[location.id] = location
                if (location.name) {
                    count += 1;
                    locationFields.push({ 'name': 'location_' + (locationFields.length + 1) + '_' + location.id, 'label': 'Location ' + (locationFields.length + 1), 'value': location.name })
                    locationData[locationFields[index].name] = location.name
                }
            })
            if (count === 0) {
                locationFields.push({ 'name': 'location_' + 0, 'label': 'Location 1' })
            }
            setInitialValues(locationData)
            setLoaded(true)
        } else {
            locationFields.push({ 'name': 'location_' + 0, 'label': 'Location 1' })
        }
    }, [edit, locationData, locationFields, locationMap])

    function addLocationField(values, setValues) {
        locationFields.push({ 'name': 'location_' + (locationFields.length + 1), 'label': 'Location ' + (locationFields.length + 1) })
        setValues(values)
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
        try {
            // let locations = [];
            // Object.keys(values).forEach(key => {
            //     console.log(key)
            //     if (key.startsWith('location_')) {
            //         let loc = key.split('_')[2] ? locationMap[key.split('_')[2]] : {}
            //         loc.name = values[key]
            //         locations.push(loc)
            //     }
            // });
            // values.locations = locations
            postData('locations', values)
                .then(async response => {
                    setSubmitting(false)
                    if(edit)
                        toast.success(t("Site is edited successfully"))
                    else
                        toast.success(t("New Site created successfully"))
                    reloadCallback(null,null,sort)
                    setTimeout(()=>props.onClose(),1500)
                })
                .catch(error => {
                    toast.error("Some error occurred. Sorry for the inconvenience. Please try again later.");
                    setSubmitting(false)
                })
        }
        catch (e) {
            setErrorMsg("err")
            setSubmitting(false)
            console.log(e)
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
                        handleSubmit(values, setSubmitting);
                    }}
                >
                    {({ values, setValues, isSubmitting }) => (
                        <Form>
                            <MyTextField placeholder='Name' name="name" label='Name' />
                            <MyTextField placeholder='Address' name="address" label="Address" />
                            {/* {locationFields.map((location, index) => {
                                return (
                                    <div className="row">
                                        <div className="col-sm-11">
                                            <MyTextField placeholder={"Location"} name={location.name} label={"Location " + (index + 1)} val={location.value ? location.value : ""} />
                                        </div>
                                        <div className="col-sm-1">
                                            {index + 1 === locationFields.length ? <>
                                                <button type="button" className="btn btn-sm btn-danger" disabled={locationFields.length === 1} onClick={() => removeLocation(index, values, setValues)} style={{ borderRadius: 40, fontSize: 13, width: 30, marginTop: 4 }}>-</button>
                                                &nbsp;
                                                <button type="button" className="btn btn-sm btn-primary" onClick={() => addLocationField(values, setValues)} style={{ borderRadius: 40, fontSize: 13, width: 30, marginTop: 4 }}>+</button>
                                            </>
                                                : null}
                                        </div>
                                    </div>
                                )
                            })} */}
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

export default WarehouseForm;