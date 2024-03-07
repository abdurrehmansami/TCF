import { useEffect, useState, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';

const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
};

const activeStyle = {
    borderColor: '#2196f3'
};

const acceptStyle = {
    borderColor: '#00e676'
};

const rejectStyle = {
    borderColor: '#ff1744'
};

const thumbsContainer = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16
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

export function MyDropzone({ name, label, msg, multiple, maxFiles, maxSize, setFieldValue,accept }) {
    const [files, setFiles] = useState([]);
    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject } = useDropzone({
            accept:accept?  accept: 'image/*, .pdf, .doc, .docx, .xls, .xlsx',
            multiple: multiple,
            maxFiles: maxFiles,
            maxSize: maxSize ? maxSize : 10485760,
            onDrop: acceptedFiles => {
                setFieldValue(name, acceptedFiles);
                setFiles(acceptedFiles.map(file => Object.assign(file, {
                    preview: URL.createObjectURL(file)
                })));
            }
        });

    const style = useMemo(() => ({
        ...baseStyle,
        ...(isDragActive ? activeStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [
        isDragActive,
        isDragReject,
        isDragAccept
    ]);

    const thumbs = files.map(file => (
        <div style={{width: '150px', textAlign: 'center'}}>
            <div style={thumb} key={file.name}>
                <div style={thumbInner}>
                    {
                      file.type === 'application/pdf' &&
                      <img src={'/logo/pdf-logo.png'} style={img} />
                    }
                    {
                      (file.type.indexOf('spreadsheet') !== -1 ) &&
                      <img src={'/logo/excel-logo.png'} style={img} />
                    }
                    {
                      (file.type.indexOf('document') !== -1 || file.type.indexOf('word') !== -1) &&
                      <img src={'/logo/word-logo.png'} style={img} />
                    }
                    
                    { file.type.split("/")[0] === 'image' &&
                      <img
                        src={file.preview}
                        style={img}
                    />
                    }
                </div>
            </div>
            <div>
              <a href={file.preview} target="_blank" >
                {file.name}
              </a>
            </div>
        </div>
    ));

    useEffect(() => () => {
        // Make sure to revoke the data uris to avoid memory leaks
        files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);

    return (
        <div className="form-group">
            <label htmlFor={name} className="form-label">{label}</label>
            <div {...getRootProps({ style })}>
                <input {...getInputProps()} />
                {msg?<p>{msg}</p>:<p>Drag 'n' drop {maxFiles ? `max ${maxFiles} files` : 'file'} here, or click to select file{multiple && 's'}</p>}
            </div>
            <aside style={thumbsContainer}>
                {thumbs}
            </aside>
        </div>
    );
}