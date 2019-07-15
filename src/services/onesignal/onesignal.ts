import { Injectable } from '@angular/core';
import { OneSignal, OSNotificationPayload, OSNotificationOpenedResult } from '@ionic-native/onesignal';
import { Badge } from '@ionic-native/badge';
import { Events, Platform } from 'ionic-angular';
import { Observable, Subscription } from 'rxjs';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';

import { HotDealService } from '../hotdeal/hotdeal';
import { PopoversService, PopoverContent, DefaultPopoverResult } from '../popovers/popovers';
import { SecureActionsService } from '../../services/secure-actions/secure-actions';
import { NavigatorService } from '../../services/navigator/navigator';
import { LocalStorageHelper } from '../../helpers/local-storage';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { AuthService } from '../../services/auth/auth';

enum androidPermissionState{
    AUTHORIZED = 1,
    DENIED = 2
}

enum iOSPermissionState{
    NOT_DETERMINED = 0,
    DENIED = 1,
    AUTHORIZED = 2
}

@Injectable()
export class OneSignalService {

    // Grab the paths for each permission
    private readonly pushNotificationPermissionID: string = Constants.ONE_SIGNAL_NOTIFICATION_PREFERENCE_PATH;
    // private locationPermissionID: string = Constants.ONE_SIGNAL_LOCATION_PREFERENCE_PATH;

    // Store actual permissions for quick access
    private pushNotificationPermission: boolean = false;
    // private locationPermission: boolean = false;

    // Ensures the modal only displays once or at the right time
    private readonly modalState: { initial: number, navCount: number } = { initial: 100, navCount: 0 };
    private navigationSubscription: Subscription;

    constructor(
        private readonly oneSignal: OneSignal,
        private readonly badge: Badge,   // Badge for icon notification
        private readonly hotDealService: HotDealService,   // Provider to call to navigate to hotdeals provided through a push notification
        private readonly events: Events,     // Propagate one signal event to be used in other places
        private readonly popoversService: PopoversService,     // Needed for permission modals,
        private readonly secureActions: SecureActionsService,
        private readonly platform: Platform,
        private readonly geolocation: Geolocation,
        private readonly navigatorService: NavigatorService,
        private readonly authService: AuthService
    ) { }


    /**
     * Call this to begin oneSignal initialization, call after app is ready!
     */
    public init(): void {

        // Begin initialiation with specific API keys
        this.oneSignal.startInit(Constants.ONE_SIGNAL_API_KEY, Constants.ONE_SIGNAL_ANDROID_PROJECT_TITLE);

        if (this.platform.is('ios')) {
            const iosSettings: { kOSSettingsKeyAutoPrompt: boolean, kOSSettingsKeyInAppLaunchURL: boolean } = {
                // Auto prompt user for notification permissions.
                kOSSettingsKeyAutoPrompt: Constants.ONE_SIGNAL_IOS_NOTIFICATION_AUTO_PROMPT,

                // Launch notifications with a launch URL as an in app webview.
                kOSSettingsKeyInAppLaunchURL: Constants.ONE_SIGNAL_IOS_LAUNCH_IN_WEBVIEW
            };

            // Pass the iOS settings
            this.oneSignal.iOSSettings(iosSettings);
        }

        // How will oneSignal notifications will show while using the app.
        this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

        // Handle the receiving of a notification, this currently only works if application is not closed :(
        this.oneSignal.handleNotificationReceived().subscribe(data => {
            if (data && data.payload && this.validateDate(data.payload)) {    // Validate the structure of the notification
                this.notificationReceived(data.payload);
            }
        });

        // Handle the opening of a notification
        this.oneSignal.handleNotificationOpened().subscribe(data => {
            if (data && data.notification && this.validateDate(data.notification.payload)) {   // Validate the structure of the notification
                this.notificationOpened(data);
            }
        });

        // Set the logging level of OneSignal
        this.oneSignal.setLogLevel({
            logLevel: Constants.ONE_SIGNAL_VERBOSE ? Constants.ONE_SIGNAL_DEBUG_LEVEL : 1, // Are we verbose logging by choice? If not, log only fatal errors
            visualLevel: 0  // Never pop up error as alerts with the built-in system.
        });

        // End the settings phase of oneSignal
        this.oneSignal.endInit();

        this.events.subscribe(Constants.EVENT_NAVIGATE_TO_PAGE, () => {
            this.modalState.navCount++; // We know we navigated.
        });

        // Proceed to handle permissions
        this.setPermissions();
    }

