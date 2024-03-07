import { useState } from 'react';
import { useHistory } from 'react-router'
import useFetch from '../../../hooks/useFetch'
import MainTable from '../../../components/MainTable'

const Roles = () => {
    const [page, setPage] = useState(1);
    const { error, isPending, data } = useFetch('roles', page - 1)
    const history = useHistory();

    const handleAction = (item) => {
        history.push({pathname: 'roles/edit', data: item.id})
    }

    const handlePage = (page) => {
        setPage(page);
    };

    return (
        <MainTable addRoute='roles/add'
            addBtnTitle='Add Role'
            fields={fields}
            data={data}
            error={error}
            isPending={isPending}
            handleAction={handleAction}
            handlePage={handlePage} />
    )
}

export default Roles

const fields = [
    { field: 'role', headerName: 'Role name', flex: 1 },
    { field: 'countAccess', headerName: 'Number of Accesses', flex: 1 },
]
