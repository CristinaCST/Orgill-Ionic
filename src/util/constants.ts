export const O_ZONE = 'O_ZONE';

export const OK = 'ok';
export const SAVE = 'save';
export const NO = 'no';
export const CANCEL = 'cancel';
export const CONTINUE = 'continue';

export const APP_CONFIGURATION_INFO = 'appConfigurationInfo';

export const DECIMAL_NUMBER = 2;

/**
* Marker : App Language
* =============================================================================================
*/

export const LANG_EN = 'en';
export const LANG_FR = 'fr';
export const DEVICE_LANGUAGE = 'deviceLanguage';

/**
* Marker : Server Requests
* =============================================================================================
*/

export const REQUEST_UNAUTHORIZED_ERROR = 401;
export const REQUEST_STATUS_OK = 200;
export const REQUEST_TIMEOUT_ERROR = 'TimeoutError';

export const TIMEOUT_INTERVAL = 30000; // 30 seconds
export const TIMEOUT_DEFAULT_INTERVAL = 30000; // 30 seconds

/**
* Marker : DateTime Formats
* =============================================================================================
*/

export const DATETIME_FORMAT_MONTH_DAY_YEAR = 'MM/DD/YYYY';

/**
* Marker : Loading Dialog
* =============================================================================================
*/

export const LOADING_ALERT_CONTENT_LOGIN = 'loading_content_login';
export const LOADING_ALERT_CONTENT_PROGRAMS = 'loading_content_programs';
export const LOADING_ALERT_CONTENT_CATEGORIES = 'loading_content_categories';
export const LOADING_ALERT_CONTENT_PRODUCTS = 'loading_content_products';
export const LOADING_ALERT_CONTENT_ADD_TO_LIST = 'loading_content_add_to_list';
export const LOADING_ALERT_CONTENT_ORDER_PRODUCTS = 'loading_content_order_products';
export const LOADING_ALERT_CONTENT_DELETE_FROM_LIST = 'loading_content_delete_products_from_list';
export const LOADING_ALERT_CONTENT_CUSTOMER_LOCATIONS = 'loading_content_customer_locations';

/**
* Marker : Popover Alert
* =============================================================================================
*/

export const POPOVER_NETWORK_OFFLINE = 'popoverOfflineNetwork';
export const POPOVER_NEW_SHOPPING_LIST = 'popoverNewList';
export const POPOVER_NEW_DATABASE = 'newDatabase';
export const POPOVER_ORDER_CONFIRMATION = 'orderConfirmation';
export const POPOVER_DELETE_LIST_CONFIRMATION = 'deleteListConfirmation';
export const POPOVER_LOGOUT = 'popoverLogout';
export const POPOVER_ERROR = 'popoverError';
export const POPOVER_EXPIRED_ITEMS_TITLE = 'shopping_list_expired_items_title';
export const POPOVER_EXPIRED_ITEMS_MESSAGE = 'shopping_list_expired_items_message';

export const POPOVER_NETWORK_OFFLINE_MESSAGE = 'lost_internet_connection';
export const POPOVER_TIMEOUT_ERROR_MESSAGE = 'request_timeout_error';

export const POPOVER_CAMERA_PERMISSION_NOT_GRANTED = 'popoverNoCameraPerm';

/**
* Marker : EVENT TOPICS
* =============================================================================================
*/

export const EVENT_NETWORK_ONLINE = 'networkOnline';
export const EVENT_NETWORK_OFFLINE = 'networkOffline';
export const EVENT_REQUEST_TIMEOUT = 'requestTimeout';

export const EVENT_UPDATE_APP_CONFIGURATION_INFO = 'updateAppConfiguration';

export const EVENT_USER_LOGGED_IN = 'eventUserLoggedIn';
export const EVENT_USER_LOGGED_OUT = 'eventUserLoggedOut';
export const EVENT_USER_IS_LOGGING_OUT = 'eventUserIsLoggingOut';
export const EVENT_NAVIGATE_TO_PAGE = 'eventNavigateToPage';
export const EVENT_CATEGORIES_PROGRAM_SELECTED = 'eventProgramSelected';

