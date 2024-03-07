import { Link } from 'react-router-dom';
import { useContext, useState } from 'react'
import { UserContext } from '../UserProvider'
import { useTranslation } from 'react-i18next'
import CorePagination from './CorePagination'
import Loading from './Loading';
import { useHistory } from 'react-router'
import {
    AutoComplete,
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    Row,
    Select,
    Table,
    Tabs,Drawer,
    Typography,
    Modal,
  } from "antd";
  import {
    DeleteOutlined,
    DownloadOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
    EyeOutlined,
    LineChartOutlined,
  } from "@ant-design/icons";
import { FilterList } from '@material-ui/icons';
import { useStateCallback } from "./useStateCallBack";
import { useEffect } from 'react';
const {confirm} = Modal;
const MainTable = ({ addRoute,title, HeadingParagraph, addBtnTitle, isLoading, fields, data, overRideDelete=true,
     isPending, error, tableTitle, sortModel, handlePage, handleAction, body,
     handleDelete, handleAddCallback, handleView, pagination, onChangeCallBack, showFilter=false, Form_, Details_
     , reloadCallback, details=true, tableLoading=false}) => {
    const [item, setItem] = useState(null)
    const { t } = useTranslation();
    const { user } = useContext(UserContext);
    const [displaybody, setdisplaybody] = useState(false)
    const history = useHistory();
    const [localData,setLocalData] = useState(data);
    const [sort,setSort] = useState({});
    useEffect(()=>{
      setLocalData(data)
    },[data]);

    const parseDate = unixTS => {
        return new Date(unixTS).toLocaleDateString('en-UK');
    }
    const w = window.screen.width > 850 ? 850 : window.screen.width;
    const [drawerOptions, setDrawerOptions] = useStateCallback({
      visible: false,
      data: null,
      mode: "",
      title: "Create Order",
    });

    const handleAction2 = (data, mode) => {
      setItem(data)
      setDrawerOptions(
        {
          visible: false,
        },
        () => {
          if (mode === "edit" || mode === "view") {
            setDrawerOptions(() => ({
              visible: true,
              data: JSON.parse(JSON.stringify(data)),
              id: data.id,
              mode,
              handleAction: handleAction2,
              title: mode === "edit" ? `Edit ${title}` : `${title} Details`,
            }));
          }
          else {
            setDrawerOptions(() => ({
              visible: true,
              data: JSON.parse(JSON.stringify(data)),
              id: null,
              mode,
              handleAction: handleAction2,
              title: `Add ${title}`,
            }));
          }
        }
      );
    };

    let add = false;
    let edit = false;
    let del = false;

    const checkPermissions = () => {
        user.permissions.forEach(o => {
            if (o.childList.length > 0) {
                let permissionList = [];
                o.childList.forEach(c => {
                    permissionList.push(c.displayMenu)
                })

                if (permissionList.indexOf(window.location.pathname) !== -1){
                    o.childList.forEach(c => {

                        if (c.displayMenu.startsWith('/add')) {
                            add = true;
                        }
                        if (c.displayMenu.startsWith('/edit')) {
                            edit = true;
                        }
                        if (c.displayMenu.startsWith('/delete')) {
                            del = true && overRideDelete;
                        }

                        if (window.location.pathname === c.displayMenu && c.childList.length > 0) {
                            c.childList.forEach(cc => {
                                if (cc.displayMenu.startsWith('/add')) {
                                    add = true;
                                }
                                if (cc.displayMenu.startsWith('/edit')) {
                                    edit = true;
                                }
                                if (cc.displayMenu.startsWith('/delete')) {
                                    del = true;
                                }
                            })
                        }
                    })
                }
            }
        })
    }
    if (!tableTitle) {
        checkPermissions()
    }
    const hasActionColumn = (fields)=>{
      return fields.some((field)=> field.key=== 'Actions' || field.title==='Actions');
    }
    if (edit || del) {
      if(!hasActionColumn(fields)){
        fields.push(
            {
               title : "Actions",
               dataIndex : "id",
               key : "id",
                render : (params , row) => (
                    <>
                    {
                    details &&
                    <Button
                      type="link"
                      size="small"
                      onClick={() => handleAction2(row, "view")}
                    >
                      {/* <EyeOutlined /> */}
                    </Button>
                    }


                    {edit && <> <Button
                      type="link"
                      size="small"
                      onClick={() => {  handleAction2(row, "edit") }}
                                >
                                  <EditOutlined />
                                </Button> &nbsp;</>
                    }
                    { del && <><Button

                    type="link"
                    size="small"
                    danger
                    onClick={() => {
                      confirm({
                        title: "Are you sure, you want to delete?",
                        icon: <ExclamationCircleOutlined/>,
                        okText:'Yes',
                        okType:'danger',
                        onOk(){
                          handleDelete(row)
                        },
                      })
                    }}
                             >
                                  <DeleteOutlined />
                             </Button>&nbsp;</>
                    }
                    { title === 'Products' &&
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {console.log('Prod_ID', row?.id); history.push('/product-summary', { prodId: row?.id })}}
                      >
                        <LineChartOutlined />
                      </Button>}
                    </>
                )
            },
        )
      }
    }

    fields.map(field => {
        field['headerName'] = t(field['headerName'])
        if (field.field !== 'Actions') {
            if (field.dataRoute) {
                field.render = (params , row) => {
                  return (
                    <Button
                    type="link"
                    size="small"
                    onClick={()=>{ handleAction2(row, "view")}}
                    > <span style={{textTransform :"uppercase" }}>{field.body ? field.body(row) : params}</span></Button>
                  )
                }
            }
            // if (field.date) {
            //     field.valueFormatter = params => parseDate(params.value)
            // }
        }
    })
   const bodydisplayfun =() => {
     setdisplaybody(!displaybody)
   }

    return (
        <>
        <Row>
        <Col style={{ flex: 1 }}>
          <Typography.Title level={3}>{t(`${title}`)}</Typography.Title>
          <Typography.Paragraph>{t(`${HeadingParagraph}`)}</Typography.Paragraph>
        </Col>
        <Col className="align-items-start d-flex" style={{ gap: 10 }}>
          {
          showFilter && 
            <Button
              className="align-items-center d-inline-flex"
              icon={<FilterList style={{ width: 18, marginRight: 5 }} />}
              onClick= {bodydisplayfun}
            >
              {t("FILTERS")}
            </Button>
          }
          {addBtnTitle && 
            <Button onClick={() =>
              {
                if (handleAddCallback) 
                  handleAddCallback();
                else
                  handleAction2(null, "create");
              }}>
              {t(addBtnTitle)}
            </Button>
          }
        </Col>
      </Row>
      <Row className='d-flex justify-content-end' style={{marginTop:-30,marginRight:10}}>
        <Col>
          {
            pagination?.pageSize ? (`${(pagination?.current - 1) * pagination?.pageSize+1} - ${Math.min(pagination?.current * pagination?.pageSize,pagination?.total)} of ${pagination?.total}`)
            :
            null
          }
        </Col>
      </Row>
      {/* Adding Drawer */}

      {drawerOptions.visible ? (
        <Drawer onClose={() => setDrawerOptions({ ...drawerOptions, visible: false })} open={drawerOptions.visible} title={drawerOptions.title} width={w}>
          { drawerOptions.mode === 'edit' || drawerOptions.mode === 'create' ?
          (
            <Form_ reloadCallback={reloadCallback} sort={sort} data={item} onClose={() => setDrawerOptions({ ...drawerOptions, visible: false })} />
          )
          :
          (
            <Details_ reloadCallback={reloadCallback} sort={sort} data={item} onClose={() => setDrawerOptions({ ...drawerOptions, visible: false })} />
          )}
        </Drawer>
      ) : null}

        {/* <Content  title={add ? (handleAddCallback ? <button onClick={()=>handleAddCallback()} className="btn btn-sm btn-primary" >{t(addBtnTitle)}</button> :
       <div style={{marginTop : "-60px" , display : "relative"}}> <Link to={addRoute} > <span style={{ color :"black" , backgroundColor :"white" , border :  "1px solid lightGrey" , padding :"5px" , fontSize :"0.8rem" , borderRadius :"5px" , marginLeft :"950px" }}>{t(addBtnTitle)} </span></Link></div> ) : t(tableTitle)} >
*/}
            {displaybody && body}
            {(isPending || isLoading) &&  <Loading />}
            {localData &&
                <div style={{ width: '100%' , backgroundColor : "white"}}  >
                    {/* <Table dataSource  = {data.data ? data.data.content : data}
                    columns = {fields}
                    ></Table> */}
                    <Table
                      loading={tableLoading}
                      dataSource  = {data.data ? data.data.content : data}
                      columns = {fields} showSorterTooltip={false}
                      onChange={(pagination, filters, sort, extra) => {
                        setSort(sort);
                        onChangeCallBack(pagination, filters, sort, extra);
                      }}
                      pagination={pagination}
                    ></Table>
                    {/* <DataGrid components={{

                                }} rows={ data.data ? data.data.content : data } columns={fields} sortModel={sortModel} hideFooterPagination={true} autoHeight={true} /> */}
                </div>
            }
            {isPending && data && <Loading />}
            {/* {data && data.data &&<CorePagination totalPages={data.data.totalPages}  parentCallback={handlePage} />} */}
            {error && <div>{error}</div>}

        </>
    );
}

export default MainTable;

