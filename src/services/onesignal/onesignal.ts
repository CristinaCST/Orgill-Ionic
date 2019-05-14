import { Injectable } from '@angular/core';
import { OneSignal } from '@ionic-native/onesignal';
import * as Constants from '../../util/constants';
import * as Strings from "../../util/strings";
import { LocalStorageHelper } from "../../helpers/local-storage";
import { FlashDealService } from '../flashdeal/flashdeal';
import { Badge } from "@ionic-native/badge";
import { Events, Platform } from 'ionic-angular';
import { PopoversProvider } from '../../providers/popovers/popovers';
import { Observable } from 'rxjs';


@Injectable()
export class OneSignalService {

    //Grab the paths for each permission
    private pushNotificationPermissionID: string = Constants.ONE_SIGNAL_NOTIFICATION_PREFERENCE_PATH;
    private locationPermissionID: string = Constants.ONE_SIGNAL_LOCATION_PREFERENCE_PATH;

    //Store actual permissions for quick access
    private pushNotificationPermission: boolean = false;
    private locationPermission: boolean = false;

    constructor(private oneSignal: OneSignal,
        private badge: Badge,   //Badge for icon notification
        private flashDealService: FlashDealService,   //Provider to call to navigate to flashdeals provided through a push notification
        private events: Events,     //Propagate one signal event to be used in other places
        // private platform: Platform,   //Run platform dependent code 
        private popover: PopoversProvider,     //Needed for permission modals
    ) { };



    /**
     * Call this to begin oneSignal initialization, call after app is ready!
     */
    public init() {

        //If OneSignal is in DEBUG mode we reset the status of permissions so we get modals again.
        if (Constants.DEBUG_ONE_SIGNAL && Constants.DEBUG_ONE_SIGNAL_CLEAN_PREFS) {
            this.permissionSaveResult(this.pushNotificationPermissionID, "NO");
            this.permissionSaveResult(this.locationPermissionID, "NO");
        }

        //Begin initialiation with specific API keys
        this.oneSignal.startInit(Constants.ONE_SIGNAL_API_KEY, Constants.ONE_SIGNAL_ANDROID_PROJECT_TITLE);

        //Sort out the permissions needed
        this.setPermissions();

    };


    /**
     * This only should be called after permissions have been fully assessed.
     */
    private finishInit() {

        this.updatePermissions(); //Update the permissions from storage

        //Set if we share location according to permissions
        this.oneSignal.setLocationShared(this.locationPermission);

        //Set if we subscribe to push notifications based on permissions
        this.oneSignal.setSubscription(this.pushNotificationPermission);

        //How will oneSignal notifications will show while using the app.
        this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

        //Specific settings to iOS
        let iosSettings = {
            //Auto prompt user for notification permissions.
            kOSSettingsKeyAutoPrompt: Constants.ONE_SIGNAL_IOS_NOTIFICATION_AUTO_PROMPT,

            //Launch notifications with a launch URL as an in app webview.
            kOSSettingsKeyInAppLaunchURL: Constants.ONE_SIGNAL_IOS_LAUNCH_IN_WEBVIEW
        };

        //Pass the iOS settings 
        this.oneSignal.iOSSettings(iosSettings);

        //Set the logging level of OneSignal
        this.oneSignal.setLogLevel({
            logLevel: Constants.ONE_SIGNAL_VERBOSE ? 6 : 1, //Are we verbose logging? If not, log only fatal errors
            visualLevel: 0  //Never pop up error as alerts with the built-in system.
        });


        //If we don't have permission, we don't receive notifications so there is no need to subscribe
        if (this.pushNotificationPermission) {
            //What happens when a notification is received
            this.oneSignal.handleNotificationReceived().subscribe(this.notificationReceived);

            //Handle the opening of a notification
            this.oneSignal.handleNotificationOpened().subscribe(this.notificationOpened);
        } else {
            this.debugLog("Notification permission not granted, not subscribing to one signal events.", this.pushNotificationPermission);
        }

        //Finalize OneSignal init
        this.oneSignal.endInit();

        //Log only if we are verbose logging
        this.debugLog("OneSignal fully initiaized");


        if (Constants.DEBUG_ONE_SIGNAL) {
            this.testOneSignal();
        }
    };


    private notificationReceived(data: any) {

        //Log only if we areverbose logging
        if (Constants.ONE_SIGNAL_VERBOSE) {
            this.debugLog("Received package:" + JSON.stringify(data), data);
        }

        //Check data for existence, if there is none, then the notification is something else than a flash deal
        if (data) {
            if (data.notification.payload.additionalData.SKU) {  //Check if there is a SKU in the correct object format

                //Send an event with the passed SKU
                this.events.publish(Strings.EVENT_FLASH_DEAL_NOTIFICATION_RECEIVED, data.notification.payload.additionalData.SKU);
            }
        }

        //Manually increase badge notifications for each notification received
        this.badge.increase(1);

    }

    private notificationOpened(data: any) {

        //Log only if we areverbose logging
        if (Constants.ONE_SIGNAL_VERBOSE) {
            console.log("NOTIFICATION OPENED with data: ", data);
        }

        //Save the fact we begin navigating from a notification
        LocalStorageHelper.saveToLocalStorage('fromNotification', 'true');

        //Process the notification
        this.checkSession(data);

        //Decrease the badge counter for each notification
        this.badge.decrease(1);
    }

