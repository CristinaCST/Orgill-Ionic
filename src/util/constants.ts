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
* Marker : dateTimeProvider Formats
* =============================================================================================
*/

export const DATETIME_FORMAT_MONTH_DAY_YEAR = 'MM/DD/YYYY';


/**
* Marker : Popover Types
* =============================================================================================
*/

export const POPOVER_NETWORK_OFFLINE = 'popoverOfflineNetwork';
export const POPOVER_NEW_SHOPPING_LIST = 'popoverNewList';
export const POPOVER_NEW_DATABASE = 'newDatabase';
export const POPOVER_ORDER_CONFIRMATION = 'orderConfirmation';
export const POPOVER_DELETE_LIST_CONFIRMATION = 'deleteListConfirmation';
export const POPOVER_LOGOUT = 'popoverLogout';
export const POPOVER_ERROR = 'popoverError';

//TODO: Move this?
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


/*
export const LOGOUT_KEEP_DATA = 'logoutKeepData';
export const LOGOUT_DELETE_DATA = 'logoutDeleteData';*/


/**
* Marker : Programs
* =============================================================================================
*/

export const PROGRAM_NUMBER = 'progNumber';

export const MARKET_ONLY_PROGRAM = 'Y';
export const REGULAR_PROGRAM = 'N';

/**
* Marker : Catalog
* =============================================================================================
*/

export const CATEGORIES_PER_PAGE = 100;
export const PRODUCTS_PER_PAGE = 20;

/**
* Marker : Search
* =============================================================================================
*/


export const SCAN_MARKET_ONLY_PRODUCT = 'scan_market_only_product';
export const SCAN_REGULAR_PRODUCT = 'scan_regular_product';

export const SCAN_NO_PERMISSION_ALERT = 'scan_no_permission_alert';
export const SCAN_GRANT_PERMISSION = 'scan_grant_button';
export const SCAN_NO_PERMISSION_ALERT_RESULT = 'scan_no_permission_alert_result';
export const SCAN_INVALID_BARCODE = 'scan_invalid_barcode';
export const SCAN_NOT_FOUND = 'scan_not_found';
export const SCAN_ERROR = 'scan_error';

export const SEARCH_RESULTS_PER_PAGE = 20;

/**
* Marker : Shopping Lists
* =============================================================================================
*/

export const DEFAULT_LIST_ID = "default_list_id";
export const MARKET_ONLY_LIST_ID = "market_only_list_id";

export const CUSTOM_SHOPPING_LIST_TYPE = "0";
export const DEFAULT_LIST_TYPE = "1";
export const MARKET_ONLY_LIST_TYPE = "2";
export const MARKET_ONLY_CUSTOM_TYPE = "3";

//ONE SIGNAL SETUP
export const ONE_SIGNAL_API_KEY = "be33b136-2960-435a-b22f-b12ade07e393";
export const ONE_SIGNAL_ANDROID_PROJECT_TITLE = "orgill-test";
export const ONE_SIGNAL_IOS_NOTIFICATION_AUTO_PROMPT = false;
export const ONE_SIGNAL_IOS_LAUNCH_IN_WEBVIEW = false;
export const ONE_SIGNAL_LOCATION_PREFERENCE_PATH = 'locationSharing';
export const ONE_SIGNAL_NOTIFICATION_PREFERENCE_PATH = 'pushNotifications';
export const ONE_SIGNAL_VERBOSE = false; // set this to false if production
export const DEBUG_ONE_SIGNAL = false;
export const DEBUG_ONE_SIGNAL_CLEAN_PREFS = false;



export const PERMISSION_MODAL = "permissionModal";

//DEBUG

export const DEBUG_TRANSLATIONS = false;
