import { useState,useEffect } from 'react';
import { TextField, Select, MenuItem, InputLabel, LinearProgress, Radio, RadioGroup, FormControl, FormLabel, FormControlLabel } from "@material-ui/core";
import { useField, useFormikContext } from "formik";
import { makeStyles } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { CImg } from '@coreui/react'
import { parseDate } from "src/utils/utils";
import Moment from 'moment'

const useStyles = makeStyles({
    root: {
        "& .MuiFormLabel-root": {
            fontSize: "13px"
        }
    }
});

export const MyTextField = ({ placeholder, label, type, val, autoFillOff, required, multiple,inputLabelProps, rows, onBlur,onChange, disabled = false, inputProps = { min: 0, step: ".0001" }, ...props }) => {
    const [field, meta] = useField(props);
    const errorText = meta.error && meta.touched ? meta.error : "";
    return (
        <div className="form-group">
            <TextField
                size="small"
                fullWidth
                multiline={multiple || false}
                minRows={rows || 0}
                id={props.name}
                variant="outlined"
                type={type}
                disabled={disabled}
                disableAutoFocus
                label={label}
                placeholder={placeholder}
                autoComplete={autoFillOff && "new-password"}
                required={required}
                helperText={errorText}
                error={!!errorText}
                InputLabelProps={inputLabelProps}
                InputProps={inputProps}
                {...field}
                onBlur={onBlur}
                onChange={onChange ? onChange : field.onChange}
                defaultValue={val ? val : ""}
            />
        </div>
    );
}
export const MyTextFieldQ = ({ placeholder, label, type, val, autoFillOff, required, multiple,inputLabelProps, rows, onBlur,onChange, disabled = false, inputProps = { min: 0, step: ".0001" }, ...props }) => {
    const [field, meta] = useField(props);
    
    const handleInputChange = (event) => {
        let value = event.target.value;
        const numericValue = parseFloat(value);

        if (!isNaN(numericValue) && numericValue < 0) {
        value = '0';
        }

        if (onChange) {
        event.target.value = value;
        onChange(event);
        } else {
        field.onChange(event);
        }
    };
    const handleBlur = (event) => {
        let value = event.target.value;
        const numericValue = parseFloat(value);
    
        if (!isNaN(numericValue) && numericValue < 0) {
          event.target.value = '0';
          field.onChange(event);
        }
    
        if (onBlur) {
          onBlur(event);
        }
    };
    const errorText = meta.error && meta.touched ? meta.error : "";
    return (
        <div className="form-group">
            <TextField
                size="small"
                fullWidth
                multiline={multiple || false}
                minRows={rows || 0}
                id={props.name}
                variant="outlined"
                type={type}
                disabled={disabled}
                disableAutoFocus
                label={label}
                placeholder={placeholder}
                autoComplete={autoFillOff && "new-password"}
                required={required}
                helperText={errorText}
                error={!!errorText}
                InputLabelProps={inputLabelProps}
                InputProps={inputProps}
                inputProps={{ min: 0 }}
                {...field}
                onBlur={onBlur ? onBlur : handleBlur}
                onChange={onChange ? onChange : handleInputChange}
                defaultValue={val ? val : ""}
            />
        </div>
    );
}
export const MyDateField = ({ name, label, required, setFieldValue, val, disabled = false, onBlur, id }) => {
    const { values } = useFormikContext()
    return (
        <div className="form-group">
            <TextField name={name}
                size="small"
                fullWidth
                disabled={disabled}
                type="date"
                id={id}
                variant="outlined"
                required={required}
                label={label}
                defaultValue={val ? Moment.utc(val).format('YYYY-MM-DD') : values[name] ? Moment.utc(values[name]).format('YYYY-MM-DD') : null}
                InputLabelProps={{ shrink: true }}
                onChange={e => {
                    setFieldValue(name, e.target.valueAsNumber)
                }}
                onBlur={onBlur}
            />
        </div>
    );
}


