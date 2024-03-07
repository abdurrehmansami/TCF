import axios from "axios";

const config = { withCredentials: true };

export const postData = async (endPoint, data) => {
  try {
    const resp = await axios.post(
      process.env.REACT_APP_SERVER_URL + endPoint,
      data,
      config
    );
    console.log(resp);
    return resp;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const putData = async (endPoint, data) => {
  try {
    const resp = await axios.put(
      process.env.REACT_APP_SERVER_URL + endPoint,
      data,
      config
    );
    console.log(resp);
    return resp;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const postFormData = async (formData) => {
  try {
    const resp = await axios.post(process.env.REACT_APP_UPLOAD_URL, formData);
    console.log(resp);
    return resp;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getData = async (endPoint) => {
  try {
    const resp = await axios.get(
      process.env.REACT_APP_SERVER_URL + endPoint,
      config
    );
    console.log(resp);
    return resp;
  } catch (error) {
    console.log(error);
    return error;
  }
};
export const getDataWithParams = async (url, params) => {
  try {
    const resp = await axios.get(process.env.REACT_APP_SERVER_URL + url, {
      ...config,
      params,
    });
    console.log(resp);
    return resp;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getExternalData = async (endPoint) => {
  try {
    const resp = await axios.get(endPoint);
    console.log(resp);
    return resp;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const deleteData = async (endPoint) => {
  try {
    const resp = await axios.delete(
      process.env.REACT_APP_SERVER_URL + endPoint,
      config
    );
    console.log(resp);
    return resp;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const postMsgData = async (endPoint, data) => {
  try {
    const resp = await axios.post(endPoint, data);
    console.log(resp);
    return resp;
  } catch (error) {
    console.log(error);
    return error;
  }
};
