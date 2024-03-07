import { useTranslation } from 'react-i18next'
import { MyTextField, MyDateField, MuiAutocomplete, MyTimeField, MyTextFieldQ, MuiAutocompleteSC } from '../../../components/FormFields'
import { TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useState,} from 'react';
import '../../../scss/style.scss';
import { CCard, CCardHeader, CCardText, CCol, CContainer, CRow } from '@coreui/react';
import { getData, putData } from '../../../services/NetworkService';
import toast from 'react-hot-toast'
import { Modal } from 'antd';

const AdjustFields = ({ setFieldValue, values, setValues, productsData, isSubmitting, stockCountDetail,autoCompleteValue,setAutoCompleteValue }) => {
    const { t } = useTranslation();
    const [enableProducts, setEnableProducts] = useState(true);
    const [islotNumber,setIsLotNumber] = useState(false);
    const [lotNumbersOfSelectedProduct,setLotNumbersOfSelectedProduct] = useState(null);
    const [locations,setLocations] = useState(null);
    const [isLocation,setIsLocation] = useState(false);
    const [lotLocList,setLotLocList] = useState(null);
    const handleProductBalance = (value) => {
        setAutoCompleteValue(value);
        setFieldValue('initialValues.lotNumber', {...values.initialValues,lotNumber:''});
        setIsLotNumber(false);
        setLocations(null);
        setIsLocation(false);

        if (value == null) return;
        getData('prestashop/adjustment/product/' + value.id + '?date=' + values.initialValues.selectedDate)
          .then(response => {
            values.initialValues.balance = response?.data.data.balance;
            values.initialValues.name = value.name;
            values.initialValues.id = value.id;
            values.initialValues.prestashopProductId = value.prestashopProductId;
            setValues(values);
            const list = response?.data?.data?.productLotLocationMapList.map(list => ({id:list.location.id,name:list.location.name,lotNumber:list.lotNumber}))
            setLotLocList(list);
            
            const uniqueLocations = Array.from(new Set(response?.data?.data?.productLotLocationMapList
                ?.filter(item => item.location && item.location.name !== null && item.location.id !== null)
                ?.map(item => JSON.stringify({ id: item.location.id, name: item.location.name }))))
                ?.map(json => JSON.parse(json));
          
            setLocations(uniqueLocations ?? []);
            setIsLocation(uniqueLocations.length > 0);
            
          })
          .catch(error => {
            console.log(error);
          });
    };
      
    const handleLotNumberInputChange = (_, newInputValue) => {
        if (!newInputValue) {
          setFieldValue('initialValues.lotNumber', {...values.initialValues,lotNumber:''});
        }
    };
    
    const handleLocationsInputChange = (_, newInputValue) => {
        const selectedLocation = locations?.find(location => location.name === newInputValue);
    
        setFieldValue('initialValues.location', selectedLocation || { id: '', name: '' });
        setFieldValue('initialValues.lotNumber', '');
    
        if (selectedLocation) {
            const lotNumbersForLocation = lotLocList
                ?.filter(item => item.id === selectedLocation.id)
                ?.map(item => item.lotNumber);
    
            setLotNumbersOfSelectedProduct(lotNumbersForLocation || []);
            setIsLotNumber(Boolean(lotNumbersForLocation?.length));
        } else {
            setLotNumbersOfSelectedProduct(null);
            setIsLotNumber(false);
        }
    };
    

    const close = () => {
        Modal.confirm({
            title: 'Confirmation',
            content: (
              <div>
                <p>{t(`Are you sure you want continue?`)}</p>
              </div>
            ),
            onOk() {
                toast.promise(
                    putData(`stock-counts/${stockCountDetail.id}`, {id: stockCountDetail.id, status: "CLOSED"}),
                    {
                      loading: 'Loading',
                      success: (resp) => {setEnableProducts(false); return "Stock Count Closed"},
                      error: (e) => "Error closing stock count. Contact technical support."
                    },
                    {
                      position: 'bottom-center'
                    }
                )
            },
          });
    }
    
    return (
        <>
            {enableProducts && (
                <CCard style={{ padding: '16px' }}>
                    <CCardHeader style={{ paddingLeft: '0px', borderColor: 'black', fontSize: '20px' }}>Stock Count</CCardHeader>
                    <div className='col-sm-12' style={{ display: 'flex', paddingLeft: '0px', flexWrap: 'wrap' }}>
                        <div className='col-sm-2' style={{ paddingLeft: '0px', marginTop: '21px', display: 'none' }}>
                            <MyDateField
                                name={`initialValues.selectedDate`}
                                label={t("Date")}
                                setFieldValue={setFieldValue}
                                onBlur={() => handleProductBalance(values.initialValues.id)}
                            />
                        </div>
                        <div className='col-sm-4' style={{ paddingLeft: '0px' }}>
                            <MuiAutocompleteSC
                                data={productsData.data.content}
                                setFieldValue={setFieldValue}
                                placeholder={t('Select Products')}
                                displayKey={'name'}
                                name={`initialValues.product`}
                                setAutoCompleteValue={setAutoCompleteValue}
                                val={autoCompleteValue}
                                parentCallbackOpt={(value) => handleProductBalance(value)}
                                required
                            />
                        </div>
                        {isLocation &&
                            <div className='col-sm-3' style={{ paddingLeft: '0px', marginTop: '19px',width:'100px' }}>
                                    <Autocomplete
                                        options={locations ?? []}
                                        autoHighlight
                                        size='small'
                                        clearOnEscape
                                        getOptionLabel={(option) => option.name}
                                        name={`initialValues.location`}
                                        value={values.initialValues.location}
                                        onChange={(e, newValue) => setFieldValue(`initialValues.location`, newValue)}
                                        onInputChange={handleLocationsInputChange}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={t('Location')}
                                                variant="outlined"
                                                required
                                                fullWidth
                                            />
                                        )}
                                    />
                            </div> 
                        }
                        {islotNumber &&
                            <div className='col-sm-2' style={{ paddingLeft: '0px', marginTop: '19px' }}>
                                <Autocomplete
                                    options={lotNumbersOfSelectedProduct ?? []}
                                    autoHighlight
                                    size='small'
                                    clearOnEscape
                                    getOptionLabel={(option) => option}
                                    name={`initialValues.lotNumber`}
                                    value={values.initialValues.lotNumber}
                                    onChange={(e, newValue) => setFieldValue(`initialValues.lotNumber`, newValue)}
                                    onInputChange={handleLotNumberInputChange}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={t('Lot Number')}
                                            variant="outlined"
                                            required
                                            fullWidth
                                        />
                                    )}
                                />
                            </div>
                        }
                        <div className='col-sm-2' style={{ paddingLeft: '0px', marginTop: '19px' }}>
                            <MyTextFieldQ name={`initialValues.quantity`} label={t('Quantity')} type='number' required />
                        </div>
                        <div className="ms-auto mt-3" style={{marginLeft: 'auto' }}>
                            <button
                                disabled={isSubmitting}
                                className="btn btn-sm btn-primary"
                                style={{ width: '120px' }}
                                onClick={() => { setFieldValue("action", "confirm"); }}
                            >
                                {t('Add Count')}
                            </button>&nbsp;
                            <button type="button" disabled={isSubmitting} className="btn btn-sm btn-danger" style={{ width: '120px' }} onClick={() => { close() }}>{t('Close Count')}</button>&nbsp;
                        </div>
                    </div>
                </CCard>
            )}
    
        </>
    ); 
}

export default AdjustFields;