export const MyDateTimeField = ({ name, label, required, setFieldValue, disabled = false, onBlur }) => {
    const { values } = useFormikContext()
    return (
        <div className="form-group">
            <TextField name={name}
                size="small"
                fullWidth
                disabled={disabled}
                type="datetime-local"
                variant="outlined"
                required={required}
                label={label}
                defaultValue={parseDate(values[name])}
                InputLabelProps={{ shrink: true }}
                onChange={e => setFieldValue(name, e.target.valueAsNumber)}
                onBlur={onBlur}
            />
        </div>
    );
}


const thumbsContainer = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: '16px 0 16px 0'
};

const thumb = {
    display: 'inline-flex',
    borderRadius: 2,
    border: '1px solid #eaeaea',
    marginBottom: 8,
    marginRight: 8,
    width: 100,
    height: 100,
    padding: 4,
    boxSizing: 'border-box'
};

const thumbInner = {
    display: 'flex',
    minWidth: 0,
    overflow: 'hidden'
};

const img = {
    display: 'block',
    width: 'auto',
    height: '100%'
};
export function MuiAutocomplete({ name, valueKey, data, displayKey, placeholder, setFieldValue,
    label, multiple, required, itemDisplayOpts, onChange, val, parentCallbackOpt, disabled = false, onBlur }) {
    const classes = useStyles();
    const [selectedItems, setSelectedItems] = useState(val);
    return (
        <div>
            <div className="form-group">
                <label htmlFor={name} className="form-label">{label}</label>
                <Autocomplete
                    autoHighlight
                    size={'small'}
                    name={name}
                    multiple={multiple}
                    options={data}
                    // disabled={disabled}
                    getOptionLabel={(option) => option[displayKey]}
                    defaultValue={val ? val : null}
                    renderOption={(option) =>
                        <>    {itemDisplayOpts && itemDisplayOpts.showImage ?
                            <span key={option.id} className="c-avatar">
                                <CImg
                                    src={option[itemDisplayOpts.imgKey] && option[itemDisplayOpts.imgKey].path ? option[itemDisplayOpts.imgKey].path : '/avatars/8.jpg'}
                                    className="c-avatar-img"
                                />
                            </span> : <></>
                        }
                            <span style={{ marginLeft: 10 }}>{option[displayKey]}</span>
                        </>
                    }
                    renderInput={(params) => <TextField className={classes.root} {...params} inputProps={{ ...params.inputProps, autoComplete: 'new-password' }} label={placeholder} variant="outlined" required={required} />}
                    onChange={ ( _, value ) =>
                    {
                        if ( onChange )
                        {
                            onChange( _,value );
                        }
                        else
                        {
                            setFieldValue(name, value ? valueKey ? value[valueKey] : value : value)
                            setSelectedItems(value ? valueKey ? value[valueKey] : value : value)
                            if (parentCallbackOpt && value) {
                                parentCallbackOpt(value ? valueKey ? value[valueKey] : value : value)
                            }
                        }
                    }}
                    onBlur={onBlur}
                />
            </div>
            <aside style={thumbsContainer}>
                {itemDisplayOpts &&
                    itemDisplayOpts.showItems && selectedItems ?
                    selectedItems.map(o => {
                        return (
                            <div key={o.id} style={{ width: '10%' }}>
                                {itemDisplayOpts.showImage ?
                                    <div style={thumb} key={o[displayKey]}>
                                        <div style={thumbInner}>
                                            <img
                                                src={o[itemDisplayOpts.imgKey] && o[itemDisplayOpts.imgKey].path ? o[itemDisplayOpts.imgKey].path : 'avatars/8.jpg'}
                                                style={img}
                                            />
                                        </div>
                                    </div>
                                    : <></>}
                                <div style={{ marginRight: 5 }}>{o[displayKey]}</div>
                            </div>
                        );
                    })
                    : <></>
                }
            </aside>
        </div>
    );
}

