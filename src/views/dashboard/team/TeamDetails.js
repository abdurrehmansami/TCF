import { useTranslation } from 'react-i18next'
import useFetch from '../../../hooks/useFetch'
import Content from '../../../components/Content'
function TeamsDetails(props) {
  const { t } = useTranslation();
  const id = props.data.id
  const { data: team } = useFetch('teams/' + id)
  const thumb = {
    display: 'inline-flex',
    borderRadius: 2,
    border: '1px solid #eaeaea',
    marginBottom: 8,
    marginRight: 8,
    width: 120,
    height: 150,
    padding: 4,
    boxSizing: 'border-box'
  };
  const thumbInner = {
    display: 'flex',
    minWidth: 0,
    overflow: 'hidden'
  };
  const img = {
    display: 'block',
    width: 'auto',
    height: '100%'
  };

  const members = team && team.data.employeeDtos.map((o) =>
    <div key={o.id}>
      <div style={thumb}>
        <div style={thumbInner}>
          <img key={o.id} src={o.photoMedia ? o.photoMedia.path : '/avatars/5.jpg'} alt ="" style={img} />
        </div>
      </div>
      <br />{o.name} </div>
  );
  return (
    <Content title={t('Team')} >
      <h3 className="text-uppercase">{t('Team')}:<small className="text-muted" style={{ fontWeight: "bold" }}>{team && team.data.name}</small></h3>
      {team && team.data &&
        <div style={thumb}>
          <div style={thumbInner}>
            <img src={team.data.photoMedia ? team.data.photoMedia.path : "/avatars/5.jpg"} style={img} alt="" />
          </div>
        </div>}
      <br />
      <div className="navigation">
      </div>
      {team && team.data.employeeDtos &&
        <h5 className="text-uppercase" style={{ fontWeight: "bold" }}>{t('Team Leader')} :
          <small style={{ fontWeight: "bold" }}>{team.data.employeeDtos[0].teamLeader}</small></h5>}
      <label>{t('Members')}</label>
      <br />
      <div className="row">
        {members}</div>
    </Content>
  )
}
export default TeamsDetails;