    /**
     * Initializes oneSignal plugin along with checking for permissions
    */
    private testOneSignal() {

        /**
         * HACK: FAKE SKU for testing
        */
        try {
            this.notificationOpened({
                notification: {
                    payload: {
                        additionalData: { SKU: "7515000" }
                    }
                }
            });
        } catch (err) {
            console.log(err);
        }
    };



    /**
     * 
     * @param data Should be a packet from OneSignal, it can be left null to process a simple push notification without payload
     */
    private checkSession(data = null) {

        if (data) {
            if (data.notification.payload.additionalData.SKU) {

                //If the payload is valid, try to navigate to it, if not, log the error if logging is on
                try {
                    // console.log("DAFUQ");
                    this.flashDealService.navigateToFlashDeal(data.notification.payload.additionalData.SKU);
                } catch (exception) {
                    this.debugLog("Couldn't navigate to flash deal because " + exception, data);

                }

            } else {    //If there is data but the package does not respect the flash deal structure
                this.debugLog("ONESIGNAL package is not a flash deal but it exists...", data);

            }
        }
        else {  //If the package is empty just open the app?
            //TODO: Implement something here?
            this.debugLog("ONESIGNAL NOTIFICATION PACKET IS NULL...", data);

        }
    };


    /**
     * This function updates the in-memory permissions to reflect the stored ones
     */
    private updatePermissions() {
        this.pushNotificationPermission = LocalStorageHelper.getFromLocalStorage(this.pushNotificationPermissionID) === 'true';
        this.locationPermission = LocalStorageHelper.getFromLocalStorage(this.pushNotificationPermissionID) === 'true';
    }

    /**
     * Check or get all needed permissions.
     */
    private setPermissions() {

        //Check badge permission
        if (!this.badge.hasPermission()) {
            this.badge.requestPermission();
        }

        //forkJoin modal observables such that we continue only when all permission are settled (either granted or rejected)
        Observable.forkJoin(this.askForPermission(
            Strings.GENERIC_MODAL_TITLE,
            Strings.NOTIFICATIONS_PERMISSIONS_MESSAGE,
            this.pushNotificationPermissionID
        ), this.askForPermission(
            Strings.GENERIC_MODAL_TITLE,
            Strings.LOCATION_PERMISSIONS_MESSAGE,
            this.locationPermissionID
        )).subscribe(([notification, location]) => {
            //We save their new result if it's the case

            this.debugLog("Notification result from modal:" + notification, notification);
            this.debugLog("Location result from modal" + location, location);

            this.permissionSaveResult(Constants.ONE_SIGNAL_NOTIFICATION_PREFERENCE_PATH, notification["optionSelected"]);
            this.permissionSaveResult(Constants.ONE_SIGNAL_LOCATION_PREFERENCE_PATH, location["optionSelected"]);

            //Since we got all permissions we can continue with 
            this.finishInit();
        });

    };

    /**
     * This method handles asking for a permission and returns the result from the popover
     * @param title Title constant of the modal
     * @param message Message of the modal
     * @param permissionID Path of permission in storage to use
     * @param return Observable from a modal, will return only 1 value from {"DISMISS","OK","NO"}
     */
    private askForPermission(title, message, permissionID) {

        //Grab the modal and permission status from storage
        let permissionModalDismissed = LocalStorageHelper.getFromLocalStorage(permissionID + "Modal") === 'true';
        let permission = LocalStorageHelper.getFromLocalStorage(permissionID) === 'true';

        //If the modal is set to never or permission is already granted, return an empty observable.
        if (permissionModalDismissed || permission) {
            return Observable.of([]); //Return empty observable
        }

        //Setup the popover content
        let popoverContent = {
            type: Constants.PERMISSION_MODAL,
            title,
            message,
            negativeButtonText: Strings.MODAL_BUTTON_NOT_NOW,
            positiveButtonText: Strings.MODAL_BUTTON_ALLOW,
            dismissButtonText: Strings.MODAL_BUTTON_NEVER,
        };

        //Return the popover observable
        return this.popover.show(popoverContent);
    };


    /**
     * Save the result of asking for a permission using preference constant ID
     * @param preferenceID Constant ID for the permission 
     * @param result The result of popover service, expects one of the values {"DISMISS","OK", "NO"}
     */
    private permissionSaveResult(preferenceID, result) {
        if (!result) {
            this.debugLog("Result is empty, propably permission was already set " + result, result);
            return;
        }

        this.debugLog(preferenceID.toString() + result);

        //Inner function to actually save data to storage
        function savePermissionModal(modalStatus, preferenceStatus) {
            LocalStorageHelper.saveToLocalStorage(preferenceID + "Modal", modalStatus.toString());
            LocalStorageHelper.saveToLocalStorage(preferenceID, preferenceStatus.toString());
        }

        switch (result) {
            case "DISMISS":
                savePermissionModal(true, false);    //Never show again, implicitely don't give permission
                break;

            case "OK":
                savePermissionModal(true, true);    //Don't show again modal since permission was granted
                break;

            case "NO":
                savePermissionModal(false, false);   //If permission is not granted and modal is not dismissed permanently, show it next time
                break;

            default:
                savePermissionModal(false, false);
               // console.log("No valid modal result for OneSignal permissions, received:" + result) //TODO: Change to be tied to debug strings and be dynamic
                break;
        };
    };

    private debugLog(string, object = null) {
        if (Constants.DEBUG_ONE_SIGNAL) {
            console.log(string, object);
        }
    }

}