export function MuiAutocompleteField({ name, valueKey, data, displayKey, placeholder, setFieldValue,
    label, multiple, required, itemDisplayOpts, val, parentCallbackOpt, disabled = false, onBlur, setSelectedProductName}) {
    const classes = useStyles();
    const [selectedItems, setSelectedItems] = useState(val);

    return (
        <div>
            <div className="form-group">
                <label htmlFor={name} className="form-label">{label}</label>
                <Autocomplete
                    autoHighlight
                    size={'small'}
                    name={name}
                    multiple={multiple}
                    options={data}
                    disabled={disabled}
                    getOptionLabel={(option) => option[displayKey]}
                    defaultValue={val ? val : null}
                    renderOption={(option) =>
                        <>    {itemDisplayOpts && itemDisplayOpts.showImage ?
                            <span key={option.id} className="c-avatar">
                                <CImg
                                    src={option[itemDisplayOpts.imgKey] && option[itemDisplayOpts.imgKey].path ? option[itemDisplayOpts.imgKey].path : '/avatars/8.jpg'}
                                    className="c-avatar-img"
                                />
                            </span> : <></>
                        }
                            <span style={{ marginLeft: 10 }}>{option[displayKey]}</span>
                        </>
                    }
                    renderInput={(params) => <TextField className={classes.root} {...params} inputProps={{ ...params.inputProps, autoComplete: 'new-password' }} label={placeholder} variant="outlined" required={required} />}                    
                    onChange={(_, value) => {                        
                        if(setSelectedProductName) {                            
                            setSelectedProductName(value)                           
                        }                                                                       
                        setFieldValue(name, value ? valueKey ? value[valueKey] : value : value)
                        setSelectedItems(value ? valueKey ? value[valueKey] : value : value)                        
                        if (parentCallbackOpt && value) {
                            parentCallbackOpt(value ? valueKey ? value[valueKey] : value : value)
                        }
                    }}
                    onBlur={onBlur}
                />
            </div>
            <aside style={thumbsContainer}>
                {itemDisplayOpts &&
                    itemDisplayOpts.showItems && selectedItems ?
                    selectedItems.map(o => {
                        return (
                            <div key={o.id} style={{ width: '10%' }}>
                                {itemDisplayOpts.showImage ?
                                    <div style={thumb} key={o[displayKey]}>
                                        <div style={thumbInner}>
                                            <img
                                                src={o[itemDisplayOpts.imgKey] && o[itemDisplayOpts.imgKey].path ? o[itemDisplayOpts.imgKey].path : 'avatars/8.jpg'}
                                                style={img}
                                            />
                                        </div>
                                    </div>
                                    : <></>}
                                <div style={{ marginRight: 5 }}>{o[displayKey]}</div>
                            </div>
                        );
                    })
                    : <></>
                }
            </aside>
        </div>
    );
}
export function MuiAutocompleteSC({ name, valueKey, data, displayKey, placeholder, setFieldValue,
    label, multiple, required, itemDisplayOpts, onChange, val, parentCallbackOpt,setAutoCompleteValue, disabled = false, onBlur }) {
    const classes = useStyles();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedItems, setSelectedItems] = useState(val);
    useEffect(() => {
        setSelectedProduct(val);
    }, [val]);
    return (
        <div>
            <div className="form-group">
                <label htmlFor={name} className="form-label">{label}</label>
                <Autocomplete
                    autoHighlight
                    size={'small'}
                    name={name}
                    multiple={multiple}
                    options={data}
                    // disabled={disabled}
                    getOptionLabel={(option) => option[displayKey]}
                    defaultValue={val ? val : null}
                    renderOption={(option) =>
                        <>    {itemDisplayOpts && itemDisplayOpts.showImage ?
                            <span key={option.id} className="c-avatar">
                                <CImg
                                    src={option[itemDisplayOpts.imgKey] && option[itemDisplayOpts.imgKey].path ? option[itemDisplayOpts.imgKey].path : '/avatars/8.jpg'}
                                    className="c-avatar-img"
                                />
                            </span> : <></>
                        }
                            <span style={{ marginLeft: 10 }}>{option[displayKey]}</span>
                        </>
                    }
                    renderInput={(params) => <TextField className={classes.root} {...params} inputProps={{ ...params.inputProps, autoComplete: 'new-password' }} label={placeholder} variant="outlined" required={required} />}
                    value={selectedProduct}
                    onChange={ ( _, value,reason ) =>
                    {
                        if(reason === 'clear'){
                            parentCallbackOpt();
                        }
                        setSelectedProduct(value);
                        if ( onChange )
                        {
                            onChange( _,value );
                        }
                        else
                        {
                            setFieldValue(name, value ? valueKey ? value[valueKey] : value : value)
                            setSelectedItems(value ? valueKey ? value[valueKey] : value : value)
                            if (parentCallbackOpt && value) {
                                parentCallbackOpt(value ? valueKey ? value[valueKey] : value : value)
                            }
                        }
                    }}
                    onBlur={onBlur}
                />
            </div>
            <aside style={thumbsContainer}>
                {itemDisplayOpts &&
                    itemDisplayOpts.showItems && selectedItems ?
                    selectedItems.map(o => {
                        return (
                            <div key={o.id} style={{ width: '10%' }}>
                                {itemDisplayOpts.showImage ?
                                    <div style={thumb} key={o[displayKey]}>
                                        <div style={thumbInner}>
                                            <img
                                                src={o[itemDisplayOpts.imgKey] && o[itemDisplayOpts.imgKey].path ? o[itemDisplayOpts.imgKey].path : 'avatars/8.jpg'}
                                                style={img}
                                            />
                                        </div>
                                    </div>
                                    : <></>}
                                <div style={{ marginRight: 5 }}>{o[displayKey]}</div>
                            </div>
                        );
                    })
                    : <></>
                }
            </aside>
        </div>
    );
}