    /**
     * Check or get all needed permissions.
     */
    private setPermissions(): void {

        // If OneSignal is in DEBUG mode we reset the status of permissions so we get modals again.
        if (Constants.DEBUG_ONE_SIGNAL && Constants.DEBUG_ONE_SIGNAL_CLEAN_PREFS) {
            this.permissionSaveResult(this.pushNotificationPermissionID, 'NO');
            //   this.permissionSaveResult(this.locationPermissionID, 'NO');
        }

        // forkJoin modal observables such that we continue only when all permission are settled (either granted or rejected)
        // This setup is made to handle multiple custom permissions modals.
        Observable.forkJoin(this.askForPermission(
            Strings.GENERIC_MODAL_TITLE,
            Strings.NOTIFICATIONS_PERMISSIONS_MESSAGE,
            this.pushNotificationPermissionID,
            ['android', 'ios']    // We want this permission request modal on these platforms
        )/*, this.askForPermission(
           Strings.GENERIC_MODAL_TITLE,
           Strings.LOCATION_PERMISSIONS_MESSAGE,
           this.locationPermissionID
       )*/
        ).subscribe(([notification]: DefaultPopoverResult[]) => {    // For each modal we need a matching parameter

            this.modalState.initial = this.modalState.navCount;

            // We save their new result if it's the case
            if (notification) {
                this.permissionSaveResult(Constants.ONE_SIGNAL_NOTIFICATION_PREFERENCE_PATH, notification.optionSelected);
            }

            // this.permissionSaveResult(Constants.ONE_SIGNAL_LOCATION_PREFERENCE_PATH, location['optionSelected']);

            this.updatePermissions(); // Update the saved permissions state to be consistent with what's in memory

            if (this.platform.is('android')) {
                this.androidPermissionsSetup();

                if (Constants.DEBUG_ONE_SIGNAL) {
                    this.testOneSignal();
                }

            } else if (this.platform.is('ios')) {

                this.iOSPermissionsSetup().then(notificationPermission => {
                    if (Constants.DEBUG_ONE_SIGNAL) {
                        this.testOneSignal();
                    }
                });
            }
            this.modalState.initial = this.modalState.navCount;
        });
    }

    /**
     * Handles android-side of permissions
     */
    private androidPermissionsSetup(): void {
        this.oneSignal.setSubscription(this.pushNotificationPermission);

        if (this.pushNotificationPermission) {
            LocalStorageHelper.removeFromLocalStorage(Constants.NOTIFICATION_SUBSCRIPTION_ANDROID_PATH);
            this.handleLocationPermission();

            // TODO: Change these to Constants.
            this.secureActions.do(() => { // We make a call to secure actions and schedule our code because we need a valid user reference for this part
                let retailer_type: string = 'US';
                for (const division of Constants.ONE_SIGNAL_CANADA_USER_TYPES) {
                    if (division === this.authService.User.division) {
                        retailer_type = 'CA';
                        break;
                    }
                }
                this.oneSignal.sendTag(Constants.ONE_SIGNAL_RETAILER_TYPE_TAG, retailer_type);
            });
           
        } else if (this.getPermissionDismissStatus(Constants.ONE_SIGNAL_NOTIFICATION_PREFERENCE_PATH)) {
            LocalStorageHelper.saveToLocalStorage(Constants.NOTIFICATION_SUBSCRIPTION_ANDROID_PATH, true);
        }

        if (!this.navigationSubscription) {
            this.navigationSubscription = this.navigatorService.lastPage.subscribe((pageName: string) => {
                if (pageName === 'Login') {

                    // Check if permission is granted, if not, we show a modal
                    this.oneSignal.getPermissionSubscriptionState().then(state => {
                        if (state.permissionStatus.state === androidPermissionState.DENIED) {    // state == 2 means it's declined, 1 is Authorized.
                            this.showPermissionsReminder();
                        }
                    });

                    if (!this.pushNotificationPermission && (this.modalState.initial < this.modalState.navCount)) {
                        // We handle the case we should show it or the edge case where we choose 'Not now' then logged in and out.
                        // If we need to show the subscription modal we do it here, the check is to not show it on the first launch.
                        // this.showSubscriptionSetting();
                        this.setPermissions();
                    }
                }
            });
        }
    }

