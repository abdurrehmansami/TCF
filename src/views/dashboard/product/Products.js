import MainTable from '../../../components/MainTable3'
import { useState, useEffect } from 'react';
import useFetch from '../../../hooks/useFetch'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import { deleteData,getDataWithParams   } from '../../../services/NetworkService';
import {useLocation , Link } from "react-router-dom";
import {

  Button,
  Card,
  Col,
  Input,
  Row,
  Form, Tag
} from "antd"

import toast from 'react-hot-toast'
import ProductForm from './ProductForm';
import ProductDetails from './ProductDetails';

const Products = () => {
    const [isLoading, setLoading] = useState(false);
    const search = useLocation().search;
    const _q = new URLSearchParams(search).get('_q');
    const [page, setPage] = useState(1);
    const { error, isPending, data } = useFetch('products?sort=name,asc' + (_q ? '?name=' + _q : ''), page - 1)
    const [products, setProducts] = useState(null)
    const { t } = useTranslation();
    const history = useHistory();
    const [form] = Form.useForm();
    const [currentPagination, setCurrentPagination] = useState({
      current: 1,
      pageSize: 20,
      total: 0,
    });
    const handleAction = (data) => {
        history.push({
            pathname: '/products/edit',
            data: data
        })
    }
    const handleDelete = (data) => {
        deleteData('products/' + data.id)
        let newProducts = products.data.content.filter(o => o.id !== data.id)
        let data_ = products.data
        data_.content = newProducts
        setProducts({ ...products, data: data_ })
        setCurrentPagination({...currentPagination,total:--currentPagination.total});
    }

    useEffect(() => {
        if (data) {
            data.data.content
                .filter(o => o.imageUrl !== null)
                .map(o => o.image={path: o.imageUrl.substring(o.imageUrl.indexOf("/api"))})            
            setProducts(data)
            setCurrentPagination({
              current: 1,
              pageSize: data.data.size, total: data.data.totalElements
            })
            console.log("Show Image: "+data)
        }
    }, [data])


    useEffect(() => {
        toast.error('Highlighted products are not mapped with E-commerce. Contact admin for support!', { style: { minWidth: '500px' }, position: "top-center" })
    }, [])

    const handlePage = (page) => {
        setPage(page);
    };

    const fetchData = (pagi, filters, sort, extra, currentStatus) => {
          const pagination = pagi || currentPagination;
          setLoading(true);
          const sortColumn = sort?.field || "name";
          const sortDirection = sort?.order
            ? sort.order === "descend"
              ? "desc"
              : "asc"
            : "asc";

          getDataWithParams("products", {
            ...form.getFieldsValue(),
            sort: `${sortColumn},${sortDirection}`,
            size: pagination.pageSize,
            page: pagination.current - 1,
          })
            .then((response) => {
              if (response.data) {
                setProducts(response.data);
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
        key: '', title: '',
        render: (params) => (params.image && <img style={{height: 40, width: 40, borderRadius: '10px'}}
                              src={params.image.path} />)

      },
      {
        key: "name",
        title: "Name",
        dataIndex: "name",
        sorter:true,
        dataRoute: 'id',
        body: (row) => {
          return (
              row.prestashopProductId === null ?
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

        {
          key: "category",
          title: "Category",
          dataIndex: "category",
          render: (a) => {
            return <span style={{textTransform :"uppercase" , fontWeight :"450" ,    color: "rgba(0, 0, 0, 0.88)" ,fontSize: "13px"
            }}>{a.name}</span>;
          },
        },

    ]
    const productdisplay = (data) => {
    history.push({
      pathname: '/products/' + data.id,
      data: data
    })
    }

    return (
        <MainTable  addRoute='products/add'
                    showFilter = {true}
                    onChangeCallBack={fetchData}
                    addBtnTitle='Add Product'
                    fields={fields}
                    pagination={currentPagination}
                    data={products}
                    error={error}
                    isPending={isPending}
                    handleDelete={handleDelete}
                    handleAction={handleAction}
                    handlePage={handlePage}
                    handleView={productdisplay}
                    Form_={ProductForm}
                    Details_={ProductDetails}
                    reloadCallback={fetchData}
                    title = "Products"
                    HeadingParagraph  ="Product List and  Categories "

            body={
              <div>
                        <Card style={{ marginBottom: 20 }}>
                        <Form form={form} layout="vertical" onFinish={() => fetchData()}>
                          <Form.Item shouldUpdate noStyle>
                            {() => (
                              <>
                                <Row gutter={20}>
                                  <Col xs={24} md={12}>
                                    <Form.Item name={"name"} label={t("PRODUCT NAME")}>
                                      <Input placeholder={t("PRODUCT NAME")} />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} md={12}>
                                    <Form.Item name={"categoryName"} label={t("CATEGORY")}>
                                      <Input placeholder={t("CATEGORY")} />
                                    </Form.Item>
                                  </Col>
                                </Row>
                                <Form.Item noStyle>
                                  <Button type="primary" htmlType="submit">
                                    {t("SEARCH")}
                                  </Button>
                                </Form.Item>
                              </>
                            )}
                          </Form.Item>
                        </Form>
                      </Card>
                      </div>}
    />
  )
}
export default Products;
