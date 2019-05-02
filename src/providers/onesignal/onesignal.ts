import { Injectable } from '@angular/core';
import { OneSignal } from '@ionic-native/onesignal';
import * as Constants from '../../util/constants';
import { LocalStorageHelper } from "../../helpers/local-storage-helper";
import { FlashDealProvider } from '../../providers/flashdeal/flashdeal';
import { Badge } from "@ionic-native/badge";
import { Events, Platform } from 'ionic-angular';
import { PopoversProvider } from '../../providers/popovers/popovers';
import { Observable} from 'rxjs';


@Injectable()
export class OneSignalProvider {
    private pushNotificationPermissionID : string = Constants.ONE_SIGNAL_NOTIFICATION_PREFERENCE_PATH;
    private locationPermissionID : string = Constants.ONE_SIGNAL_LOCATION_PREFERENCE_PATH;

    private pushNotificationPermission : boolean = false;
    private locationPermission : boolean = false;

    constructor(private oneSignal: OneSignal,    //Onesignal library
        private badge: Badge,   //Badge for icon notification
        private flashDealProvider: FlashDealProvider,   //Provider to call for flash deals
        private events: Events,     //Propagate event
        private platform: Platform,   //Check platform
        private popover: PopoversProvider,     //Use popovers to ask for permissions
    ) { };


    public init(){

        if(Constants.DEBUG_ONE_SIGNAL)
        {
            this.permissionSaveResult(this.pushNotificationPermissionID,"NO");
            this.permissionSaveResult(this.locationPermissionID,"NO");
        }

        //Begin initialiation with specific API keys
        this.oneSignal.startInit(Constants.ONE_SIGNAL_API_KEY, Constants.ONE_SIGNAL_ANDROID_PROJECT_TITLE);

         //Sort out the permissions needed
        this.setPermissions();
    };

    private finishInit(){

        this.updatePermissions();
       // console.log("LOCATION PERMS:" + this.locationPermission);
        this.oneSignal.setLocationShared(this.locationPermission);

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

        //What happens when a notification is received
        this.oneSignal.handleNotificationReceived().subscribe((data: any) => {

            //Only log if we set verbose on
            if (Constants.ONE_SIGNAL_VERBOSE) {
                console.log(JSON.stringify(data));  //Transform the data into string
            }

            //Check data for existence, if there is none, then the notification is something else than a flash deal
            if (data) {
                if (data.payload.additionalData.SKU) {  //Check if there is a SKU in the correct object format

                    //Send an event with the passed SKU
                    this.events.publish(Constants.EVENT_FLASH_DEAL_NOTIFICATION_RECEIVED, data.payload.additionalData.SKU);
                }
            }

            //Manually increase badge notifications for each notification received
            this.badge.increase(1);
        });

        //Handle the opening of a notification
        this.oneSignal.handleNotificationOpened().subscribe((data) => {

            //Log only if we areverbose logging
            if (Constants.ONE_SIGNAL_VERBOSE) {
                console.log("NOTIFICATION OPENED", data);
            }

            //Save the fact we begin navigating from a notification
            LocalStorageHelper.saveToLocalStorage('fromNotification', 'true');

            //Process the notification
            this.checkSession(data);

            //Decrease the badge counter for each notification
            this.badge.decrease(1);
        });

        //Finalize OneSignal init
        this.oneSignal.endInit();

        this.oneSignal.setSubscription(this.pushNotificationPermission); 

         //Log only if we are verbose logging
         if (Constants.ONE_SIGNAL_VERBOSE) {
            console.log("OneSignal fully initiaized");
        }
    };

    /**
     * Initializes oneSignal plugin along with checking for permissions
    */
    private testOneSignal() {

        /**
         * HACK: FAKE SKU for testing
        */
        this.checkSession(
            {
            notification: {
                payload: {
                    additionalData: { SKU: "7515000" }
                }
            }
        });
    };



    /**
     * 
     * @param data Should be a packet from OneSignal, it can be left null to process a simple push notification without payload
     */
    private checkSession(data=null) {

        if (data) {
            if (data.notification.payload.additionalData.SKU) {

                //If the payload is valid, try to navigate to it, if not, log the error if logging is on
                try {
                    this.flashDealProvider.navigateToFlashDeal(data.notification.payload.additionalData.SKU);
                } catch (exception) {
                    if (Constants.ONE_SIGNAL_VERBOSE) {
                        console.log("Couldn't navigate to flash deal because " + exception);
                    }
                }

            } else {    //If there is data but the package does not respect the flash deal structure
                if (Constants.ONE_SIGNAL_VERBOSE) {
                    console.log("ONESIGNAL package is not a flash deal but it exists...")
                }
            }
        }
        else {  //If the package is empty just open the app?
            //TODO: Implement something here?
            if (Constants.ONE_SIGNAL_VERBOSE) {
                console.log("ONESIGNAL NOTIFICATION PACKET IS NULL...")
            }
        }
    };


    private updatePermissions(){
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

        this.updatePermissions();


        Observable.forkJoin(this.askForPermission(
            Constants.O_ZONE,
            Constants.NOTIFICATIONS_PERMISIONS_MESSAGE,
            this.pushNotificationPermission,
            this.pushNotificationPermissionID
        ),this.askForPermission(
            Constants.O_ZONE,
            Constants.LOCATION_PERMISSIONS_MESSAGE,
            this.locationPermission,
            this.locationPermissionID
        )).subscribe(([notification,location])=>{
            this.permissionSaveResult(Constants.ONE_SIGNAL_NOTIFICATION_PREFERENCE_PATH, notification["optionSelected"]);
            this.permissionSaveResult(Constants.ONE_SIGNAL_LOCATION_PREFERENCE_PATH, location["optionSelected"]);
            this.finishInit();
        });

    };

    private askForPermission(title, message, permission, permissionID){

        let permissionModalDismissed = LocalStorageHelper.getFromLocalStorage(permissionID+"Modal") === 'true';

           if(permissionModalDismissed || permission)
           {
               return Observable.of([]); //Return empty observable
           }
   
           let popoverContent = {
               type: Constants.PERMISSION_MODAL,
               title,
               message,
               negativeButtonText: Constants.PERMISSION_DENY,
               positiveButtonText: Constants.PERMISSION_ALLOW,
               dismissButtonText: Constants.PERMISSION_NEVER
           };
   
           return this.popover.show(popoverContent);
    };


    /**
     * Save the result of asking for a permission using preference constant ID
     * @param preferenceID Constant ID for the permission 
     * @param result The result of popover service.
     */
    private permissionSaveResult(preferenceID, result){

        console.log(preferenceID.toString()+result);

        function savePermissionModal(modalStatus, preferenceStatus){
            LocalStorageHelper.saveToLocalStorage(preferenceID+"Modal", modalStatus.toString());
            LocalStorageHelper.saveToLocalStorage(preferenceID, preferenceStatus.toString());
        }

        switch (result) {
            case "DISMISS":
                savePermissionModal(true,false);    //Never show again, implicitely don't give permission
                break;

            case "OK":
                savePermissionModal(true,true);    //Don't show again modal since permission was granted
                break;

            case "NO":
                savePermissionModal(false,false);   //If permission is not granted and modal is not dismissed permanently, show it next time
                break;

            default:
            console.log("No valid modal result for OneSignal permissions, received:" + result) //TODO: Change to be tied to debug strings and be dynamic
            break;
        };
    };

}