import React, { useState } from "react";
import { LinearProgress } from "@material-ui/core";
import { useField } from "formik";
import { makeStyles } from "@material-ui/core/styles";
import {
  AutoComplete,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  TimePicker,
} from "antd";
import DatePicker from "./DatePicker";

export const MyTextField = ({
  placeholder,
  label,
  type,
  val,
  autoFillOff,
  required,
  multiple,
  inputLabelProps,
  rows,
  onBlur,
  disabled = false,
  inputProps = { min: 0, step: ".0001" },
  onChange,
  ...props
}) => {
  return (
    <Form.Item
      {...props}
      label={label}
      rules={[
        {
          required,
        },
      ]}
    >
      {type === "number" ? (
        <InputNumber
          disabled={disabled}
          placeholder={placeholder}
          style={{ width: "100%" }}
          onChange={onChange}
        />
      ) : (
        <Input
          multiline={multiple || false}
          rows={rows || 0}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          onChange={onChange}
        />
      )}
    </Form.Item>
  );
};

export const MyDateField = ({
  required,
  errorText,
  placeholder,
  disabled = false,
  disabledDate,
  onChange,
  date,
  ...field
}) => {
  return (
    <Form.Item
      {...field}
      rules={[
        {
          required,
          message: errorText,
        },
      ]}
    >
      <DatePicker
        format={"DD/MM/YYYY"}
        onChange={onChange}
        disabledDate={disabledDate}
        style={{ width: "100%" }}
        disabled={disabled}
        placeholder={placeholder}
        defaultValue={date}
      />
    </Form.Item>
  );
};

export const MyDateTimeField = ({
  required,
  errorText,
  disabled = false,
  placeholder,
  onChange,
  ...field
}) => {
  return (
    <Form.Item
      {...field}
      rules={[
        {
          required,
          message: errorText,
        },
      ]}
    >
      <DatePicker
        format={"DD/MM/YYYY hh:mm A"}
        onChange={onChange}
        style={{ width: "100%" }}
        placeholder={placeholder}
        disabled={disabled}
      />
    </Form.Item>
  );
};
export function MuiAutocomplete({
  name,
  data,
  displayKey,
  label,
  onSelect,
  onClear,
  disabled,
  required,
  onBlur
}) {
  const[option,setoption]=useState(data);
  // console.log("data ",data)
  const handleSearch = (value) => {
    const suggestions = data.filter((option) => option.name.toLowerCase().includes(value.toLowerCase()));
    setoption(suggestions);    
  };
  // console.log(option,name,displayKey,label,data)
  return (
    <Form.Item 
      name={name} 
      label={label} 
      rules={[
        {
          required: required ? true : false,
          message: 'Please select a value',
        },
      ]}
    >
      <AutoComplete
        disabled={disabled}
        allowClear
        onSelect={(val, option) => onSelect(option)}
        onClear={onClear}
        options={option.map((d) => ({ ...d, value: d[displayKey], id:d.id,key:d.id }))}
        onSearch={handleSearch}      
        onBlur={onBlur}   
        optionFilterProp="children"   
      />
    </Form.Item>
  );
}

export const AntdAutocomplete = ({
  name,
  valueKey,
  data,
  displayKey,
  placeholder,
  setFieldValue,
  label,
  multiple,
  required,
  itemDisplayOpts,
  onChange,
  val,
  parentCallbackOpt,
  disabled = false,
  onBlur,
}) => {
  const [selectedItems, setSelectedItems] = useState(val);

  const handleChange = (value, option) => {
    if (onChange) {
      onChange(value, option);
    } else {
      setFieldValue(name, value ? (valueKey ? value[valueKey] : value) : value);
      setSelectedItems(value ? (valueKey ? value[valueKey] : value) : value);
      if (parentCallbackOpt && value) {
        parentCallbackOpt(value ? (valueKey ? value[valueKey] : value) : value);
      }
    }
  };

  return (
    <div style={{marginBottom:20}}>
      <div className="form-group">
        <label htmlFor={name} className="form-label">
          {label}
        </label>
        <Select
          mode={multiple ? 'multiple' : 'default'}
          size="medium"
          name={name}
          disabled={disabled}
          defaultValue={val ? val : undefined}
          placeholder={placeholder}
          onChange={handleChange}
          onBlur={onBlur}
          // style={{ width: '230px' }}
        >
          {data?.map((option) => (
            <Select.Option key={option.id} value={valueKey ? option[valueKey] : option}>
              {itemDisplayOpts && itemDisplayOpts.showImage && (
                <span key={option.id} className="c-avatar">
                  <img
                    src={
                      option[itemDisplayOpts.imgKey] && option[itemDisplayOpts.imgKey].path
                        ? option[itemDisplayOpts.imgKey].path
                        : '/avatars/8.jpg'
                    }
                    className="c-avatar-img"
                    alt="avatar"
                  />
                </span>
              )}
              <span style={{ marginLeft: 10 }}>{option[displayKey]}</span>
            </Select.Option>
          ))}
        </Select>
      </div>
      <aside>
        {itemDisplayOpts &&
          itemDisplayOpts.showItems &&
          selectedItems &&
          selectedItems.map((o) => (
            <div key={o.id} style={{ width: '10%' }}>
              {itemDisplayOpts.showImage && (
                <div>
                  <img
                    src={
                      o[itemDisplayOpts.imgKey] && o[itemDisplayOpts.imgKey].path
                        ? o[itemDisplayOpts.imgKey].path
                        : 'avatars/8.jpg'
                    }
                    style={{ width: '100%' }}
                    alt="item"
                  />
                </div>
              )}
              <div style={{ marginRight: 10 }}>{o[displayKey]}</div>
            </div>
          ))}
      </aside>
    </div>
  );
};


export const MySelectField = ({
  placeholder,
  label,
  options,
  required,
  name,
  disabled = false,
  onChange,
  ...props
}) => {
  const [field] = useField(props);
  return (
    <Form.Item {...field} label={label} name={name}>
      <Select showSearch disabled={disabled} onChange={onChange}>
        {options
          .filter((o) => !o.disabled)
          .map((o) => {
            return (
              <Select.Option key={o.value} value={o.value}>
                {o.label}
              </Select.Option>
            );
          })}
      </Select>
    </Form.Item>
  );
};

export const MyProgress = ({ isSubmitting }) => {
  return (
    <div>
      <br />
      {isSubmitting && <LinearProgress />}
    </div>
  );
};

export const MyRadioGroup = ({
  options,
  label,
  disabled = false,
  onChange,
  ...field
}) => {
  return (
    <Form.Item {...field} label={label}>
      <Radio.Group {...field} disabled={disabled} onChange={onChange}>
        {options.map((o) => (
          <Radio value={o.value}>{o.label}</Radio>
        ))}
      </Radio.Group>
    </Form.Item>
  );
};

export const MyTimeField = ({
  name,
  label,
  required,
  disabled = false,
  onChange,
  ...props
}) => {
  return (
    <Form.Item
      {...props}
      name={name}
      label={label}
      rules={[
        {
          required,
        },
      ]}
    >
      <TimePicker
        format={"hh:mm A"}
        onChange={onChange}
        style={{ width: "100%" }}
        use12Hours
        disabled={disabled}
      />
    </Form.Item>
  );
};