    /**
     * Handles iOS side of permissions setup
     */
    private iOSPermissionsSetup(): Promise<boolean> {

        if (!this.navigationSubscription) {
            this.navigationSubscription = this.navigatorService.lastPage.subscribe(pageName => {
                if (pageName === 'Login') {
                    // Check if permission is granted, if not, we show a modal
                    this.oneSignal.getPermissionSubscriptionState().then(state => {
                        if (state.permissionStatus.status === iOSPermissionState.DENIED) {    // status == 1 on iOS means Denied
                            this.showPermissionsReminder();
                        } else if (state.permissionStatus.status === iOSPermissionState.NOT_DETERMINED && (this.modalState.initial < this.modalState.navCount)) { // status == 0 on iOS means not asked.
                            this.setPermissions();
                        }
                    });
                }
            }) as Subscription;
        }

        return this.badge.isSupported().then(isSupported => {
            if (isSupported && this.pushNotificationPermission) {    // .hasPermission() check prompts notification permission so we don't want to do it always
                return this.badge.hasPermission() as Promise<boolean>;
            }
            return Promise.resolve(isSupported) as Promise<boolean>;

        }).then(hasPermission => {
            if (!hasPermission && this.pushNotificationPermission) {
                return this.badge.requestPermission();
            }
            return Promise.resolve(hasPermission);
        }).then((requestResult: boolean) => {
            return new Promise(resolve => {

                const askedAndDeclined: string = LocalStorageHelper.getFromLocalStorage(Constants.ONE_SIGNAL_IOS_PERMISSION_DECLINED);
                if (askedAndDeclined !== 'true' && this.pushNotificationPermission) {
                    LocalStorageHelper.removeFromLocalStorage(Constants.NOTIFICATION_SETTINGS_WARNING_PATH);
                    this.oneSignal.promptForPushNotificationsWithUserResponse().then(result => {
                        this.iosNativePermissionStatusUpdate(result);

                        if (result) {
                            this.handleLocationPermission();
                        }
                        resolve(result);
                    });
                }
                resolve();
            }) as Promise<boolean>;
        });


    }


    private showPermissionsReminder(): Promise<{}> {
        return new Promise((resolve, reject) => {
            const content: PopoverContent = {
                type: Constants.PERMISSION_MODAL,
                title: Strings.GENERIC_MODAL_TITLE,
                message: Strings.ONE_SIGNAL_PERMISSION_REMINDER,
                positiveButtonText: Strings.MODAL_BUTTON_OK
            };

            this.popoversService.show(content);
        });
    }

    /**
     * Special function for iOS to know whether the notification permission was granted or declined
     * @param status Save a specific status
     */
    private iosNativePermissionStatusUpdate(status?: boolean): void {
        if (status !== undefined) {
            this.oneSignal.getPermissionSubscriptionState().then(result => {
                if (result.permissionStatus.hasPrompted && result.permissionStatus.state === 0) {
                    LocalStorageHelper.saveToLocalStorage(Constants.ONE_SIGNAL_IOS_PERMISSION_DECLINED, 'true');
                } else if (result.permissionStatus.hasPrompted && result.permissionStatus.state !== 0) {
                    LocalStorageHelper.saveToLocalStorage(Constants.ONE_SIGNAL_IOS_PERMISSION_DECLINED, 'false');
                }
            });
        } else {
            LocalStorageHelper.saveToLocalStorage(Constants.ONE_SIGNAL_IOS_PERMISSION_DECLINED, (!status).toString());
        }
    }

    /**
     * Function that checks wether we have location permission.
     * @returns Nothing, there is no promise for promptLocation() so in the end it does not matter if we wait or not
     */
    private handleLocationPermission(): Promise<void> {
        return new Promise(resolve => {
            this.oneSignal.setLocationShared(true);
            // GetCurrent position calls for location permission by itself
            this.geolocation.getCurrentPosition().then((res: Geoposition) => {
                // Everything is alright

                resolve();
            }).catch(e => {
                console.error(e);
            });

        }) as Promise<void>;
    }

