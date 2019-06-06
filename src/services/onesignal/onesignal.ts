import { Injectable} from '@angular/core';
import { OneSignal } from '@ionic-native/onesignal';
import * as Constants from '../../util/constants';
import * as Strings from "../../util/strings";
import { LocalStorageHelper } from "../../helpers/local-storage";
import { HotDealService } from '../hotdeal/hotdeal';
import { Badge } from "@ionic-native/badge";
import { Events, Platform } from 'ionic-angular';
import { PopoversService } from '../popovers/popovers';
import { Observable } from 'rxjs';
import { SecureActionsService } from '../../services/secure-actions/secure-actions';
import { Geolocation} from "@ionic-native/geolocation";


@Injectable()
export class OneSignalService {

    //Grab the paths for each permission
    private pushNotificationPermissionID: string = Constants.ONE_SIGNAL_NOTIFICATION_PREFERENCE_PATH;
    //private locationPermissionID: string = Constants.ONE_SIGNAL_LOCATION_PREFERENCE_PATH;

    //Store actual permissions for quick access
    private pushNotificationPermission: boolean = false;
    //private locationPermission: boolean = false;

    constructor(private oneSignal: OneSignal,
        private badge: Badge,   //Badge for icon notification
        private hotDealService: HotDealService,   //Provider to call to navigate to hotdeals provided through a push notification
        private events: Events,     //Propagate one signal event to be used in other places 
        private popoverService: PopoversService,     //Needed for permission modals,
        private secureActions:SecureActionsService,
        private platform: Platform,
        private geolocation: Geolocation
    ) { };

