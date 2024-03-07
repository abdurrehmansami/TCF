import { useState } from 'react';
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

export const MyTextField = ({ placeholder, label, type, autoFillOff, required, multiple, rows, onBlur, inputProps, ...props}) => {
    const [field, meta] = useField(props);
    const errorText = meta.error && meta.touched ? meta.error : "";
    return (
        <div className="form-group">
            <TextField
                size="small"
                fullWidth
                multiline={multiple || false}
                rows={rows || 0}
                variant="outlined"
                type={type}
                inputProps={inputProps}
                label={label}
                placeholder={placeholder}
                autoComplete={autoFillOff && "new-password"}
                required={required}
                helperText={errorText}
                error={!!errorText}
                {...field}
                onBlur={onBlur}
            />
        </div>
    );
}

export const MyDateField = ({ name, label, required, setFieldValue, disabled, onBlur }) => {
    const { values } = useFormikContext()
    return (
        <div className="form-group">
            <TextField name={name}
                size="small"
                fullWidth
                disabled={disabled}
                type="date"
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

export const MyTimeField = ({ name, label, required, setFieldValue, disabled=false, onBlur }) => {
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
                defaultValue={values[name] ? Moment.utc(values[name]).format('HH:mm:ss') : null}
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
                                  label, multiple, required, itemDisplayOpts, val, parentCallbackOpt }) {
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
                    getOptionLabel={(option) => option[displayKey]}
                    defaultValue={val ? val : null}
                    renderOption={(option) =>
                        <>    {itemDisplayOpts && itemDisplayOpts.showImage ?
                            <span key={option.id} className="c-avatar">
                                <CImg
                                    src={option[itemDisplayOpts.imgKey] && option[itemDisplayOpts.imgKey].path ? option[itemDisplayOpts.imgKey].path : 'avatars/8.jpg'}
                                    className="c-avatar-img"
                                />
                            </span> : <></>
                        }
                            <span style={{ marginLeft: 10 }}>{option[displayKey]}</span>
                        </>
                    }
                    renderInput={(params) => <TextField className={classes.root} {...params} inputProps={{ ...params.inputProps, autoComplete: 'new-password' }} label={placeholder} variant="outlined" required={required} />}
                    onChange={(_, value) => {
                        setFieldValue(name, value ? valueKey ? value[valueKey] : value : value)
                        setSelectedItems(value ? valueKey ? value[valueKey] : value : value)
                        if (parentCallbackOpt && value) {
                            parentCallbackOpt(value ? valueKey ? value[valueKey] : value : value)
                        }
                    }}
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

export const MySelectField = ({ placeholder, label, options, required, ...props }) => {
    const [field] = useField(props);
    return (
        <div className="form-group">
            <FormControl variant="outlined" size="small" fullWidth required={required} >
                {label && <label htmlFor={props.name} className="form-label">{label}</label>}
                <InputLabel htmlFor={props.name}>{placeholder}</InputLabel>
                <Select {...field}>
                    {options.map(o => {
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

export const MyRadioGroup = ({ options, label, ...props }) => {
    const [field] = useField(props);
    return (
        <FormControl component="fieldset">
            <FormLabel component="legend">{label}</FormLabel>
            <RadioGroup aria-label={props.name} row {...field}>
                {options.map(o => (
                   <FormControlLabel key={o.value} value={o.value} control={<Radio />} label={o.label} />
                ))}
            </RadioGroup>
        </FormControl>
    );
}
