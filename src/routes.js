import React from "react";
const ProductSummary = React.lazy(()=>import("./views/dashboard/summary/ProductSummary"));

const MyOrder = React.lazy(() => import("./views/dashboard/sales/MyOrder/Order"));
const StockMovement = React.lazy(() => import("./views/dashboard/stock/StockMovement"));
const CurrentStock = React.lazy(() => import("./views/dashboard/reports/CurrentStock"));
// const CurrentStock = React.lazy(() => import("./views/dashboard/reports/CurrentStock"));

const Regions = React.lazy(() => import("./views/dashboard/region/Regions"));
const RegionForm = React.lazy(() =>
  import("./views/dashboard/region/RegionForm")
);
const Agencies = React.lazy(() => import("./views/dashboard/agency/Agencies"));
const AgencyForm = React.lazy(() =>
  import("./views/dashboard/agency/AgencyForm")
);
const AgencyDetails = React.lazy(() =>
  import("./views/dashboard/agency/AgencyDetails")
);
const Employees = React.lazy(() =>
  import("./views/dashboard/employee/Employees")
);
const EmployeeForm = React.lazy(() =>
  import("./views/dashboard/employee/EmployeeForm")
);
const EmployeeDetails = React.lazy(() =>
  import("./views/dashboard/employee/EmployeeDetails")
);
const Teams = React.lazy(() => import("./views/dashboard/team/Teams"));
const TeamForm = React.lazy(() => import("./views/dashboard/team/Teamform.js"));
const TeamDetails = React.lazy(() =>
  import("./views/dashboard/team/TeamDetails")
);
const Partners = React.lazy(() => import("./views/dashboard/partner/Partners"));
const PartnerForm = React.lazy(() =>
  import("./views/dashboard/partner/PartnerForm")
);
const PartnerDetails = React.lazy(() =>
  import("./views/dashboard/partner/PartnerDetails")
);
const Roles = React.lazy(() => import("./views/dashboard/role/Roles"));
const RoleForm = React.lazy(() => import("./views/dashboard/role/RoleForm"));
const Dashboard = React.lazy(() => import("./views/dashboard/Dashboard"));
const MyProfile = React.lazy(() =>
  import("./views/dashboard/MyProfile/MyProfile")
);
const Password = React.lazy(() =>
  import("./views/dashboard/password/Password")
);
const Orders = React.lazy(() => import("./views/dashboard/order/Orders"));
const OrderForm2 = React.lazy(() =>
  import("./views/dashboard/order/OrderForm2")
);
const OrderDetails = React.lazy(() =>
  import("./views/dashboard/order/OrderDetails")
);
const Products = React.lazy(() => import("./views/dashboard/product/Products"));
const ProductForm = React.lazy(() =>
  import("./views/dashboard/product/ProductForm")
);

const RoutesSectors = React.lazy(()=> import("./components/RoutesSectors"));
// const TourForm = React.lazy(()=>
//  import("./components/RouteSectorForm")
//  );

