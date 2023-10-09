export const URL_BASE_EN: string = 'https://reststage.orgill.com/service.asmx/';
export const URL_BASE_FR: string = 'https://dmwebservice-cafr.orgill.com/service.asmx/';

export const URL_BASE_DEV: string = 'https://reststage.orgill.com/service.asmx/';
export const URL_BASE_DEV_NEW: string = 'https://reststage.orgill.com/api/v1/';
export const URL_BASE_PROD: string = 'https://dmwebservice.orgill.com/service.asmx/';
export const URL_BASE_PROD_NEW: string = 'https://ozoneapi.orgill.com/api/v1/';

export const URL_LOGIN: string = 'authenticate';
export const URL_USER_INFO: string = 'user';
export const URL_CUSTOMER_LOCATIONS: string = 'general/customer_locations';

export const URL_PROGRAMS: string = 'general/programs';
export const URL_CATEGORIES: string = 'categories';
export const URL_SUBCATEGORIES: string = 'categories';
export const URL_PRODUCTS: string = 'products';
export const URL_PRODUCT_PROGRAMS: string = 'item/programs';
export const URL_PRODUCT_DETAIL: string = 'products';

export const URL_PRODUCT_SEARCH: string = 'products/search';
export const URL_PRODUCT_PRICE: string = 'item/program/price';

export const URL_PAST_PURCHASES: string = 'customer/item/orderhistory';
export const URL_INVENTORY_DETAILS: string = 'item/inventoryonhand';
export const URL_RETAIL_PRICE: string = 'item/retailprice';

export const URL_SHOPPING_LISTS_ORDER_PRODUCTS: string = 'order/products ';
export const URL_SHOPPING_LISTS_ORDER_CONFIRMATION: string = 'order/confirmation';

// HOT DEALS
export const GET_HOTDEALS_PROGRAM: string = 'item/flash';
export const GET_HOTDEALS_GEOFENCE: string = 'general/geofenceParameters';
export const GET_HOTDEALS_NOTIFICATIONS: string = 'general/notifications';

// SHOPPING LISTS API
export const ADD_SHOPPING_NEW_LIST: string = 'shoppinglist';
export const DELETE_SHOPPING_LIST: string = 'shoppinglist';
export const GET_USER_SHOPPING_LISTS: string = 'shoppinglist';
export const CREATE_DEFAULT_LISTS: string = 'shoppinglist/default';

// SHOPPING LISTS ITEMS API
export const GET_SHOPPING_LIST_ITEMS: string = 'shoppinglist/items';
export const ADD_SHOPPING_LIST_ITEM: string = 'shoppinglist/item';
export const REMOVE_SHOPPING_LIST_ITEM: string = 'shoppinglist/item';
export const UPDATE_SHOPPING_LIST_ITEM: string = 'shoppinglist/item';
export const CHECK_PRODUCT_SHOPPING_LISTS: string = 'shoppinglist/item';
export const CHECK_PRODUCT_SHOPPING_LIST: string = 'shoppinglist/item';

// PAST PURCHASES
export const USER_PAST_PURCHASES: string = 'pastpurchase';
export const PURCHASE_ITEMS: string = 'pastpurchase';

export const URL_ORDER_HOT_DEAL_PRODUCTS: string = 'order/flashproducts';
export const PRODUCT_IMAGE_BASE_URL: string = 'https://images.orgill.com/200x200/';

// ROUTE TRACKING API?
const TRACKING_API_BASE_URL: string = 'https://40.122.36.68/api/';
// const TRACKING_API_BASE_URL_PROD: string = 'https://168.61.170.88/api/';
export const TRACKING_API_BASE_URL_PROD: string = 'https://ozonetransportation.orgill.com/api/';

/**
 * params
 * ship_to_no: string
 */
export const GET_STORE_ROUTE_AND_STOPS: string = 'Admin/GetStoreRouteAndStops';

/**
 * request body
 * username: string
 * password: string
 */
export const VENDOR_ACCOUNT_LOGIN: string = 'VendorAccount/Login';

/**
 * params
 * user_token: string
 */
export const GET_CUSTOMER_LOCATIONS: string = 'VendorAccount/GetCustomerLocations';

/**
 * params
 * size: integer
 */
export const TEST_GET_TODAY_CUSTOMERS: string = 'Test/GetTodayCustomers';

/**
 * customerNo
 */
export const ADMIN_GET_CUSTOMER_LOCATIONS: string = 'Admin/GetCustomerLocations';

// DROPSHIP
export const ds_create_savedorder: string = 'dssavedorders';
export const ds_delete_savedorder: string = 'dssavedorders';
export const ds_form_details: string = 'dsforms';
export const ds_form_items: string = 'dsforms/items';
export const ds_form_list: string = 'dsforms';
export const ds_get_savedorder_details: string = 'dssavedorders/items';
export const ds_get_savedorder_list: string = 'dssavedorders';
export const ds_send_savedorder: string = 'dssavedorders/send';
export const ds_update_savedorder: string = 'dssavedorders';
export const get_usernames: string = 'users';
export const ds_form_item_search: string = 'dsforms/items/search';

// check submitted orders urls
export const onlineDealerMarketUS: string =
  'https://www.orgill.com/login.aspx?redirecturl=/onlineDealerMarket.aspx?tab=6';
export const onlineDealerMarketCAD: string =
  'https://www.orgill.ca/login.aspx?redirecturl=/onlineDealerMarket.aspx?tab=6';

// DASHBOARD
export const GetGeneralStatistics: string = TRACKING_API_BASE_URL_PROD + 'Admin/GetGeneralStatistics';
export const GetTrafficStatistics: string = TRACKING_API_BASE_URL_PROD + 'Admin/GetTrafficStatistics';
export const GetStopsStatistics: string = TRACKING_API_BASE_URL_PROD + 'Admin/GetStopsStatistics';
export const GetStoreRouteAndStops: string = TRACKING_API_BASE_URL_PROD + 'Admin/GetStoreRouteAndStops';
export const GetDcAndRoutes: string = TRACKING_API_BASE_URL_PROD + 'Admin/GetDcAndRoutes';
export const GetCustomersByDcAndRoute: string = TRACKING_API_BASE_URL_PROD + 'Admin/GetCustomersByDcAndRoute';
export const GetDeliveriesDashboard: string = TRACKING_API_BASE_URL_PROD + 'Admin/GetDeliveriesDashboard';
export const GetDeliveriesDashboardExcel: string = TRACKING_API_BASE_URL_PROD + 'Admin/GetDeliveriesDashboardExcel';
