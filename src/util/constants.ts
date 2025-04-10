import { environment } from '../environments/environment';

export const APP_CONFIGURATION_INFO: string = 'appConfigurationInfo';

export const DECIMAL_NUMBER: number = 2;

export const MAX_QUANTITY_HARDCAP: number = 99999;

export const HOLD_TIME_TO_DELETE_MODE: number = 0.6 * 1000; // Expressed in ms

export const SEND_TO_ORGILL_METHOD: number = 1;
export const CHECKOUT_METHOD: number = 2;

export const EVENT_AUTH: string = 'eventAuth';
export const EVENT_INVALID_AUTH: string = 'invalidAuth';

export const OVERRIDE_ADDITIONAL_CODE: string = '4100';
export const OVERRIDE_EXPIRE_TIME: number = 1000 * 60 * 15; // Expire time in milliseconds for the override.

// How many elements should infinite loaders through the app display in initial step?
// This value works more like a maximum, if there is still space on the page for more elements, more will be loaded anyway
export const INFINITE_LOADER_INITIAL_ELEMENTS: number = 10;

// How many elements an infinite loader will load on it's event?
export const INFINITE_LOADER_LOAD_COUNT: number = 10;

// Time in milliseconds representing how much time is valid a native location check (could be done earlier)
// Put 0 to force real-time location when prompting. WARNING: If this value is set, cached location will be retrieved instead of trying to get realtime.
export const LOCATION_MAXIMUM_AGE: number = 0;

export const LOCATION_TIMEOUT: number = 1000 * 15; // Time in milliseconds after a location results considers it unavailable (or off).

/**
 * Marker : App Language
 * =============================================================================================
 */

export const LANG_EN: string = 'en';
export const LANG_FR: string = 'fr';
export const DEVICE_LANGUAGE: string = 'deviceLanguage';

/**
 * Marker : Server Requests
 * =============================================================================================
 */

export const REQUEST_UNAUTHORIZED_ERROR: number = 401;
export const REQUEST_STATUS_OK: number = 200;
export const REQUEST_TIMEOUT_ERROR: string = 'TimeoutError';

export const TIMEOUT_INTERVAL: number = 30 * 1000; // 30 seconds
export const TIMEOUT_DEFAULT_INTERVAL: number = 30 * 1000; // 30 seconds

/**
 * Marker : dateTimeProvider Formats
 * =============================================================================================
 */

export const DATETIME_FORMAT_MONTH_DAY_YEAR: string = 'MM/DD/YYYY';

/**
 * Marker : Popover Types
 * =============================================================================================
 */

export const POPOVER_NETWORK_OFFLINE: string = 'popoverOfflineNetwork';
export const POPOVER_NEW_SHOPPING_LIST: string = 'popoverNewList';
export const POPOVER_NEW_DATABASE: string = 'newDatabase';
export const POPOVER_ORDER_CONFIRMATION: string = 'orderConfirmation';
export const POPOVER_DELETE_LIST_CONFIRMATION: string = 'deleteListConfirmation';
export const POPOVER_LOGOUT: string = 'popoverLogout';
export const POPOVER_ERROR: string = 'popoverError';
export const POPOVER_QUIT: string = 'popoverQuit';
export const POPOVER_INFO: string = 'popoverInfo';
export const POPOVER_CAMERA_PERMISSION_NOT_GRANTED: string = 'popoverNoCameraPerm';
export const POPOVER_FILL_QUANTITY: string = 'popoverQuantity';
export const POPOVER_SUPPORT_HOT_DEAL: string = 'popoverSupportHotDeal';

/**
 * Marker : EVENT TOPICS
 * =============================================================================================
 */

export const EVENT_NETWORK_ONLINE: string = 'networkOnline';
export const EVENT_NETWORK_OFFLINE: string = 'networkOffline';
export const EVENT_REQUEST_TIMEOUT: string = 'requestTimeout';

export const EVENT_UPDATE_APP_CONFIGURATION_INFO: string = 'updateAppConfiguration';