    /**
     * Call this to begin oneSignal initialization, call after app is ready!
     */
    public init() {

        //If OneSignal is in DEBUG mode we reset the status of permissions so we get modals again.
        if (Constants.DEBUG_ONE_SIGNAL && Constants.DEBUG_ONE_SIGNAL_CLEAN_PREFS) {
            this.permissionSaveResult(this.pushNotificationPermissionID, "NO");
         //   this.permissionSaveResult(this.locationPermissionID, "NO");
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

        if(this.platform.is('android')){
            this.androidPermissionsSetup();
        }else if (this.platform.is('ios')){
            this.iOSPermissionsSetup();
        }

        //How will oneSignal notifications will show while using the app.
        this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

        //Set the logging level of OneSignal
        this.oneSignal.setLogLevel({
            logLevel: Constants.ONE_SIGNAL_VERBOSE ? 6 : 1, //Are we verbose logging? If not, log only fatal errors
            visualLevel: 0  //Never pop up error as alerts with the built-in system.
        });


        //If we don't have permission, we don't receive notifications so there is no need to subscribe
        if (this.pushNotificationPermission || this.platform.is('ios')) {
            //What happens when a notification is received
            this.oneSignal.handleNotificationReceived().subscribe((data) => {
                if (data && data['notification']) { this.notificationReceived(data['notification']); }
            });

            //Handle the opening of a notification
            this.oneSignal.handleNotificationOpened().subscribe((data) => {
                if (data && data['notification']) { this.notificationOpened(data['notification']);  }
            });
        } else {
           this.debugLog("Notification permission not granted, not subscribing to one signal events.", this.pushNotificationPermission);
        }


        this.askForLocation().then((res) => {
            //Finalize OneSignal init
            this.oneSignal.endInit();
            //  this.oneSignal.location

            //Log only if we are verbose logging
            this.debugLog("OneSignal fully initiaized");

            if (this.platform.is('ios')) {
                //  this.iosNativePermissionStatusUpdate();
            }

            if (Constants.DEBUG_ONE_SIGNAL) {
                this.testOneSignal();
            }
        }, (rej) => {
            this.oneSignal.endInit();

            if (this.platform.is('ios')) {
                //  this.iosNativePermissionStatusUpdate();
            }

            if (Constants.DEBUG_ONE_SIGNAL) {
                this.testOneSignal();
            }
        });

    };


    private androidPermissionsSetup(){
        this.oneSignal.setSubscription(this.pushNotificationPermission);
    }

    private iOSPermissionsSetup() {
        //Specific settings to iOS
        let iosSettings = {
            //Auto prompt user for notification permissions.
            kOSSettingsKeyAutoPrompt: Constants.ONE_SIGNAL_IOS_NOTIFICATION_AUTO_PROMPT,

            //Launch notifications with a launch URL as an in app webview.
            kOSSettingsKeyInAppLaunchURL: Constants.ONE_SIGNAL_IOS_LAUNCH_IN_WEBVIEW
        };

        //Pass the iOS settings 
        this.oneSignal.iOSSettings(iosSettings);

        let askedAndDeclined = LocalStorageHelper.getFromLocalStorage(Constants.ONE_SIGNAL_IOS_PERMISSION_DECLINED);
           
        console.log("ASKEDANDDECLINED STATUS:" + askedAndDeclined + typeof askedAndDeclined);
         if (askedAndDeclined !== "true") {
            // this.oneSignal.registerForPushNotifications();
             this.oneSignal.promptForPushNotificationsWithUserResponse().then((result)=>{
                 console.log("THE USER:"+result,result);
                 this.iosNativePermissionStatusUpdate(result);
             })
         } else {
             //Setup the popover content
             let content = {
                 type: Constants.PERMISSION_MODAL,
                 title: Strings.GENERIC_MODAL_TITLE,
                 message: Strings.ONE_SIGNAL_IOS_PERMISSION_REFUSED,
                 negativeButtonText: Strings.MODAL_BUTTON_DECLINE,
                 positiveButtonText: Strings.MODAL_BUTTON_SETTINGS
             };

             this.popoverService.show(content).subscribe((result)=>{
                 if(result == 'OK'){
                     console.log("THERE SHOULD BE SOMETHING HAPPENING");
                 }
             })
         }

    }


    private iosNativePermissionStatusUpdate(status = undefined) {
        if (this.platform.is('ios')) {
            if (typeof status == undefined) {
                this.oneSignal.getPermissionSubscriptionState().then((result) => {
                    if (result.permissionStatus.hasPrompted && result.permissionStatus.status === 0) {
                        LocalStorageHelper.saveToLocalStorage(Constants.ONE_SIGNAL_IOS_PERMISSION_DECLINED, 'true');
                    } else if (result.permissionStatus.hasPrompted && result.permissionStatus.status != 0) {
                        LocalStorageHelper.saveToLocalStorage(Constants.ONE_SIGNAL_IOS_PERMISSION_DECLINED, 'false');
                    }
                });
            }
            else {
                LocalStorageHelper.saveToLocalStorage(Constants.ONE_SIGNAL_IOS_PERMISSION_DECLINED, (!status).toString());
            }
        }
    }


    private askForLocation() {
        return new Promise((resolve, reject) => {
            this.geolocation.getCurrentPosition().then((res) => {
                //this.oneSignal.setLocationShared(true);
                resolve(res);
            }).catch((err) => {
                this.oneSignal.promptLocation();
                reject(err);
            });
        });
    }

    private notificationReceived(data: any) {

        //Log only if we areverbose logging
        this.debugLog("Received package:" + JSON.stringify(data), data);

        this.registerHotDealInMenu(data);
       
        //Manually increase badge notifications for each notification received
        this.badge.increase(1);

    }

    private registerHotDealInMenu(data){
        const sku = this.extractPackageSKU(data);
        this.debugLog("Registering sku:" + sku);
        //Check data for existence, if there is none, then the notification is something else than a hot deal
        if (sku) {
                //Send an event with the passed SKU
                this.events.publish(Constants.EVENT_HOT_DEAL_NOTIFICATION_RECEIVED, sku);
                LocalStorageHelper.saveToLocalStorage(Constants.ONE_SIGNAL_HOT_DEAL_SKU_PATH,sku);

        }

    }

    private notificationOpened(data: any) {

        //Log only if we areverbose logging
        if (Constants.ONE_SIGNAL_VERBOSE) {
            console.log("NOTIFICATION OPENED with data: ", data);
        }

        this.registerHotDealInMenu(data);

        //Process the notification
        this.goToHotDeal(data);

        //Decrease the badge counter for each notification
        this.badge.decrease(1);
    }


    private extractPackageSKU(pckg){
        if (pckg &&  pckg.payload && pckg.payload.additionalData){
            return pckg.payload.additionalData.SKU;
        }

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
                    payload: {
                        additionalData: { SKU: "0011049" }
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
    private goToHotDeal(data = null) {

        /*     if(!this.sessionValidatorService.isValidSession()){
                 return;
             }*/

             

        const sku = this.extractPackageSKU(data);
        this.debugLog("Sku in go to hotdeal:" + sku);
        if (data) {
            if (sku) {
                this.secureActions.do(() => {
                    this.hotDealService.navigateToHotDeal(sku);
                });


            } else {    //If there is data but the package does not respect the hot deal structure
                this.debugLog("ONESIGNAL package is not a hot deal but it exists...", data);

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
       // this.locationPermission = LocalStorageHelper.getFromLocalStorage(this.pushNotificationPermissionID) === 'true';
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
            this.pushNotificationPermissionID,
            ['android']
        )/*, this.askForPermission(
            Strings.GENERIC_MODAL_TITLE,
            Strings.LOCATION_PERMISSIONS_MESSAGE,
            this.locationPermissionID
        )*/
        ).subscribe(([notification]) => {
            //We save their new result if it's the case

            this.debugLog("Notification result from modal:" + notification, notification);
           // this.debugLog("Location result from modal" + location, location);

            this.permissionSaveResult(Constants.ONE_SIGNAL_NOTIFICATION_PREFERENCE_PATH, notification["optionSelected"]);
         //   this.permissionSaveResult(Constants.ONE_SIGNAL_LOCATION_PREFERENCE_PATH, location["optionSelected"]);

            //Since we got all permissions we can continue with 
            this.finishInit();
        });

    };

    /**
     * This method handles asking for a permission and returns the result from the popover
     * @param title Title constant of the modal
     * @param message Message of the modal
     * @param permissionID Path of permission in storage to use
     * @param platforms Array with platforms as trings
     * @param return Observable from a modal, will return only 1 value from {"DISMISS","OK","NO"}
     */
    private askForPermission(title, message, permissionID, platforms = ['ios','android']) {

        let platformTarget = false;
        platforms.forEach((platform)=>{
            if(this.platform.is(platform)){
                platformTarget = true;
            }
        })

        //Grab the modal and permission status from storage
        let permissionModalDismissed = LocalStorageHelper.getFromLocalStorage(permissionID + "Modal") === 'true';
        let permission = LocalStorageHelper.getFromLocalStorage(permissionID) === 'true';

        //If the modal is set to never or permission is already granted, return an empty observable.
        if (permissionModalDismissed || permission || !platformTarget) {
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
        return this.popoverService.show(popoverContent);
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
                break;
        };
    };

    private debugLog(string, object = null) {
        if (Constants.ONE_SIGNAL_VERBOSE) {
            console.log(string, object);
        }
    }

}