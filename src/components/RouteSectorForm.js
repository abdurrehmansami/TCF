import { useEffect, useState } from 'react'
import { postData, getData, putData } from 'src/services/NetworkService'
import { Button, Input, Select,Modal} from "antd";
import useFetch from 'src/hooks/useFetch';
import { CircularProgress } from '@material-ui/core';
import Loading from './Loading';
const AntdInputLabel = ({label}) => <label style={{ margin: "5px" }}>{label} : </label>;
const AntdSelect = ({mode, placeholder, options, defaultValue=[], handleChange}) => (
    <Select
        mode={mode}
        allowClear
        showSearch
        style={{ width: '100%', margin: "5px" }}
        placeholder={placeholder}
        options={options}
        defaultValue={defaultValue}
        onChange={(v, arr)=>handleChange(arr)}
    />
);

function RouteSectorForm({isRoute, closeDrawer, data,setRadio}) {
    const { data: sectorData } = useFetch("delivery-sectors");
    const { data: citiesData } = useFetch("cities/filtered-cities?size=1000");

    const [sectors, setSectors] = useState(null);
    const [clients, setClients] = useState(null)
    const [cities, setCities] = useState(null)

    const [selectedSector, setSelectedSector] = useState(null)
    const [selectedClients, setSelectedClients] = useState(null)
    const [selectedCities, setSelectedCities] = useState(null)
    const [routeName, setRouteName] = useState(null)
    const [routeId, setRouteId] = useState(null);
    const [sectorName, setSectorName] = useState(null)
    const [isLoaded, setLoaded] = useState(false)
    const [disbaleBtn, setDisableBtn] = useState(true);

    const edit = data ? true : false;
    const formData = data;
    useEffect(() => {
        if(edit) {
            if(isRoute) {
                setRouteId(formData?.id)
                setRouteName(formData?.routeName)
                setSelectedSector(formData?.sector)
                setSelectedClients(formData?.customers)
                setLoaded(true)
            } else {
                setSectorName(formData?.sectorName)
                setSelectedCities(formData?.cityDtos)
                setLoaded(true)
            }
        }
    }, [edit,formData]);

    useEffect(() => {
        if(selectedSector) {
            let unique_clients = []
            let _clients = []
            getData(`prestashop/customers/filtered-customers?sectorId=${selectedSector.id}`).then((clientData) => {
                clientData?.data?.data?.forEach(element => {
                    let label = element.firstName + ' ' + element.lastName
                    if(!_clients.includes(element.id)){
                        _clients.push({label: label, value: label, id: element.id})
                    }
                });
                if (edit && isRoute) {
                    formData?.customers?.forEach(element => {
                        let label = element.firstName + ' ' + element.lastName
                        if(!_clients.includes(element.id)){
                            _clients.push({label: label, value: label, id: element.id})
                        }
                    });
                }
                setClients(_clients)
            })
        }

    }, [selectedSector])

    useEffect(() => {
        if(sectorData){
            console.log("sectorData", sectorData.data.content);
            let _sectors = []
            sectorData?.data?.content?.forEach(element => {
                _sectors.push({label: element.sectorName, value: element.sectorName, id: element.id})
            });
            setSectors(_sectors)
        }
    }, [sectorData])

    useEffect(() => {
        if(citiesData) {
            console.log("citiesData", citiesData.data.content);
            let _cities = []
            citiesData?.data?.content?.forEach(element => {
                _cities.push({label: element.cityName, value: element.cityName, id: element.id})
            });
            if (edit && !isRoute) {
                formData?.cityDtos?.forEach(element => {
                    _cities.push({label: element.cityName, value: element.cityName, id: element.id})
                });
            }
            setCities(_cities)
        }
    }, [citiesData])
    const submitForm = (e) => {
        e.preventDefault();

        if (
          (isRoute &&
            routeName &&
            selectedSector &&
            selectedClients &&
            selectedClients.length > 0 &&
            selectedClients.every((client) => client.id)) ||
          (!isRoute && sectorName && selectedCities && selectedCities.length > 0)
        ) {
          if (edit) {
            if (isRoute) {
              if (formData.routeName === routeName) setRouteId(formData.id);
              let sector = sectorData?.data?.content?.find((elem) => elem.id === selectedSector.id);
              let cityDtos = sector?.cityDtos.map((elem) => ({ id: elem.id }));
              let customers = selectedClients?.map((elem) => ({ id: elem.id }));
              let reqData = { id: routeId, routeName, sector: { id: sector?.id, cityDtos: cityDtos }, customers: customers };
              putData(`delivery-routes/${routeId}`, reqData)
                .then((res) => {
                  console.log('Edit Route - RESPONSE', res);
                  closeDrawer();
                })
                .catch((err) => console.log('Edit Route - Error ', err));
            } else {
              let cityDtos = selectedCities?.map((elem) => ({ id: elem.id }));
              let reqData = { id: formData.id, sectorName, cityDtos: cityDtos };
              putData(`delivery-sectors/${formData.id}`, reqData)
                .then((res) => {
                  console.log('Edit Sector - RESPONSE', res);
                  closeDrawer();
                })
                .catch((err) => console.log('Edit Sector - Error ', err));
            }
          } else if (isRoute && sectorData) {
            let sector = sectorData?.data?.content?.find((elem) => elem.id === selectedSector.id);
            let cityDtos = sector?.cityDtos.map((elem) => ({ id: elem.id }));
            let customers = selectedClients?.map((elem) => ({ id: elem.id }));
            let reqData = { routeName, sector: { id: sector?.id, cityDtos }, customers };
            postData("delivery-routes", reqData)
              .then((res) => {
                console.log('Add Route - RESPONSE', res);
                closeDrawer();
                setRadio('Routes');
              })
              .catch((err) => console.log('Add Route - Error ', err));
          } else {
            let cityDtos = selectedCities?.map((elem) => ({ id: elem.id }));
            let reqData = { sectorName, cityDtos };
            postData("delivery-sectors", reqData)
              .then((res) => {
                console.log('ADD SECTOR - RESPONSE', res);
                closeDrawer();
                setRadio('Sectors');
              })
              .catch((err) => console.log('ADD SECTOR - Error ', err));
          }
        } else {
          Modal.warn({
            title: 'Warning',
            content: 'Please fill all the fields',
            onOk() {
              console.log('OK');
            },
          });
        }
      };

    return (
        edit && !isLoaded ? <Loading/> :
        <form onSubmit={submitForm}>
            {(isRoute && sectors) ? <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <AntdInputLabel label='New Route' />
                    <Input allowClear placeholder='Add a name' style={{ margin: "5px" }} value={routeName} onChange={e=>setRouteName(e.target.value)}/>
                    <AntdInputLabel label='Sector' />
                    <AntdSelect placeholder="Select a Sector" defaultValue={selectedSector && selectedSector.sectorName} options={sectors} handleChange={setSelectedSector} />
                    <AntdInputLabel label='Client' />
                    <AntdSelect defaultValue={selectedClients && selectedClients.length > 0 ? selectedClients.map(o => o.firstName + ' ' + o.lastName).join(",").split(",") : undefined}  mode="multiple" placeholder="Select one or more Clients" options={clients} handleChange={setSelectedClients} />
                </div>
            </div>
            :
            (!isRoute && cities) ? <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <AntdInputLabel label='New Sector' />
                    <Input allowClear placeholder='Add a name' style={{ margin: "5px" }} value={sectorName} onChange={e=>setSectorName(e.target.value)}/>
                    <AntdInputLabel label='Cities' />
                    <AntdSelect mode="multiple" defaultValue={selectedCities && selectedCities.length > 0 ? selectedCities.map(o => o.cityName).join(",").split(","):undefined} placeholder="Select one or more Cities" options={cities} handleChange={setSelectedCities} />
                </div>
            </div>
            :
            <div style={{ color: '#707577', marginTop: '25%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress color="inherit" /></div>
            }
            <div style={{display : "flex " , justifyContent : "center"}}>
                    <Button htmlType="button" style ={{width : "370px"}} onClick={closeDrawer}>Cancel</Button>
                    <Button type="primary" htmlType="submit" style ={{width : "370px" , marginLeft : "10px"}}>Create</Button>
            </div>
        </form>
    )
}
export default RouteSectorForm;