    private notificationReceived(data: OSNotificationPayload): void {
        
        // Log only if we are verbose logging
        this.debugLog('Received package:' + JSON.stringify(data), data);

        this.savePackageDate(data);

        this.registerHotDealInMenu(data);

        // anually increase badge notifications for each notification received
        /*  if (this.platform.is('ios')) {
              this.badge.increase(1);
          }*/

    }

    /**
     * Tries to register a hotDeal in menu
     * @param data the notification package
     */
    private registerHotDealInMenu(data: { additionalData?: { SKU?: string } }): void {
        const sku: string = this.extractPackageSKU(data);
        this.debugLog('Registering sku:' + sku);
        // Check data for existence, if there is none, then the notification is something else than a hot deal
        if (sku) {
            // Send an event with the passed SKU
            LocalStorageHelper.saveToLocalStorage(Constants.ONE_SIGNAL_HOT_DEAL_SKU_PATH, sku);
            this.events.publish(Constants.EVENT_HOT_DEAL_NOTIFICATION_RECEIVED, sku);
        }

    }

    /**
     * Handles date validation
     * @param package notification package
     */
    private validateDate(pckg: OSNotificationPayload): boolean {
        // const date: string = JSON.parse(pckg.rawPayload)['google.sent_time'] as string;
        //
        // /** DEBUG ONLY */
        // // let dbgDate = new Date();
        // // date = dbgDate.setDate(dbgDate.getDate() - 2);
        // // =====
        // if (this.hotDealService.isHotDealExpired(date)) {
        //     this.hotDealService.markHotDealExpired();
        //     return false;
        // }
        return true;
    }

    private notificationOpened(data: OSNotificationOpenedResult): void {

        const notificationPayload: OSNotificationPayload = data.notification.payload;

        this.debugLog('NOTIFICATION OPENED with data: ' + JSON.stringify(data));
        this.savePackageDate(notificationPayload);
        this.registerHotDealInMenu(notificationPayload);

        // Process the notification
        this.goToHotDeal(notificationPayload);

        // Decrease the badge counter for each notification
        if (this.platform.is('ios')) {
            this.badge.decrease(1);
        }
    }


    /**
     * Saves the date a package was sent in local storage.
     * @param pckg The package
     */
    private savePackageDate(pckg: OSNotificationPayload): void {
        // if (pckg && pckg.rawPayload) {
        //     const OBJTRY: string = JSON.parse(pckg.rawPayload) as string;
        //     LocalStorageHelper.saveToLocalStorage(Constants.ONE_SIGNAL_PAYLOAD_TIMESTAMP, OBJTRY['google.sent_time']);
        // }
    }

    /**
     * Returns the SKU from a notification package
     * @param pckg The notification package.
     * @returns SKU as string.
     */
    private extractPackageSKU(pckg: { additionalData?: { SKU?: string } }): string {
        if (pckg && pckg.additionalData) {
            return pckg.additionalData.SKU;
        }
    }

    /**
     * Test method for some logic.
     */
    private testOneSignal(): void {
        /**
         * HACK: FAKE SKU for testing
         */
        try {
            const fakeReceivedNotification: OSNotificationPayload = { additionalData: { SKU: '0011049' } } as OSNotificationPayload;
            // const fakeOpenedNotification: OSNotificationOpenedResult = { notification: fakeReceivedNotification, action: { type: 0 } };

            this.notificationReceived(fakeReceivedNotification);
        } catch (err) {
            console.log(err);
        }
    }


    /**
     * @param data Should be a packet from OneSignal, it can be left null to process a simple push notification without payload
     */
    private goToHotDeal(data: OSNotificationPayload): void {
        const sku: string = this.extractPackageSKU(data);
        this.debugLog('Sku in go to hotdeal:' + sku);
        if (data) {
            if (sku) {
                this.secureActions.do(() => {
                    this.hotDealService.navigateToHotDeal(sku);
                });
            } else {    // If there is data but the package does not respect the hot deal structure
                this.debugLog('ONESIGNAL package is not a hot deal but it exists...' + JSON.stringify(data));
            }
        } else {  // If the package is empty just open the app?
            // TODO: Implement something here?
            this.debugLog('ONESIGNAL NOTIFICATION PACKET IS NULL...' + JSON.stringify(data));
        }
    }


