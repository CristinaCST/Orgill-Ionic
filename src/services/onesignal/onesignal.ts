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

        //Begin initialiation with specific API keys
        this.oneSignal.startInit(Constants.ONE_SIGNAL_API_KEY, Constants.ONE_SIGNAL_ANDROID_PROJECT_TITLE);

        if (this.platform.is('ios')) {
            let iosSettings = {
                //Auto prompt user for notification permissions.
                kOSSettingsKeyAutoPrompt: Constants.ONE_SIGNAL_IOS_NOTIFICATION_AUTO_PROMPT,

                //Launch notifications with a launch URL as an in app webview.
                kOSSettingsKeyInAppLaunchURL: Constants.ONE_SIGNAL_IOS_LAUNCH_IN_WEBVIEW
            };

            //Pass the iOS settings 
            this.oneSignal.iOSSettings(iosSettings);
        }

        //How will oneSignal notifications will show while using the app.
        this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

        this.oneSignal.handleNotificationReceived().subscribe((data) => {
            if (data && data['payload'] && this.validateDate(data['payload'])) {
                this.notificationReceived(data['payload']);
            }
        });

        //Handle the opening of a notification
        this.oneSignal.handleNotificationOpened().subscribe((data) => {
            if (data && data['notification'] && this.validateDate(data['notification']['payload'])) {
                this.notificationOpened(data['notification']['payload']); 
            }
        });

        //Set the logging level of OneSignal
        this.oneSignal.setLogLevel({
            logLevel: Constants.ONE_SIGNAL_VERBOSE ? 6 : 1, //Are we verbose logging? If not, log only fatal errors
            visualLevel: 0  //Never pop up error as alerts with the built-in system.
        });
        
        this.oneSignal.endInit();

        //If OneSignal is in DEBUG mode we reset the status of permissions so we get modals again.
        if (Constants.DEBUG_ONE_SIGNAL && Constants.DEBUG_ONE_SIGNAL_CLEAN_PREFS) {
            this.permissionSaveResult(this.pushNotificationPermissionID, "NO");
         //   this.permissionSaveResult(this.locationPermissionID, "NO");
        }

        this.setPermissions();
    };


    /**
     * This only should be called after permissions have been fully assessed.
     */
    private finishInit() {

        this.askForLocation().then((res) => {
            if (this.platform.is('ios')) {
                //  this.iosNativePermissionStatusUpdate();
            }

            if (Constants.DEBUG_ONE_SIGNAL) {
                this.testOneSignal();
            }
        }, (rej) => {

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
        return new Promise((resolve,reject)=>{
        let askedAndDeclined = LocalStorageHelper.getFromLocalStorage(Constants.ONE_SIGNAL_IOS_PERMISSION_DECLINED);
           
         if (askedAndDeclined !== "true") {
            // this.oneSignal.registerForPushNotifications();
            this.oneSignal.promptForPushNotificationsWithUserResponse().then((result)=>{
                 this.iosNativePermissionStatusUpdate(result);
                 resolve(result);
             })
         } else {
             //Setup the popover content
             let content = {
                 type: Constants.PERMISSION_MODAL,
                 title: Strings.GENERIC_MODAL_TITLE,
                 message: Strings.ONE_SIGNAL_IOS_PERMISSION,
                 negativeButtonText: Strings.MODAL_BUTTON_DECLINE,
                 positiveButtonText: Strings.MODAL_BUTTON_SETTINGS
             };

             this.popoverService.show(content).subscribe((result)=>{
                 if(result == 'OK'){
                    resolve(result);
                 }
             })
         }
        });
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
                console.error(err);
                reject(err);
            });
        });
    }

    private notificationReceived(data: any) {

        //Log only if we areverbose logging
        this.debugLog("Received package:" + JSON.stringify(data), data);

        this.savePackageDate(data);

        this.registerHotDealInMenu(data);

        //Manually increase badge notifications for each notification received
      /*  if (this.platform.is('ios')) {
            this.badge.increase(1);
        }*/

    }

    private registerHotDealInMenu(data){
        const sku = this.extractPackageSKU(data);
        this.debugLog("Registering sku:" + sku);
        //Check data for existence, if there is none, then the notification is something else than a hot deal
        if (sku) {
                //Send an event with the passed SKU

                LocalStorageHelper.saveToLocalStorage(Constants.ONE_SIGNAL_HOT_DEAL_SKU_PATH,sku);
                this.events.publish(Constants.EVENT_HOT_DEAL_NOTIFICATION_RECEIVED, sku);
               

        }

    }

    private validateDate(data){

        let date = JSON.parse(data.rawPayload)['google.sent_time'];
        /** DEBUG ONLY */
       // let dbgDate = new Date();
        //date = dbgDate.setDate(dbgDate.getDate() - 2);
       //=====

        if (this.hotDealService.isHotDealExpired(date)) {
            this.hotDealService.markHotDealExpired();
            return false;
        }
        return true;
    }

    private notificationOpened(data: any) {

        this.debugLog("NOTIFICATION OPENED with data: ", data);

        this.savePackageDate(data);

        this.registerHotDealInMenu(data);
      
        //Process the notification
        this.goToHotDeal(data);

        //Decrease the badge counter for each notification
        if (this.platform.is('ios')) {

            this.badge.decrease(1);
        }
    }


    private savePackageDate(pckg){
        if(pckg && pckg['rawPayload']){
            let OBJTRY = JSON.parse(pckg.rawPayload);
            LocalStorageHelper.saveToLocalStorage(Constants.ONE_SIGNAL_PAYLOAD_TIMESTAMP, OBJTRY['google.sent_time']);

        }
    }

    private extractPackageSKU(pckg){
        if (pckg && pckg.additionalData){
            return pckg.additionalData.SKU;
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
                    
                        additionalData: { SKU: "0011049" }
                   
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

        //forkJoin modal observables such that we continue only when all permission are settled (either granted or rejected)
        Observable.forkJoin(this.askForPermission(
            Strings.GENERIC_MODAL_TITLE,
            Strings.NOTIFICATIONS_PERMISSIONS_MESSAGE,
            this.pushNotificationPermissionID,
            ['android','ios']
        )/*, this.askForPermission(
            Strings.GENERIC_MODAL_TITLE,
            Strings.LOCATION_PERMISSIONS_MESSAGE,
            this.locationPermissionID
        )*/
        ).subscribe(([notification]) => {
            //We save their new result if it's the case
            if (notification) {
                this.permissionSaveResult(Constants.ONE_SIGNAL_NOTIFICATION_PREFERENCE_PATH, notification["optionSelected"]);
            }
            
            //   this.permissionSaveResult(Constants.ONE_SIGNAL_LOCATION_PREFERENCE_PATH, location["optionSelected"]);


            this.updatePermissions(); //Update the permissions from storage



            if (this.platform.is('android')) {
                this.androidPermissionsSetup();
                this.finishInit();
            } else if (this.platform.is('ios')) {
                this.badge.isSupported().then((isSupported) => {
                    if (isSupported) {
                        return this.badge.hasPermission();
                    }
                }).then((hasPermission) => {
                    if (!hasPermission) {
                        return this.badge.requestPermission();
                    }
                }).then((requestResult) => {
                    return this.iOSPermissionsSetup();
                }).then(() => {
                    this.finishInit();
                });
            };
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

        let platformTarget = platforms?false:true;

        platforms.forEach((platform)=>{
            if(this.platform.is(platform)){
                platformTarget = true;
            }
        });

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

    private debugLog(string, object = undefined) {
        if (Constants.ONE_SIGNAL_VERBOSE) {

            if (typeof object != "undefined")
                console.log(string, object);
            else {
                console.log(string);
            }
        }
    }

}