export const EVENT_SHOPPING_LIST_NEW_FROM_MENU = 'eventShoppingListNewMenu';
export const EVENT_SHOPPING_LIST_NEW_FROM_DETAILS = 'eventShoppingListNewDetails';
export const EVENT_SHOPPING_LIST_SELECTED = 'eventShoppingListSelected';
export const EVENT_SHOPPING_LISTS_UPDATE = 'eventShoppingListsUpdate';
export const EVENT_SHOPPING_LISTS_DELETE = 'eventDeleteList';
export const EVENT_UPDATE_LIST_ITEMS = 'eventUpdateListItems';
export const EVENT_PURCHASE_LIST_ITEMS = 'eventPurchaseListItems';

export const EVENT_SHOW_HOME_PAGE = 'homePage';

export const EVENT_NEW_SEARCH = 'newSearch';

export const EVENT_GO_TO_SHOPPING_LISTS_PAGE = 'goToListsPage';

/**
* Marker : User
* =============================================================================================
*/

export const USER = 'user';
export const USER_TOKEN = 'UserToken';
export const USER_SESSION_TIMESTAMP = 'sessionTimestamp';

/**
* Marker : Login/Logout
* =============================================================================================
*/

export const LOGIN_ERROR_TITLE = 'login_error_title';
export const LOGIN_ERROR_INVALID = 'login_error_invalid';
export const LOGIN_ERROR_REQUIRED = 'login_error_required';

export const LOGOUT_TITLE = 'logout_title';
export const LOGOUT_MESSAGE = 'logout_message';
export const LOGOUT_KEEP_DATA = 'logoutKeepData';
export const LOGOUT_DELETE_DATA = 'logoutDeleteData';

/**
* Marker : MENU
* =============================================================================================
*/

export const MENU_SEARCH_CODE = 'menu_search_code';
export const MENU_SEARCH_SCAN = 'menu_search_scan';
export const MENU_ORDERING_HISTORY = 'menu_ordering_history';
export const MENU_ACCOUNT_OFFLINE = 'menu_account_offline';
export const MENU_ABOUT = 'menu_about';
export const MENU_ACCOUNT_LOGOUT = 'menu_account_logout';

/**
* Marker : Programs
* =============================================================================================
*/

export const PROGRAM_NUMBER = 'progNumber';
export const REGULAR_CATALOG = 'regular_catalog';

export const MARKET_ONLY_PROGRAM = 'Y';
export const REGULAR_PROGRAM = 'N';

/**
* Marker : Catalog
* =============================================================================================
*/

export const PRODUCT_SUMMARY_TAB = 'summary_tab';
export const PRODUCT_PRICING_TAB = 'pricing_tab';

export const CATEGORIES_PER_PAGE = 100;
export const PRODUCTS_PER_PAGE = 20;

/**
* Marker : Search
* =============================================================================================
*/
export const SEARCH_INVALID_INPUT = 'search_invalid_input';
export const SEARCH_RESULTS_PER_PAGE = 20;
export const NO_PRODUCTS_FOUND = 'no_products_found';
export const SCAN_RESULT_SCANNED = 'scan_result_scanned';
export const SCAN_RESULTS_SEARCHING = 'scan_result_searching';

export const SCAN_MARKET_ONLY_PRODUCT = 'scan_market_only_product';
export const SCAN_REGULAR_PRODUCT = 'scan_regular_product';

export const SCAN_NO_PERMISSION_ALERT = 'scan_no_permission_alert';
export const SCAN_GRANT_PERMISSION = 'scan_grant_button';
export const SCAN_NO_PERMISSION_ALERT_RESULT = 'scan_no_permission_alert_result';
export const SCAN_ERROR = 'scan_error';

/**
* Marker : Shopping Lists
* =============================================================================================
*/

export const DEFAULT_LIST_ID = 1;
export const MARKET_ONLY_LIST_ID = 2;

export const SHOPPING_LIST_ADD_ITEM = 'button_add_to_list';
export const INVALID_QUANTITY_ERROR = 'invalid_quantity_error';
export const Y_SHELF_PACK_QUANTITY_WARNING = 'Y_shelf_pack_quantity_warning';
export const X_SHELF_PACK_QUANTITY_WARNING = 'X_shelf_pack_quantity_warning';

