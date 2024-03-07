import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { useHistory } from 'react-router'
import { useTranslation } from 'react-i18next'
import Content from '../../../components/Content'
import useFetch from '../../../hooks/useFetch'
import { getRowEl } from '@material-ui/data-grid';
function RoleForm(props) {
    const { t, i18n } = useTranslation();
    const history = useHistory();
    let [role, setRole] = useState({});
    const [page, setPage] = useState(1);
    const { error, isPending, data: permissions } = useFetch('permissions', page - 1, 1000)
    const id = props.location.data
    const { data: roleForEdit } = useFetch('roles/', null, null, true, id)
    let [addedPermissions, setAddedPermissions] = useState([])
    let [checkedPerms, setCheckedPerms] = useState([])
    let edit = id == null ? false : true

    useEffect(() => {
        if (roleForEdit) {
            setRole(roleForEdit.data)
            roleForEdit.data.permissions?.map(o => {
                addedPermissions.push({ 'id': "" + o.id })
                checkedPerms.push(o.id)
            })
        }
    }, [roleForEdit])

    const handleInputChange = e => {
        const { name, value } = e.target
        if (name == 'role') {
            setRole({...role, role: value})
        }
        if (e.target.type == 'checkbox') {
            if (e.target.checked) {
                console.log("checked: " + value)
                addedPermissions.push({ 'id': value });
                console.log("added permissions size: " + addedPermissions.length)
                setRole({ ...role, permissions: addedPermissions })
            } else {
                console.log("unchecked: " + value);
                //            addedPermissions.forEach((per, index) => {
                //                if(per.id === value) {
                //                     console.log("--delete permission at index--" + index)
                //                     addedPermissions[index] = null;
                //                     checkedPerms[index] = null;
                //                }
                //            })
                var selected = addedPermissions.filter(o => o.id !== value)
                setAddedPermissions(selected)
                setCheckedPerms(addedPermissions.filter(o => o.id !== value).map(o => parseInt(o.id)))
                setRole({ ...role, permissions: selected })
            }
            //          setAddedPermissions(addedPermissions)
            console.log("added permissions size: " + addedPermissions.length)
        }
        //        setRole({...role, permissions: addedPermissions})
    }
    const handleSubmit = e => {
        e.preventDefault()
        console.log("--------" + JSON.stringify(role))
        axios.post(process.env.REACT_APP_SERVER_URL +
            'roles', role, { withCredentials: true })
            .then(response => {
                console.log(response)
                history.push("/roles")
            })
            .catch(error => {
                console.log(error)
            })
    }
    return (
        <Content title='Add Role' >
            <form onSubmit={handleSubmit}>
                <div className="form-group row">
                    <label className="col-form-label col-sm-4" >{t('Role name')}</label>
                    <div className="col-sm-8">
                        <input name="role" className="form-control" placeholder="" type="text" onChange={handleInputChange} value={role.role} required/>
                    </div>
                </div>
                <legend><span>{t('Acces List')}</span></legend>
                {permissions && permissions.map(o => {
                    return (
                        <div className="form-group">
                            <legend><span>{t(o.name)}</span></legend>
                            <div className="form-group row">
                                <label className="col-sm-4 col-form-label" htmlFor=""> {t(o.name)}</label>
                                <div className="col-sm-8">
                                    {checkedPerms &&
                                        checkedPerms.includes(o.id) ?
                                        <input className="form-check-input" checked type="checkbox" name="permissionId" value={o.id} onChange={handleInputChange} />
                                        : <input className="form-check-input" type="checkbox" name="permissionId" value={o.id} onChange={handleInputChange} />
                                    }
                                </div>
                            </div>
                            {o.childList.map(child => {
                                return (
                                    <div className="form-group row">
                                        <label className="col-sm-4 col-form-label" >{t(child.name)}</label>
                                        <div className="col-sm-8">
                                            {
                                                checkedPerms &&
                                                    checkedPerms.includes(child.id) ?
                                                    <input className="form-check-input" checked type="checkbox" name="permissionId" value={child.id} onChange={handleInputChange} />
                                                    : <input className="form-check-input" type="checkbox" name="permissionId" value={child.id} onChange={handleInputChange} />
                                            }
                                        </div>
                                    </div>)
                            })}
                        </div>)
                })
                }
                <button type="submit" className="btn btn-sm btn-primary">{t('Submit')}</button>
            </form>
        </Content>
    )
}
export default RoleForm;
