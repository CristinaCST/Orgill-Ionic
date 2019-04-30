import { Injectable } from '@angular/core';
import { OneSignal } from '@ionic-native/onesignal';
import * as Constants from '../../util/constants';
import { LocalStorageHelper } from "../../helpers/local-storage-helper";
import { FlashDealProvider } from '../../providers/flashdeal/flashdeal';
import { Badge } from "@ionic-native/badge";
import { Events, Platform } from 'ionic-angular';
import { TranslateProvider } from '../../providers/translate/translate';
import { PopoversProvider } from '../../providers/popovers/popovers';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class OneSignalProvider {
    private pushNotificationPermission : boolean = false;
    private locationPermission : boolean = false;
    private setup = new Subject<any>();

    constructor(private oneSignal: OneSignal,    //Onesignal library
        private badge: Badge,   //Badge for icon notification
        private flashDealProvider: FlashDealProvider,   //Provider to call for flash deals
        private events: Events,     //Propagate event
        private platform: Platform,   //Check platform
        private translateProvider: TranslateProvider,   //Provider for translating things
        private popover: PopoversProvider,     //Use popovers to ask for permissions
    ) { };


    beginInit(){

        if(Constants.DEBUG_ONE_SIGNAL)
        {
            this.saveLocationPreference(false,false);
            this.saveNotificationsPreference(false,false);
        }

        //Begin initialiation with specific API keys
        this.oneSignal.startInit(Constants.ONE_SIGNAL_API_KEY, Constants.ONE_SIGNAL_ANDROID_PROJECT_TITLE);

         //Sort out the permissions needed
        this.setPermissions();

        this.setup.asObservable().subscribe((result)=>{
            if(result==='final'){
                this.updatePermissions();
                console.log("LOCATION PERMS:" + this.locationPermission);
                this.oneSignal.setLocationShared(this.locationPermission);
                this.finishInit();
            }
        }); 
    }

    finishInit(){

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

         //Log only if we areverbose logging
         if (Constants.ONE_SIGNAL_VERBOSE) {
            console.log("OneSignal fully initiaized");
        }
    }

    /**
     * Initializes oneSignal plugin along with checking for permissions
    */
    setOneSignal() {

        /**
         * HACK: FAKE SKU for testing
        */
      /*  this.checkSession({
            notification: {
                payload: {
                    additionalData: { SKU: "7515000" }
                }
            }
        }
        );*/
    }



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
    }


    updatePermissions(){
        this.pushNotificationPermission = LocalStorageHelper.getFromLocalStorage(Constants.ONE_SIGNAL_NOTIFICATION_PREFERENCE_PATH) === 'true';
        this.locationPermission = LocalStorageHelper.getFromLocalStorage(Constants.ONE_SIGNAL_LOCATION_PREFERENCE_PATH) === 'true';
    }

    /**
     * Check or get all needed permissions.
     */
    setPermissions() {

        //Check badge permission
        if (!this.badge.hasPermission()) {
            this.badge.requestPermission();
        }


        this.updatePermissions();
        
        let notificationModalDismissed = LocalStorageHelper.getFromLocalStorage(Constants.ONE_SIGNAL_NOTIFICATION_MODAL_PATH) === 'true';
        let locationModalDismissed = LocalStorageHelper.getFromLocalStorage(Constants.ONE_SIGNAL_LOCATION_MODAL_PATH) === 'true';


        //TODO: Handle iOS specifics
        if(!this.pushNotificationPermission && !notificationModalDismissed)
        {
          this.askForNotification();
        }
        if(!this.locationPermission && !locationModalDismissed){
         this.askForLocation();
        }else
        {
            this.setup.next('final');
        }
    }

    askForNotification() {
        let popoverContent = {
            type: Constants.LOCATION_PERMISSIONS_NOT_GRANTED,
            title: this.translateProvider.translate(Constants.O_ZONE),
            message: this.translateProvider.translate(Constants.NOTIFICATIONS_PERMISIONS_MESSAGE),
            negativeButtonText: this.translateProvider.translate(Constants.CANCEL),
            positiveButtonText: this.translateProvider.translate(Constants.NOTIFICATIONS_PERMISIONS_BTN_SUCCESS),
            dismissButtonText: this.translateProvider.translate(Constants.NOTIFICATIONS_PERMISIONS_BTN_DISMISS)
        };

        this.popover.show(popoverContent).subscribe(data => {
            switch (data.optionSelected) {
                case "DISMISS":
                    this.saveNotificationsPreference(true,false);
                    break;

                case "OK":
                    this.saveNotificationsPreference(true,true);
                    break;

                case "NO":
                    this.saveNotificationsPreference(false,false);
                    break;
            };
        });
        return true;
    }

    saveLocationPreference(modalStatus:boolean,locationStatus:boolean){
        LocalStorageHelper.saveToLocalStorage(Constants.ONE_SIGNAL_LOCATION_MODAL_PATH, modalStatus.toString());
        LocalStorageHelper.saveToLocalStorage(Constants.ONE_SIGNAL_LOCATION_PREFERENCE_PATH, locationStatus.toString());
    }

    saveNotificationsPreference(modalStatus:boolean, notificationsStatus:boolean){
        LocalStorageHelper.saveToLocalStorage(Constants.ONE_SIGNAL_NOTIFICATION_MODAL_PATH, modalStatus.toString());
        LocalStorageHelper.saveToLocalStorage(Constants.ONE_SIGNAL_NOTIFICATION_PREFERENCE_PATH, modalStatus.toString());
    }

    askForLocation() {

        let popoverContent = {
            type: Constants.LOCATION_PERMISSIONS_NOT_GRANTED,
            title: this.translateProvider.translate(Constants.O_ZONE),
            message: this.translateProvider.translate(Constants.LOCATION_PERMISSIONS_MESSAGE),
            negativeButtonText: this.translateProvider.translate(Constants.CANCEL),
            positiveButtonText: this.translateProvider.translate(Constants.SCAN_GRANT_PERMISSION),
            dismissButtonText: this.translateProvider.translate(Constants.LOCATION_NEVER_SHOW)
        };

        this.popover.show(popoverContent).subscribe(data => {
            switch (data.optionSelected) {
                case "DISMISS":
                    this.saveLocationPreference(true,false);
                    break;

                case "OK":
                    this.saveLocationPreference(true,true);
                    break;

                case "NO":
                    this.saveLocationPreference(false,false);
                    break;
            };
            this.setup.next("final");
        });
        return true;
        
    }

}