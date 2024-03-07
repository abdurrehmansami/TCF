import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow
} from '@coreui/react'

const Content = ({ title, children, button }) => {
    return (
        <CRow>
            <CCol xs="12">
                <CCard>
                    <CCardHeader>
                    <div className='row'>
                            <div className='col-sm-6'>
                                <h3 className="text-uppercase">{title}</h3>
                            </div>
                            <div className='col-sm-6 text-right'>
                                {button}
                            </div>
                    </div>
                    </CCardHeader>
                    <CCardBody>
                        {children}
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
}

export default Content;
