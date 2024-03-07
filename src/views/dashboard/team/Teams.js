import { useState, useEffect } from 'react';
import { useHistory } from 'react-router'
import useFetch from '../../../hooks/useFetch'
import MainTable from '../../../components/MainTable3'
import { deleteData  , getDataWithParams} from '../../../services/NetworkService';
import {

  Button,
  Card,
  Col,
  Input,
  Row,
  Form, Tag
} from "antd"
import TeamForm from './Teamform';
import TeamsDetails from './TeamDetails';

const Teams = () => {
  const [page, setPage] = useState(1);
  const { error, isPending, data } = useFetch('teams', page - 1)
  const [teams, setTeams] = useState(null)
  const history = useHistory();
  const [form] = Form.useForm();
  const [isLoading, setLoading] = useState(false);
  const [currentPagination, setCurrentPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  })

  const handleAction = (data) => {
    history.push({
      pathname: 'teams/edit',
      data: data
    })
  }

  const handlePage = (page) => {
    setPage(page);
  };
  const handleDelete = (data) => {
    deleteData('teams/' + data.id)
    let newTeams = teams.data.content.filter(o => o.id !== data.id)
    let data_ = teams.data
    data_.content = newTeams
    setTeams({ ...teams, data: data_ })
  }

  useEffect(() => {
    if (data) {
      setTeams(data)
      setCurrentPagination({
        current: 1,
        pageSize: data.data.size, total: data.data.totalElements
      })
    }
  }, [data])

  const productdisplay = (data) => {
    history.push({
      pathname: '/teams/' + data.id,
      data: data
    })
  }
  function productdisplay2(data){
    history.push({
      pathname: '/agencies/' + data.data.agencyId,
      data: data
    })
  }

  const fetchData = (pagi, filters, sort, extra, currentStatus) => {
    const pagination = pagi || currentPagination;
    setLoading(true);
    const sortColumn = sort?.field || "name";
    const sortDirection = sort?.order
      ? sort.order === "descend"
        ? "desc"
        : "asc"
      : "desc";
  getDataWithParams("teams", {
    ...form.getFieldsValue(),
    sort: `${sortColumn},${sortDirection}`,
      size: pagination.pageSize,
      page: pagination.current - 1,
    })
      .then((response) => {
        if (response.data) {
          setTeams(response.data);
          setCurrentPagination({
            ...pagination,
            total: response.data.data.totalElements,
          });
        }
        setLoading(false);
        // setSubmitting(false);
      })
      .catch((error) => {
        setLoading(false);
        // setSubmitting(false);
        console.log(error);
      });
  };

  const fields = [

    {
      title : "Team",
      dataIndex : "name",
      key : "name",
      dataRoute : "id" ,
      render : ((params , row)=>{
       return (
        <Button
         type  = "link"
         size = "small"
         onClick={()=>{ productdisplay2(row)}}
        >
         <span style={{textTransform : "uppercase"}}>{params}</span>
        </Button>
       )
       })
    },
    {
      title : "Agency",
    dataIndex : "agencyName",
    key: "agencyName",
    dataRoute : "agencyId",
    render : ((params , rows)=>{
    return (
      <Button
      type='link'
      size= "small"
      onClick={()=>{
      productdisplay2(rows)
      }}
      >
       <span style={{textTransform : "uppercase"}}>{params}</span>
      </Button>
    )
    })

  }
  ]

  return (
    <MainTable addRoute='teams/add'
      addBtnTitle='Add Team'
      title = "Team"
      HeadingParagraph = "Teams Details"
      fields={fields}
      data={teams}
      error={error}
      isPending={isPending}
      handleDelete={handleDelete}
      handleAction={handleAction}
      handlePage={handlePage}
      handleView={productdisplay}
      onChangeCallBack={fetchData}
      pagination={currentPagination}
      Form_ = {TeamForm}
      Details_ = {TeamsDetails}

      />
  )
}

export default Teams

// const fields = [

//   { field: 'name', headerName: 'Team', flex: 1, dataRoute: 'teams', dataId: 'id' },
//   { field: 'agencyName', headerName: 'Agency', dataRoute: 'agencies', dataId: 'agencyId', flex: 1 },

// ]