    /**
     * This function updates the in-memory permissions to reflect the stored ones
     */
    private updatePermissions(): void {
        this.pushNotificationPermission = LocalStorageHelper.getFromLocalStorage(this.pushNotificationPermissionID) === 'true';
        // this.locationPermission = LocalStorageHelper.getFromLocalStorage(this.pushNotificationPermissionID) === 'true';
    }


    /**
     * This method handles asking for a permission and returns the result from the popover
     * @param title Title constant of the modal
     * @param message Message of the modal
     * @param permissionID Path of permission in storage to use
     * @param platforms Array with platforms as strings
     * @param return Observable from a modal, will return only 1 value from {'DISMISS','OK','NO'}
     */
    private askForPermission(title: string, message: string, permissionID: string, platforms: string[] = ['ios', 'android']): Observable<DefaultPopoverResult> {

        let platformTarget: boolean = platforms.length > 0 ? false : true;

        platforms.forEach((platform: string) => {
            if (this.platform.is(platform)) {
                platformTarget = true;
            }
        });

        // Grab the modal and permission status from storage
        const permissionModalDismissed: boolean = LocalStorageHelper.getFromLocalStorage(permissionID + 'Modal') === 'true';
        const permission: boolean = LocalStorageHelper.getFromLocalStorage(permissionID) === 'true';

        // If the modal is set to never or permission is already granted, return an empty observable.
        if (permissionModalDismissed || permission || !platformTarget) {
            return Observable.of({ optionSelected: '' }); // Return empty observable
        }

        // Setup the popover content
        const popoverContent: PopoverContent = {
            type: Constants.PERMISSION_MODAL,
            title,
            message,
            negativeButtonText: Strings.MODAL_BUTTON_NOT_NOW,
            positiveButtonText: Strings.MODAL_BUTTON_ALLOW,
            dismissButtonText: Strings.MODAL_BUTTON_NEVER
        };

        // Return the popover observable
        return this.popoversService.show(popoverContent) as Observable<DefaultPopoverResult>;
    }


    /**
     * Save the result of asking for a permission using preference constant ID
     * @param preferenceID Constant ID for the permission
     * @param result The result of popover service, expects one of the values {'DISMISS','OK', 'NO'}
     */
    private permissionSaveResult(preferenceID: string, result: string): void {
        if (!result) {
            this.debugLog('Result is empty, propably permission was already set ' + result, result);
            return;
        }

        this.debugLog(preferenceID.toString() + result);

        // Inner function to actually save data to storage
        function savePermissionModal(modalStatus: boolean, preferenceStatus: boolean): void {
            LocalStorageHelper.saveToLocalStorage(preferenceID + 'Modal', modalStatus.toString());
            LocalStorageHelper.saveToLocalStorage(preferenceID, preferenceStatus.toString());
        }

        switch (result) {
            case 'DISMISS':
                savePermissionModal(true, false);    // Never show again, implicitely don't give permission
                break;

            case 'OK':
                savePermissionModal(true, true);    // Don't show again modal since permission was granted
                break;

            case 'NO':
                savePermissionModal(false, false);   // If permission is not granted and modal is not dismissed permanently, show it next time
                break;

            default:
                savePermissionModal(false, false);
        }
    }

    /**
     * @returns true if the option 'NEVER' was chooosen or false if the permission is either given or it was delayed.
     */
    private getPermissionDismissStatus(preferenceID: string): boolean {
        return LocalStorageHelper.getFromLocalStorage(preferenceID + 'Modal') === 'true' ? true : false;
    }

    /**
     * Debug method that only works if One signal is marked as in verbose mode from constants
     * @param message - Message
     * @param object - optional object to pass
     */
    private debugLog(message: string, object?: any): void {
        if (Constants.ONE_SIGNAL_VERBOSE) {

            if (object !== 'NONE') {
                console.log(message, object);
            } else {
                {
                    console.log(message);
                }
            }
        }
    }

}