const ProductDetails = React.lazy(() =>
  import("./views/dashboard/product/ProductDetails")
);
const Categories = React.lazy(() =>
  import("./views/dashboard/category/Categories")
);
const CategoryForm = React.lazy(() =>
  import("./views/dashboard/category/CategoryForm")
);
const CategoryDetail = React.lazy(() =>
  import("./views/dashboard/category/CategoryDetail")
);
const Warehouses = React.lazy(() =>
  import("./views/dashboard/warehouses/Warehouses")
);
const WarehouseForm = React.lazy(() =>
  import("./views/dashboard/warehouses/WarehouseForm")
);
const WarehouseDetails = React.lazy(() =>
  import("./views/dashboard/warehouses/WarehouseDetail")
);
const ProductSales = React.lazy(() =>
  import("./views/dashboard/sales/SalesOrder")
);
const PrestashopOrders = React.lazy(() =>
  import("./views/dashboard/sales/PrestashopOrders")
);
const PrestashopOrderDetail = React.lazy(() =>
  import("./views/dashboard/sales/PrestashopOrderDetail")
);
const DelieveryDetails = React.lazy(() =>
  import("./views/dashboard/sales/DelieveryDetails")
);
const ViewPrestashopOrderDetails = React.lazy(() =>
  import("./views/dashboard/sales/ViewPrestashopOrderDetails")
);
const Adjustment = React.lazy(() =>
  import("./views/dashboard/Adjustment/Adjustment")
);
const PickOrder = React.lazy(() => import("./views/dashboard/sales/PickOrder"));
const StockCount = React.lazy(() =>
  import("./views/dashboard/stockcounts/StockCount")
);
const OrderToDeliver = React.lazy(() =>
  import("./views/dashboard/sales/DeliveryOrders.js")
);
const InventoryOrders = React.lazy(() =>
  import("./views/dashboard/reports/InventoryOrdered.js")
);
const ProductStock = React.lazy(() => import('./views/dashboard/reports/ProductStock.js'))
const AllOrders = React.lazy(() => import('./views/dashboard/sales/allOrders.js'))

