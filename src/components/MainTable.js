import { Link } from 'react-router-dom';
import { useContext } from 'react'
import { UserContext } from '../UserProvider'
import { useTranslation } from 'react-i18next'
import CorePagination from './CorePagination'
import { DataGrid, GridToolbar } from '@material-ui/data-grid';
import Button from '@material-ui/core/Button';
import Loading from './Loading';
import Content from './Content';


const MainTable = ({ addRoute, addBtnTitle, fields, data, overRideDelete=true, isPending, error, tableTitle, sortModel, handlePage, handleAction, body, handleDelete, handleAddCallback}) => {
    const { t } = useTranslation();
    const { user } = useContext(UserContext);

    const parseDate = unixTS => {
        return new Date(unixTS).toLocaleDateString('en-UK');
    }
    let add = false
    let edit = false
    let del = false
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
    if (edit || del) {
        fields.push(
            {
                field: t('Actions'), flex: 1,
                renderCell: (params) => (
                    <>{edit && <><Button
                                    variant="outlined"
                                    color="secondary"
                                    size="small"
                                    onClick={() => { handleAction(params.row) }}
                                >
                                    {t('Edit')}
                                </Button> &nbsp;</>
                    }
                    { del && <Button
                                 variant="outlined"
                                 color="secondary"
                                 size="small"
                                 onClick={() => {
                                     if (window.confirm('Are you sure you want to delete?')) {
                                         handleDelete(params.row)
                                     }
                                 }
                                 }
                             >
                                 {t('Delete')}
                             </Button>
                    }
                    </>
                )
            },
        )
    }

    fields.map(field => {
        field['headerName'] = t(field['headerName'])
        if (field.field !== 'Actions') {
            if (field.dataRoute) {
                field.renderCell = (params) => (
                    <Link to={'/' + field.dataRoute + '/' + params.getValue(field.dataId)} >{params.value}</Link>
                )
            }
            if (field.date) {
                field.valueFormatter = params => parseDate(params.value)
            }
        }
    })

    return (
        <Content title={add ? (handleAddCallback ? <button onClick={()=>handleAddCallback()} className="btn btn-sm btn-primary">{t(addBtnTitle)}</button> :  <Link to={addRoute} className="btn btn-sm btn-primary" >{t(addBtnTitle)} </Link>) : t(tableTitle)} >
            <div>
                {body}
            </div>
            {isPending && <Loading />}
            {data &&
                <div style={{ width: '100%' }}>
                    <DataGrid components={{
                                  Toolbar: GridToolbar,
                                }} rows={data.data ? data.data.content : data} columns={fields} sortModel={sortModel} hideFooterPagination={true} autoHeight={true} />
                </div>
            }
            {isPending && data && <Loading />}
            {data && data.data && <CorePagination totalPages={data.data.totalPages} parentCallback={handlePage} />}
            {error && <div>{error}</div>}
        </Content>
    );
}

export default MainTable;