export const MySelectField = ({ placeholder, label, options, required, disabled = false, ...props }) => {
    const [field] = useField(props);
    return (
        <div className="form-group">
            <FormControl variant="outlined" size="small" fullWidth required={required} >
                {label && <label htmlFor={props.name} className="form-label">{label}</label>}
                <InputLabel htmlFor={props.name}>{placeholder}</InputLabel>
                <Select {...field} disabled={disabled}>
                    {options.filter(o => !o.disabled).map(o => {
                        return <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    })}
                </Select>
            </FormControl>
        </div>
    );
}

export const MyProgress = ({ isSubmitting }) => {
    return (
        <div>
            <br />
            {isSubmitting && <LinearProgress />}
        </div>
    );
}

export const MyRadioGroup = ({ options, label, disabled = false, ...props }) => {
    const [field] = useField(props);
    return (
        <FormControl component="fieldset">
            <FormLabel component="legend">{label}</FormLabel>
            <RadioGroup aria-label={props.name} row {...field} disabled={disabled}>
                {options.map(o => (
                    <FormControlLabel key={o.value} value={o.value} control={<Radio />} label={o.label} />
                ))}
            </RadioGroup>
        </FormControl>
    );
}


export const MyTimeField = ({ name, label, val, required, setFieldValue, disabled = false, onBlur }) => {
    Moment.locale('fr')
    const { values } = useFormikContext()
    return (
        <div className="form-group">
            <TextField name={name}
                size="small"
                fullWidth
                disabled={disabled}
                type="time"
                variant="outlined"
                min={0}
                required={required}
                label={label}
                defaultValue={val ? Moment.utc(val).format('HH:mm:ss') : values[name] ? Moment.utc(values[name]).format('HH:mm:ss') : null}
                InputLabelProps={{ shrink: true }}
                onChange={e => {
                    setFieldValue(name, e.target.valueAsNumber)
                }
                }
                onBlur={onBlur}
            />
        </div>
    );
}