export const EVENT_USER_LOGGED_IN: string = 'eventUserLoggedIn';
export const EVENT_USER_LOGGED_OUT: string = 'eventUserLoggedOut';
export const EVENT_USER_IS_LOGGING_OUT: string = 'eventUserIsLoggingOut';
export const EVENT_NAVIGATE_TO_PAGE: string = 'eventNavigateToPage';
export const EVENT_CATEGORIES_PROGRAM_SELECTED: string = 'eventProgramSelected';

export const EVENT_SHOPPING_LIST_NEW_FROM_MENU: string = 'eventShoppingListNewMenu';
export const EVENT_SHOPPING_LIST_NEW_FROM_DETAILS: string = 'eventShoppingListNewDetails';
export const EVENT_SHOPPING_LIST_SELECTED: string = 'eventShoppingListSelected';
export const EVENT_SHOPPING_LISTS_UPDATE: string = 'eventShoppingListsUpdate';
export const EVENT_SHOPPING_LISTS_DELETE: string = 'eventDeleteList';
export const EVENT_UPDATE_LIST_ITEMS: string = 'eventUpdateListItems';
export const EVENT_PURCHASE_LIST_ITEMS: string = 'eventPurchaseListItems';

export const EVENT_SHOW_HOME_PAGE: string = 'homePage';

export const EVENT_NEW_SEARCH: string = 'newSearch';

export const EVENT_GO_TO_SHOPPING_LISTS_PAGE: string = 'goToListsPage';

export const EVENT_HOT_DEAL_NOTIFICATION_RECEIVED: string = 'notificationsHotDealReceived';

export const EVENT_NAVIGATION_NEW_PAGE: string = 'newPageEvent';

export const EVENT_SERVER_ERROR: string = 'eventServerError';

export const NOTIFICATION_SETTINGS_WARNING_PATH: string = 'notificationSettingsWarningPath';

export const NOTIFICATION_SUBSCRIPTION_ANDROID_PATH: string = 'notficationSubscriptionAndroidPath';
/**
 * Marker : User
 * =============================================================================================
 */

export const USER: string = 'user';
export const USER_TOKEN: string = 'UserToken';
export const TRANSPORTATION_TOKEN: string ='TransportationToken';
export const USER_SESSION_TIMESTAMP: string = 'sessionTimestamp';

/*
export const LOGOUT_KEEP_DATA = 'logoutKeepData';
export const LOGOUT_DELETE_DATA = 'logoutDeleteData';*/

/**
 * Marker : Programs
 * =============================================================================================
 */

export const PROGRAM_NUMBER: string = 'progNumber';

export const MARKET_ONLY_PROGRAM: string = 'Y';
export const REGULAR_PROGRAM: string = 'N';

/**
 * Marker : Catalog
 * =============================================================================================
 */

export const CATEGORIES_PER_PAGE: number = 100;
export const PRODUCTS_PER_PAGE: number = 20;

/**
 * Marker : Search
 * =============================================================================================
 */

export const SCAN_MARKET_ONLY_PRODUCT: string = 'scan_market_only_product';
export const SCAN_REGULAR_PRODUCT: string = 'scan_regular_product';

export const SCAN_NO_PERMISSION_ALERT: string = 'scan_no_permission_alert';
export const SCAN_GRANT_PERMISSION: string = 'scan_grant_button';
export const SCAN_NO_PERMISSION_ALERT_RESULT: string = 'scan_no_permission_alert_result';
export const SCAN_INVALID_BARCODE: string = 'scan_invalid_barcode';
export const SCAN_NOT_FOUND: string = 'scan_not_found';
export const SCAN_ERROR: string = 'scan_error';

export const SEARCH_RESULTS_PER_PAGE: number = 20;

/**
 * Marker : Shopping Lists
 * =============================================================================================
 */

export const DEFAULT_LIST_ID: string = 'default_list_id';
export const MARKET_ONLY_LIST_ID: string = 'market_only_list_id';

export const CUSTOM_LIST_DEFAULT_TYPE: number = 0;
export const DEFAULT_LIST_TYPE: number = 1;
export const MARKET_ONLY_LIST_TYPE: number = 2;
export const CUSTOM_LIST_MARKET_TYPE: number = 3;

