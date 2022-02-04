export const URL_BASE_EN: string = 'http://reststage.orgill.com/service.asmx/';
export const URL_BASE_FR: string = 'http://dmwebservice-cafr.orgill.com/service.asmx/';

export const URL_BASE_DEV: string = 'http://reststage.orgill.com/service.asmx/';
export const URL_BASE_PROD: string = 'http://dmwebservice.orgill.com/service.asmx/';

export const URL_LOGIN: string = 'Authenticate';
export const URL_USER_INFO: string = 'get_user';
export const URL_CUSTOMER_LOCATIONS: string = 'customer_locations';

export const URL_PROGRAMS: string = 'programs';
export const URL_CATEGORIES: string = 'categories';
export const URL_SUBCATEGORIES: string = 'subcategories';
export const URL_PRODUCTS: string = 'products';
export const URL_PRODUCT_PROGRAMS: string = 'item_programs';
export const URL_PRODUCT_DETAIL: string = 'product_detail';

export const URL_PRODUCT_SEARCH: string = 'product_search';
export const URL_PRODUCT_PRICE: string = 'item_price';

export const URL_SHOPPING_LISTS_ORDER_PRODUCTS: string = 'order_products';
export const URL_SHOPPING_LISTS_ORDER_CONFIRMATION: string = 'order_confirmation';

// HOT DEALS
export const GET_HOTDEALS_PROGRAM: string = 'get_flashprogram_item';
export const GET_HOTDEALS_GEOFENCE: string = 'geofenceParameters';
export const GET_HOTDEALS_NOTIFICATIONS: string = 'get_notifications';

// SHOPPING LISTS API
export const ADD_SHOPPING_NEW_LIST: string = 'save_shopping_list';
export const DELETE_SHOPPING_LIST: string = 'delete_shopping_list';
export const GET_USER_SHOPPING_LISTS: string = 'user_shopping_lists';
export const CREATE_DEFAULT_LISTS: string = 'create_default_lists';

// SHOPPING LISTS ITEMS API
export const GET_SHOPPING_LIST_ITEMS: string = 'shopping_list_items';
export const ADD_SHOPPING_LIST_ITEM: string = 'add_shopping_list_item';
export const REMOVE_SHOPPING_LIST_ITEM: string = 'remove_shopping_list_item';
export const UPDATE_SHOPPING_LIST_ITEM: string = 'update_shopping_list_item';
export const CHECK_PRODUCT_SHOPPING_LISTS: string = 'check_product_in_shopping_lists';
export const CHECK_PRODUCT_SHOPPING_LIST: string = 'check_product_in_shopping_list';

// PAST PURCHASES
export const USER_PAST_PURCHASES: string = 'user_past_purchases';
export const PURCHASE_ITEMS: string = 'purchase_items';

export const URL_ORDER_HOT_DEAL_PRODUCTS: string = 'order_flashproducts';
export const PRODUCT_IMAGE_BASE_URL: string = 'http://images.orgill.com/200x200/';

// ROUTE TRACKING API?
const TRACKING_API_BASE_URL: string = '//40.122.36.68/api/';

/**
 * params
 * ship_to_no: string
 */
export const GET_STORE_ROUTE_AND_STOPS: string = TRACKING_API_BASE_URL + 'Admin/GetStoreRouteAndStops';

/**
 * request body
 * username: string
 * password: string
 */
export const VENDOR_ACCOUNT_LOGIN: string = TRACKING_API_BASE_URL + 'VendorAccount/Login';

/**
 * params
 * user_token: string
 */
export const GET_CUSTOMER_LOCATIONS: string = TRACKING_API_BASE_URL + 'VendorAccount/GetCustomerLocations';

/**
 * params
 * size: integer
 */
export const TEST_GET_TODAY_CUSTOMERS: string = TRACKING_API_BASE_URL + 'Test/GetTodayCustomers';

/**
 * customerNo
 */
export const ADMIN_GET_CUSTOMER_LOCATIONS: string = TRACKING_API_BASE_URL + 'Admin/GetCustomerLocations';

// DROPSHIP
export const ds_create_savedorder: string = 'ds_create_savedorder';
export const ds_delete_savedorder: string = 'ds_delete_savedorder';
export const ds_form_details: string = 'ds_form_details';
export const ds_form_items: string = 'ds_form_items';
export const ds_form_list: string = 'ds_form_list';
export const ds_get_savedorder_details: string = 'ds_get_savedorder_details';
export const ds_get_savedorder_list: string = 'ds_get_savedorder_list';
export const ds_send_savedorder: string = 'ds_send_savedorder';
export const ds_submit_savedorder: string = 'ds_submit_savedorder';
export const ds_update_savedorder: string = 'ds_update_savedorder';
export const get_usernames: string = 'get_usernames';
export const ds_form_item_search: string = 'ds_form_item_search';

// check submitted orders urls
export const onlineDealerMarketUS: string = 'https://www.orgill.com/onlineDealerMarket.aspx?tab=6';
export const onlineDealerMarketCAD: string = 'https://www.orgill.ca/onlineDealerMarket.aspx?tab=6';
