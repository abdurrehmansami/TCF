import MainTable from '../../../components/MainTable3'
import { useState, useEffect } from 'react';
import { deleteData , getDataWithParams } from '../../../services/NetworkService';
import { useHistory } from 'react-router'
import useFetch from '../../../hooks/useFetch'
import { useTranslation } from 'react-i18next'
import {
    Button,
    Card,
    Col,
    Input,
    Row,
    Form,
    Tag
  } from "antd";
import CategoryForm from './CategoryForm';
import CategoryDetails from './CategoryDetail';

const Categories = () => {
    const [page, setPage] = useState(1);
    const { error, isPending, data } = useFetch('categories?sort=name,asc', page - 1)
    const [categories, setCategories] = useState(null)
    const history = useHistory();
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [isLoading, setLoading] = useState(false);
    const [currentPagination, setCurrentPagination] = useState({
      current: 1,
      pageSize: 20,
      total: 0,
    })
var filterbutton = false;
    const handleAction = (data) => {
        history.push({
            pathname: 'categories/edit',
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
        : "asc";

      getDataWithParams("categories?", {
        sort: `${sortColumn},${sortDirection}`,
        size: pagination.pageSize,
        page: pagination.current - 1,
      })
        .then((response) => {
          if (response.data) {
            setCategories(response.data);
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
    const productdisplay = (data) => {
        history.push({
          pathname: '/categories/' + data.id,
          data: data
      })
      }

    const handleDelete = (data) => {
        deleteData('categories/' + data.id)
        let newCategories = categories.data.content.filter(o => o.id !== data.id)
        let data_ = categories.data
        data_.content = newCategories
        setCategories({ ...categories, data: data_ })
        setCurrentPagination({...currentPagination,total:--currentPagination.total});
    }

    useEffect(() => {
        if (data) {
            setCategories(data)
            setCurrentPagination({
              current: 1,
              pageSize: data.data.size, total: data.data.totalElements
            })
        }
    }, [data])

    const handlePage = (page) => {
        setPage(page);
    };


    const fields = [
        // {
        //   key: "name",
        //   title: "Category",
        //   dataIndex: "name",
        //   sorter:true,
        //   dataRoute: 'id',
        //   render: (params , row) => {
        //     return (
        //       <Button
        //       type="link"
        //       size="small"
        //       onClick={()=>{ productdisplay(row)}}
        //       > <span style={{textTransform :"uppercase" }}>{params}</span></Button>
        //     )
        //   },
        //   },
          {
            key: "name",
            title: "Category",
            dataIndex: "name",
            sorter:true,
            dataRoute: 'id',
            body: (row) => {
              return (
                row.prestashopCategoryId === null ?
                <Tag style={{textTransform :"uppercase" }} color={'volcano'} key={row.id}>
                  {row.name}
                </Tag>
                  :
                <span style={{textTransform :"uppercase" }}>
                  {row.name}
                </span>
              )
            }
          },
        ]

     return (
        <MainTable addRoute='categories/add'
         showfilter={filterbutton}
            addBtnTitle='Add Category'
            onChangeCallBack={fetchData}
            fields={fields}
            data={categories}
            error={error}
            isPending={isPending}
            pagination={currentPagination}
            handleDelete={handleDelete}
            handleAction={handleAction}
            handlePage={handlePage}
            Form_={CategoryForm}
            Details_={CategoryDetails}
            reloadCallback={fetchData}
            title = "Category"
            HeadingParagraph = "Category details"
            handleView={productdisplay}
            style={{display : "flex" ,justifyContent : "flex-end" , marginRight : "80px"}}
            styleActions={{ display : "flex" , justifyContent : "flex-end", marginRight :"50px"  }}

            />
    )
}
export default Categories;
// const fields = [

//     { field: 'name', headerName: 'Category', dataRoute: 'categories', dataId: 'id', flex: 1 },
//     { field: 'type', headerName: 'Type', flex: 1 },

// ]