// ONE SIGNAL SETUP /// PROD
export const ONE_SIGNAL_API_KEY: string = 'a11b3e10-bce2-41e9-a6d0-746042798d7e';
export const ONE_SIGNAL_ANDROID_PROJECT_TITLE: string = 'orgill-5a5ba';

// ONE SIGNAL SETUP /// TEST
// export const ONE_SIGNAL_API_KEY: string = 'be33b136-2960-435a-b22f-b12ade07e393';
// export const ONE_SIGNAL_ANDROID_PROJECT_TITLE: string = 'orgill-test';

export const ONE_SIGNAL_IOS_NOTIFICATION_AUTO_PROMPT: boolean = false;
export const ONE_SIGNAL_IOS_LAUNCH_IN_WEBVIEW: boolean = false;
export const ONE_SIGNAL_LOCATION_PREFERENCE_PATH: string = 'locationSharing';
export const ONE_SIGNAL_NOTIFICATION_PREFERENCE_PATH: string = 'pushNotifications';
export const ONE_SIGNAL_VERBOSE: boolean = !environment.production && false;
export const ONE_SIGNAL_HOT_DEAL_SKU_PATH: string = 'hotDealSku';
export const DEBUG_ONE_SIGNAL: boolean = !environment.production && true;
export const DEBUG_ONE_SIGNAL_CLEAN_PREFS: boolean = !environment.production && false;
export const ONE_SIGNAL_IOS_PERMISSION_DECLINED: string = 'iosDeclined';
export const ONE_SIGNAL_PAYLOAD_TIMESTAMP: string = 'oneSignalPayloadTimestamp';
export const HOT_DEAL_EXPIRED_EVENT: string = 'hotDealExpired';
export const ONE_SIGNAL_DEBUG_LEVEL: number = 6;
export const ONE_SIGNAL_CANADA_USER_TYPES: string[] = ['8', '12'];
export const ONE_SIGNAL_RETAILER_TYPE_TAG: string = 'retailer_type';

export const PERMISSION_MODAL: string = 'permissionModal';

// TODO: Move this
export const LOCAL_PRODUCT_IMAGE_PLACEHOLDER: string = '../../assets/imgs/product_placeholder.png';

// DEBUG
export const DEBUG_TRANSLATIONS: boolean = !environment.production && false;

// PLACEHOLDERS
export const PAST_PURCHASES_DEBUG_PLACEHOLDERS: boolean = !environment.production && true;
export const PAST_PURCHASES_DEBUG_ORDER_PLACEHOLDER: string = '111111';
export const PAST_PURCHASES_DEBUG_DATE_PLACEHOLDER: string = '02/02/12';
export const PAST_PURCHASES_DEBUG_TOTAL_PLACEHOLDER: string = '999';
export const PAST_PURCHASES_ITEM_DEBUG_TOTAL: string = '999';

export const EVENT_NEW_SHOPPING_LIST: string = 'newShoppingList';
export const EVENT_PRODUCT_ADDED_TO_SHOPPING_LIST: string = 'listProductAdded';
export const EVENT_LOADING_FAILED: string = 'loadingFailed';
export const EVENT_SCROLL_INTO_VIEW: string = 'scrollIntoView';

// GMAPS API KEY
export const GMAPS_API_KEY: string = 'AIzaSyA6sMWy-I9IiuHyI7EnkmsY-szFPFllKGE';

// DROPSHIP
export const DS_FORM_LIST_FORM_TYPE_DROPSHIP: string = 'dropship';
export const DS_FORM_LIST_FORM_TYPE_PALLET: string = 'pallet';
export const DS_FORM_LIST_FORM_TYPE_POG: string = 'pog';
export const DS_FORM_LIST_TYPE_US: string = 'US';
export const DS_FORM_LIST_TYPE_CA: string = 'CA';
export const DS_FORM_LIST_TYPE_INT: string = 'INT';
export const USER_TYPE_US: string[] = ['2', '3', '4', '5', '6', '7', '9'];
export const USER_TYPE_CAD: string[] = ['8', '12'];
export const USER_TYPE_INT: string = 'Y';
