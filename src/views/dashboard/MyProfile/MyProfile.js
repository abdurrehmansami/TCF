import Content from '../../../components/Content'
import { useTranslation } from 'react-i18next'
import useFetch from '../../../hooks/useFetch'
import DetailsTable from 'src/components/DetailsTable'

const heading = { fontWeight: "620", fontSize: "27px" }

function MyProfile(props) {
  const { t } = useTranslation();
  const id = props.match.params.id
  const { error, isPending, data } = useFetch('employeeprofile')

  return (
    <DetailsTable
      title={data && data.name}
      fields={fields}
      data={data && data}
      error={error}
      isPending={isPending}
      businessAddress={addressFields}
      hqAddress={hqAddressFields}
      photo={data && data && data.photoMedia && <img className="img-thumbnail" src={data.photoMedia.path} />}
      headings={
        <>
          <h4 className="text-uppercase">Director:{" "}<span className="text-muted " style={heading}>{data && data.directorName}</span></h4>
        </>
      }
    />
  )
}
export default MyProfile;

const fields = [
  { key: '', headerName: 'Personal phone' },
  { key: 'mobilePhone', headerName: 'Mobile phone' },
  { key: '', headerName: 'Professional phone' },
  { key: '', headerName: 'Registration number' },
  { key: 'numberSocialSecurity', headerName: 'Social Security number' },
  { key: 'birthdayStr', headerName: 'Date of Birth' },
  { key: 'email', headerName: 'E-mail' },
  { key: 'nationality', headerName: 'Nationality' },
  { key: 'bban', headerName: 'RIB' },
  { key: '', headerName: 'Contact person ' },
]

const addressFields =
[
  { key: "street" },
  { key: "street2" },
  { key: "postalCode" },
  { key: "city" },
  { key: "country" }
]

const hqAddressFields =
[
  { key: "hq_street" },
  { key: "hq_street2" },
  { key: "hq_postalCode" },
  { key: "hq_city" },
  { key: "hq_country" }
]

