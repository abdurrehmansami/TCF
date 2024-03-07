import { Upload as Uploader } from "antd";
import React, { useState } from "react";
import PropTypes from "prop-types";

const Upload = ({ prefix = "", accept, ...props }) => {
  const [fileList, setFileList] = useState([]);
  let files = props.value?.length ? [...props.value] : [];
  const uploadProps = {
    accept: accept ? accept : "image/*, .pdf, .doc, .docx, .xls, .xlsx",
    listType: "picture",
    ...props,
    onRemove: (file) => {
      console.log(files);
      const index = files.indexOf(file);
      const newFileList = files.slice();
      newFileList.splice(index, 1);
      setFileList && setFileList(newFileList);
      files = newFileList;
    },
    beforeUpload: (file) => {
      files.push(file);
      setFileList && setFileList(files);
      return false;
    },
    fileList: (props?.value?.length ? props.value : fileList) || [],
  };

  return (
    <>
      <Uploader {...uploadProps}>{props.children}</Uploader>
    </>
  );
};

Upload.propTypes = {
  prefix: PropTypes.string,
  children: PropTypes.any,
};
export { Upload };
