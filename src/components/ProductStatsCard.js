import { Card, Col, Progress, Row, Typography } from "antd"
const { Text, Title } = Typography;

export const ProductStatsCard = ({name, data1, data2, percentage, progressStrokeColor, progressTrailColor, heading1, heading2, progressText}) => {
    return(
        <Card size="small" style={{margin: '5px 0', height: 250, width: 190, boxShadow: '2px 3px 3px rgba(0, 0, 0, .05)'}}>
            <div style={{margin: 0, padding: 0, textAlign: 'center', verticalAlign: 'center'}}>
                <Title style={{color: '#805080', fontSize: 12, lineHeight: 1.4, marginBottom: 15, height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>{name}</Title>
                <Row style={{width: '100%'}}>
                    <Col span={12}>
                        <div style={{display: 'flex', flexDirection: 'column', marginBottom: 4}}><Text style={{color: '#a0a0a0', fontSize: 11}}>{heading1}</Text><Title style={{color: '#a0a0a0', fontSize: 18, fontFamily: 'sans-serif', marginTop: 0}}>{data1}</Title></div>
                    </Col>
                    <Col span={12}>
                        <div style={{display: 'flex', flexDirection: 'column', marginBottom: 4}}><Text style={{color: '#606060', fontSize: 11}}>{heading2}</Text><Title style={{color: '#606060', fontSize: 18, fontFamily: 'sans-serif', marginTop: 0}}>{data2}</Title></div>
                    </Col>
                </Row>
                <Progress type='dashboard' strokeLinecap="butt" strokeColor={progressStrokeColor} trailColor={progressTrailColor} percent={(percentage).toFixed(1)} format={(perc) => (<div style={{display: 'flex', flexDirection: 'column'}}><Title level={3} style={{marginBottom: 0, color: progressStrokeColor}}>{perc}%</Title><Text style={{color: progressStrokeColor}}>{progressText}</Text></div>)} />
            </div>
        </Card>
    )
}