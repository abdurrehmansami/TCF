import Loading from "./Loading";
import Content from './Content';
import { useTranslation } from 'react-i18next'

const thumb = {
    display: 'inline-flex',
    borderRadius: 2,
    border: '1px solid #eaeaea',
    marginBottom: 8,
    marginRight: 8,
    width: '270px',
    height: "300px",
    padding: 4,
    boxSizing: 'border-box'
};

const DetailsTable = ({ title, fields, data, isPending, headings, error, photo , button}) => {
    const { t } = useTranslation();
    const addressFields = ["street", "street2", "postalCode", "city", "country"]
    return (
        <Content title={title} button = {button}>
            {data &&
                <div className="row">
                    <div className="col-sm-5">
                        {headings}
                        <table className="table table-lightborder table-sm" style={{ height: "10px" }}>
                            <tbody>
                                {fields.map((o, index) => {
                                    return (
                                        <tr key={index}>
                                            <th>{t(o.headerName)}</th>
                                            {o.photoLink ?
                                                <td className="text-right">
                                                    <a href={data[o.photoLink] ? data[o.photoLink].path : ""} target="_blank" >
                                                        {data[o.photoLink] ? t(o.photo) : ""}
                                                    </a>
                                                </td> :
                                                <td className="text-right" >{o.key == 'category' ? data.category.name : data[o.key]}</td>}
                                        </tr>
                                    )
                                })}

                            </tbody>
                        </table>
                    </div>
                    <div className="col-sm-4"></div>
                    <div>
                        {data[photo] && <div style={thumb}>
                            <img className="img-thumbnail" src={data[photo].path} />
                        </div>}
                        {
                        (data.addressHeadQuarterDto || data.hqAddress || data.businessAddress) &&
                        <div>
                            <h5>{(data.addressHeadQuarterDto || data.hqAddress) ? t("Local Address") : t("Address")}</h5>
                            {data.addressDto && addressFields.map((o) => {
                                return (<>{data.addressDto[o] ? <>{data.addressDto[o]}<br /></> : ""}</>)
                            })}
                            {data.businessAddress && addressFields.map((o) => {
                                return (<>{data.businessAddress[o] ? <>{data.businessAddress[o]}<br /></> : ""}</>)
                            })}
                        </div>
                        }
                        <br />
                        <div>
                            <h5>{(data.addressHeadQuarterDto || data.hqAddress) ? t("HeadQuarter Address") : ""}</h5>
                            {data.addressHeadQuarterDto && addressFields.map((o) => {
                                return (<>{data.addressHeadQuarterDto[o] ? <>{data.addressHeadQuarterDto[o]}<br /></> : ""}</>)
                            })}

                            {data.hqAddress && addressFields.map((o) => {
                                return (<>{data.hqAddress[o] ? <>{data.hqAddress[o]}<br /></> : ""}</>)
                            })}
                        </div>
                    </div>
                </div>
            }
            {isPending && <Loading />}
            {error && <div>{error}</div>}
        </Content>
    );
}

export default DetailsTable;