export const SHOPPING_LIST_NEW_DIALOG_TITLE = 'new_list_title';
export const SHOPPING_LIST_NEW_DIALOG_MESSAGE = 'new_list_message';
export const SHOPPING_LIST_NEW_DIALOG_HINT_NAME = 'new_list_hint_name';
export const SHOPPING_LIST_NEW_DIALOG_MANDATORY_NAME_ERROR = 'new_list_mandatory_name_error';
export const SHOPPING_LIST_NEW_DIALOG_NAME_EXISTS_ERROR = 'new_list_name_exists';
export const SHOPPING_LIST_NEW_DIALOG_HINT_DESCRIPTION = 'new_list_hint_desc';

export const SHOPPING_LIST_DEFAULT = 'shopping_lists_default';
export const SHOPPING_LIST_CUSTOM_DESCRIPTION = 'shopping_list_custom_desc';
export const SHOPPING_LIST_EXISTING_PRODUCT = 'shopping_list_existing_product';
export const SHOPPING_LIST_NO_PROGRAM_TITLE = 'shopping_list_no_program_title';
export const SHOPPING_LIST_NO_PROGRAM_MESSAGE = 'shopping_list_no_program_message';

export const SHOPPING_LIST_NO_ITEMS_TITLE = 'shopping_list_no_items_title';
export const SHOPPING_LIST_NO_ITEMS_MESSAGE = 'shopping_list_no_items_message';

export const SHOPPING_LIST_ADDED_IN_MARKET_LIST = 'shopping_list_added_in_market_list';
export const SHOPPING_LIST_MARKET_ONLY_PRODUCT = 'shopping_list_market_only_product';
export const SHOPPING_LIST_DEFAULT_PRODUCT = 'shopping_list_default_product';

export const SHOPPING_LIST_DELETE_CONF_TITLE = 'shopping_list_delete_conf_title';
export const SHOPPING_LIST_DELETE_CONF_MESSAGE =  'shopping_list_delete_conf_message';

export const ORDER_CONFIRMATION = 'order_confirmation';
export const ORDER_CONFIRMATION_METHOD = 'order_confirmation_message_method';
export const ORDER_CONFIRMATION_EMAIL = 'order_confirmation_message_email';
export const ORDER_CONFIRMATION_HOME = 'order_confirmation_home_button';

export const ORDER_ORGILL = 'order_review_type_orgill';
export const ORDER_CHECKOUT = 'order_review_type_checkout';
export const ORDER_ORGILL_MESSAGE = 'order_review_orgill_message';
export const ORDER_CHECKOUT_MESSAGE = 'order_review_checkout_message';

/**
* Marker : Past Purchases
* =============================================================================================
*/

export const ORDER_HISTORY_PAGE = 'history';
export const ORDER_DETAILS_PAGE = 'details';
export const PRODUCT_NOT_AVAILABLE = 'product_not_available';
export const ERROR = 'error';

/**
* Marker : Offline browsing
* =============================================================================================
*/

export const DATABASE_DEPRECATED_TITLE = 'deprecated_database_title';
export const DATABASE_DEPRECATED_MESSAGE = 'deprecated_database_message';
export const DATABASE_DEPRECATED_CANCELED_TEXT = 'deprecated_database_canceled_text';

/**
 * Marker : FlashDeals
 * =============================================================================================
 */

export const NOTIFICATIONS_PERMISIONS_MESSAGE = 'notifications_permissions_message';
export const NOTIFICATIONS_PERMISIONS_BTN_SUCCESS = 'notifications_permissions_btn_success';
export const NOTIFICATIONS_PERMISIONS_BTN_DISMISS = 'notifications_permissions_btn_dismiss';


//Location
export const LOCATION_PERMISSIONS_MESSAGE = "location_permissions_message";
export const LOCATION_NEVER_SHOW = "location_never_show";
export const LOCATION_PERMISSIONS_NOT_GRANTED = "location_permissions_not_granted";

export const DEFAULT_HTTP_ERROR = "default_http_error";
export const NO_ACCES = "no_acces";
export const SOMETHING_WENT_WROMG = "something_went_wrong";
