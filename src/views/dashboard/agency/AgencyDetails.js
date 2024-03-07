import { useTranslation } from 'react-i18next'
import useFetch from '../../../hooks/useFetch'
import DetailsTable from 'src/components/DetailsTable';

const heading = { fontWeight: "620", fontSize: "27px" }

function AgencyDetails(props) {
  const { t } = useTranslation();
  const id = props.data.id
  const { error, isPending, data } = useFetch('agencies/' + id)

  return (
    <DetailsTable
      title={data && data.data.name}
      fields={fields}
      data={data && data.data}
      error={error}
      isPending={isPending}
      photo="photoDto"
      headings={
        <>
          <h4 className="text-uppercase">{t('Director')}:{" "}<span className="text-muted " style={heading}>{data && data.data.directorName}</span></h4>
          {data && data.data && data.data.email ? <a href={"mailto:" + data.data.email} style={{ fontSize: "15px", color: "black" }}>{data.data.email}</a> : ""}
        </>
      }
    />
  )
}
export default AgencyDetails;

const fields = [
  { key: 'directorName', headerName: 'DIRECTOR' },
  { key: 'regionName', headerName: 'Region' },
  { key: 'email', headerName: 'ADV Email' },
  { key: 'phone', headerName: 'Phone' },
  { key: 'fax', headerName: 'Fax' },
  { key: 'tvanumber', headerName: 'VAT number' },
  { key: 'codeAPE', headerName: 'APE code' },
  { key: 'identificationNumber', headerName: 'Registration number' },
  { key: 'siretNumber', headerName: 'Siret number' },
  { key: 'amountOfCapital', headerName: 'Capital' },
  { key: 'denomination', headerName: 'Denomination' },
  { key: 'dobStr', headerName: 'Creation date' },
]

