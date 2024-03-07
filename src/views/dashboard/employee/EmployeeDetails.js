import { useTranslation } from 'react-i18next'
import useFetch from '../../../hooks/useFetch'
import DetailsTable from 'src/components/DetailsTable'

const heading = { fontWeight: "620", fontSize: "27px" }
function EmployeeDetails(props) {
  const { t } = useTranslation();
  const id = props.data.id
  const { error, isPending, data } = useFetch('employees/' + id)

  return (
    <DetailsTable
      title={data && data.data.fullname}
      fields={fields}
      data={data && data.data}
      error={error}
      isPending={isPending}
      photo="photoMedia"
      headings={<>
        <h4 className="text-uppercase">{t('Agency')}:{" "}<span className="text-muted " style={heading}>{data && data.data.agencyName}</span></h4>
        <h4 className="text-uppercase">{t('Function')}:{" "}<span className="text-muted" style={heading}>{data && data.data.jobName}</span></h4>
        {/* <h4 className="text-uppercase">{t('Grade')}:{" "} <span className="text-muted" style={heading}>{data && data.data.sellerQualification}</span></h4> */}
      </>}
    />
  )
}
export default EmployeeDetails;
const fields = [
  { key: 'teamName', headerName: 'Team' },
  { key: 'teamLeader', headerName: 'Leader' },
  { key: 'recruitmentDateStr', headerName: 'Hiring date' },
  { key: '', headerName: 'Personal phone' },
  { key: 'mobilePhone', headerName: 'Mobile phone' },
  { key: '', headerName: 'Professional phone' },
  { key: '', headerName: 'Registration number' },
  { key: 'numberSocialSecurity', headerName: 'Social Security number' },
  { key: 'birthdayStr', headerName: 'Date of Birth' },
  { key: 'email', headerName: 'E-mail' },
  { key: 'emergencyEmail', headerName: 'Safety email' },
  { key: 'nationality', headerName: 'Nationality' },
  { key: 'bban', headerName: 'RIB' },
  { headerName: 'Contact person' },
  { headerName: 'Photo', photoLink: "photoMedia", photo: "photo" },
  { headerName: 'ID', photoLink: "idCardMedia", photo: "ID" },
  { headerName: 'Proof of address', photoLink: "residenceProofMedia", photo: "residence" },
  { headerName: 'Vital card', photoLink: "securityCardMedia", photo: "vital card" },
  { headerName: 'Employment contract', photoLink: "workContractMedia", photo: "contract" },
]


