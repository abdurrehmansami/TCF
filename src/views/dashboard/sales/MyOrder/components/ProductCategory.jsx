import { SwapOutlined } from "@ant-design/icons";
const ProductCategory = ({ name, quantity, onClick, selected }) => {
  return (
    <>
      <div
        style={{
          background: "#fff",
          padding: "10px",
          borderRadius: "8px",
          margin: "10px",
          cursor: "pointer",
          transition: "border 0.3s ease, box-shadow 0.3s ease", // Adding transition for smooth effect
          boxShadow: selected ? "0 0 10px rgba(0, 0, 0, 0.3)" : "none", // Box shadow for selection effect
        }}
        // onClick={onClick}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", width: "80%" }}>
            <span style={{ marginRight: "8px" }}>
              <SwapOutlined />
            </span>
            <span style={{ fontWeight: "bold", fontSize: "16px" }}>{name}</span>
          </div>
          <span>
            <b style={{ fontSize: "16px" }}>{quantity}</b>
          </span>
        </div>
      </div>
    </>
  );
};

export default ProductCategory;
