import { Card } from "antd";

const RouteDetailsCard = ({ routeDetails }) => (
  <Card
    title="Route Details"
    style={{ marginBottom: "16px", borderRadius: "8px", fontSize: "18px" }}
  >
    <p>
      <strong>Route:</strong> {routeDetails.route?.routeName}
    </p>
    <p>
      <strong>Category:</strong> {routeDetails.truck}
    </p>
    <p>
      <strong>Truck:</strong> {routeDetails.truck}
    </p>
  </Card>
);
export default RouteDetailsCard;