const routes = [
  {path: '/current-stock', name: 'Current Stock', component: CurrentStock},
  {path: '/stock-movement', name: 'Stock Movement', component: StockMovement},
  {path: '/product-summary', name: 'Product Summary', component: ProductSummary},
  {path: '/myorder', name: 'My Order', component: MyOrder},
  { path: "/", exact: true, name: "HOME" },
  { path: "/dashboard", name: "DASHBOARD", component: Dashboard },
  { path: "/employees/add", name: "NEW_EMPLOYEE", component: EmployeeForm },
  { path: "/employees/edit", name: "EDIT_EMPLOYEE", component: EmployeeForm },
  {
    path: "/employees/:id",
    name: "EMPLOYEE_DETAILS",
    component: EmployeeDetails,
  },
  { path: "/employees", name: "EMPLOYEES", component: Employees },
  { path: "/regions/add", name: "NEW_REGION", component: RegionForm },
  { path: "/regions/edit", name: "EDIT_REGION", component: RegionForm },
  { path: "/regions", name: "REGIONS", component: Regions },
  { path: "/agencies/add", name: "NEW_AGENCY", component: AgencyForm },
  { path: "/agencies/edit", name: "AGENCY", component: AgencyForm },
  { path: "/agencies/:id", name: "AGENCY_DETAILS", component: AgencyDetails },
  { path: "/agencies", name: "AGENCIES", component: Agencies },
  { path: "/teams/add", name: "NEW_TEAM", component: TeamForm },
  { path: "/teams/edit", name: "TEAMS", component: TeamForm },
  { path: "/teams/:id", name: "TEAMS", component: TeamDetails },
  { path: "/teams", name: "TEAMS", component: Teams },
  { path: "/partners/add", name: "NEW_PARTNER", component: PartnerForm },
  { path: "/partners/edit", name: "PARTNERS", component: PartnerForm },
  { path: "/partners/:id", name: "PARTNERS", component: PartnerDetails },
  { path: "/partners", name: "PARTNERS", component: Partners },
  { path: "/roles/add", name: "NEW_ROLE", component: RoleForm },
  { path: "/roles/edit", name: "UPDATE_ROLE", component: RoleForm },
  { path: "/roles", name: "ROLES", component: Roles },
  { path: "/myprofile", name: "MYPROFILE", component: MyProfile },
  { path: "/changepassword", name: "PASSWORD", component: Password },
  { path: "/orders/add", name: "NEW_ORDER", component: OrderForm2 },
  // { path: '/orders/edit', name: 'EDIT ORDER', component: OrderForm },
  { path: "/orders/edit", name: "EDIT_ORDER", component: OrderForm2 },
  { path: "/orders/:id", name: "ORDER_DETAILS", component: OrderDetails },
  { path: "/new/:id", name: "ORDER_DETAIL", component: OrderDetails },
  { path: "/new", name: "NEW_ORDERS", component: Orders },
  { path: "/validated/:id", name: "ORDERS_DETAIL", component: OrderDetails },
  { path: "/validated", name: "VALIDATED_ORDERS", component: Orders },
  { path: "/confirmed/:id", name: "ORDER_DETAIL", component: OrderDetails },
  { path: "/confirmed", name: "CONFIRMED_ORDERS", component: Orders },
  { path: "/received/:id", name: "ORDER_DETAIL", component: OrderDetails },
  { path: "/received", name: "RECEIVED_ORDERS", component: Orders },
  { path: "/stocked/:id", name: "ORDER_DETAIL", component: OrderDetails },
  { path: "/stocked", name: "STOCKED_ORDERS", component: Orders },
  { path: "/published/:id", name: "ORDER_DETAIL", component: OrderDetails },
  { path: "/published", name: "PUBLISHED_ORDERS", component: Orders },
  { path: "/cancelled/:id", name: "ORDER_DETAIL", component: OrderDetails },
  { path: "/cancelled", name: "CANCELLED_ORDERS", component: Orders },
  { path: "/orders", name: "ORDERS", component: Orders },
  { path: "/products/add", name: "NEW_PRODUCT", component: ProductForm },
  // {path : "/tourSector/add" , name : "EDIT_TOUR" , component : TourForm},
  { path: "/routes_&_sectors", name: "ROUTES & SECTORS", component: RoutesSectors},
  { path: "/products/edit", name: "EDIT_PRODUCT", component: ProductForm },
  { path: "/products/:id", name: "PRODUCT_DETAILS", component: ProductDetails },
  { path: "/products", name: "PRODUCTS", component: Products },
  { path: "/categories/add", name: "NEW_CATEGORY", component: CategoryForm },
  { path: "/categories/edit", name: "EDIT_CATEGORY", component: CategoryForm },
  {
    path: "/categories/:id",
    name: "CATEGORY_DETAIL",
    component: CategoryDetail,
  },
  { path: "/categories", name: "CATEGORIES", component: Categories },
  { path: "/warehouses/add", name: "NEW_WAREHOUSE", component: WarehouseForm },
  {
    path: "/warehouses/edit",
    name: "EDIT_WAREHOUSE",
    component: WarehouseForm,
  },
  { path: "/warehouses/:id", name: "WAREHOUSES", component: WarehouseDetails },
  { path: "/warehouses", name: "WAREHOUSES", component: Warehouses },
  {
    path: "/sales-orders/:id",
    name: "ECOMMERCE_ORDER_DETAIL",
    component: ViewPrestashopOrderDetails,
  },
  { path: "/sales-orders", name: "SALES_ORDERS", component: RoutesSectors },
  { path: "/product-sales", name: "PRODUCT_SALES", component: ProductSales },
  {
    path: "/orderDetail/:id",
    name: "EDIT_ECOMMERCE_ORDER_DETAIL",
    component: PrestashopOrderDetail,
  },
  {
    path: "/pickOrder/:id",
    name: "DELIEVERY_DETAIL",
    component: DelieveryDetails,
  },
  {
    path: "/ordersToDeliver/:id",
    name: "DELIEVERY_DETAIL",
    component: DelieveryDetails,
  },
  {
    path: "/stock-counts/:id",
    name: "STOCK_COUNT_DETAIL",
    component: Adjustment,
  },
  { path: "/pickOrder", name: "PICK_ORDER", component: PickOrder },
  { path: "/stock-counts", name: "STOCK_COUNTS", component: StockCount },
  {
    path: "/ordersToDeliver",
    name: "ORDERS_TO_DELIVER",
    component: MyOrder,
  },
  {
    path: "/orderedinventory",
    name: "INVENTORY_ORDERED",
    component: InventoryOrders,
  },
  {
    path: "/productstock",
    name: 'Products Stock',
    component: ProductStock
  },
  {
    path: '/all-prestashop-orders',
    name: 'All Orders',
    component: AllOrders
  },
];

export default routes;
