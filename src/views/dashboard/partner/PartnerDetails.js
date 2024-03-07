import { useTranslation } from 'react-i18next'
import useFetch from '../../../hooks/useFetch'
import DetailsTable from 'src/components/DetailsTable';

const heading = { fontWeight: "620", fontSize: "27px" }

function PartnerDetails(props) {
    const { t } = useTranslation();
    const id = props.data.id
    const { error, isPending, data } = useFetch('partners/' + id)
    return (
        <DetailsTable
            title={t('Partner')}
            fields={fields}
            data={data && data.data}
            error={error}
            isPending={isPending}
            photo="photoMedia"
            headings={
                <h4 className="text-uppercase">{t("Partner")}:{" "}<span className="text-muted " style={heading}>{data && data.data.name}</span></h4>
            }
        />
    )
}

export default PartnerDetails

const fields = [
    { key: '', headerName: 'Customer code' },
    { key: 'phone', headerName: 'Phone' },
    { key: 'fax', headerName: 'Fax' },
    { key: 'tvaNumber', headerName: 'VAT' },
    { key: 'codeAPE', headerName: 'APE code' },
    { key: 'identificationNumber', headerName: 'Registration number' },
    { key: 'amountOfCapital', headerName: 'Capital' },
    { key: 'denominationValue', headerName: 'Denomination' },
    { headerName: "Contacts" },
    { headerName: 'Commercial' },
    { headerName: 'Accounting' },
    { headerName: 'Administrative' },
    { headerName: 'Photo', photoLink: "photoMedia", photo: "photo" },
    { headerName: 'Contract', photoLink: "workContractMedia", photo: "contract" },
    { headerName: 'Miscellaneous' }
]



