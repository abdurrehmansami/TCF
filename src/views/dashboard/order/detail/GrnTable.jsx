import moment from "moment";
const GrnTable = ({ grnList, productMap, locationMap }) => {
  return (
    <>
      {grnList?.map((grn, index) => (
        <>
          <div
            className="table-responsive"
            style={{ border: "2px solid #ced2d8" }}
          >
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr>
                  <td rowspan="1" colspan="8">
                    <b>GRN Details</b>
                  </td>
                  <td rowspan="1" colspan="3" className="text-right">
                    <b>Created on: </b>&nbsp;
                    {moment(grn?.createdOn).isValid()
                      ? moment(grn?.createdOn).format("DD/MM/YYYY")
                      : ""}
                  </td>
                </tr>
                <tr>
                  <th rowSpan={2}>#</th>
                  <th rowSpan={2} colSpan={1}>
                    Product Name
                  </th>
                  <th rowSpan={2} colSpan={1}>
                    Lot number
                  </th>
                  <th rowSpan={2} colSpan={1}>
                    Expiry
                  </th>
                  <th rowSpan={1} colSpan={2} className="text-center">
                    Quantity
                  </th>
                  <th rowSpan={1} colSpan={2} className="text-center">
                    Units
                  </th>
                  <th rowSpan={2} colSpan={1}>
                    Pallets
                  </th>
                  <th rowSpan={2} colSpan={1}>
                    Location
                  </th>
                  <th rowSpan={2} colSpan={1}>
                    Photos
                  </th>
                </tr>
                <tr>
                  <th rowSpan={1} colSpan={1}>
                    Received
                  </th>
                  <th rowSpan={1} colSpan={1}>
                    Damaged
                  </th>
                  <th rowSpan={1} colSpan={1}>
                    Received
                  </th>
                  <th rowSpan={1} colSpan={1}>
                    Damaged
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from(grn.productLocationMap)?.map(([k, val], i) => {
                  return (
                    <>
                      {val?.map((v, index) => (
                        <tr key={index}>
                          {index === 0 && (
                            <>
                              <td rowSpan={val.length}>{i + 1}</td>
                              <td rowSpan={val.length}>
                                {productMap.get(k)?.name}
                              </td>
                            </>
                          )}
                          <td className="text-right">{v.lotNumber}</td>
                          <td className="text-center">
                            {moment(v.expiry).isValid()
                              ? moment(v.expiry).format("DD/MM/YYYY")
                              : ""}
                          </td>
                          <td className="text-right">{v.receivedQuantity}</td>
                          <td className="text-right">{v.damagedQuantity}</td>
                          <td className="text-right">
                            {v.receivedNumberofUnits}
                          </td>
                          <td className="text-right">
                            {v.damageNumberOfUnits}
                          </td>
                          <td className="text-right">{v.receivedPallets}</td>
                          <td>{locationMap.get(v.locationId)?.name}</td>
                          <td>{v.grnStatus}</td>
                        </tr>
                      ))}
                    </>
                  );
                })}

                <tr>
                  <td colSpan="11">
                    <b>Notes : &nbsp;</b>
                    <em>{grn?.note}</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <br />
          <br />
        </>
      ))}
    </>
  );
};

export default GrnTable;
