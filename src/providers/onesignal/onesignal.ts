import { Injectable } from '@angular/core';
import { OneSignal} from '@ionic-native/onesignal';
import * as Constants from '../../util/constants';
import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import { FlashDealProvider } from '../../providers/flashdeal/flashdeal';
import {Badge} from "@ionic-native/badge";
import { Events, Platform } from 'ionic-angular';
import { TranslateProvider } from '../../providers/translate/translate';
import { PopoversProvider } from '../../providers/popovers/popovers';
import {Geolocation} from "@ionic-native/geolocation";

@Injectable()
export class OneSignalProvider{
   constructor(private oneSignal: OneSignal,
    private badge: Badge,
    private flashDealProvider: FlashDealProvider,
    private events: Events,
    private platform: Platform,
    private translateProvider: TranslateProvider,
    private popover: PopoversProvider,
    private geolocation: Geolocation
   ){
    }

   setOneSignal(){

    var iosSettings = {kOSSettingsKeyAutoPrompt: false, kOSSettingsKeyInAppLaunchURL: false};


    this.oneSignal.setLocationShared(true);


    //????? prod onesignal?
   // this.oneSignal.startInit('a11b3e10-bce2-41e9-a6d0-746042798d7e', 'orgill-5a5ba');
    this.oneSignal.startInit(Constants.ONE_SIGNAL_API_KEY, Constants.ONE_SIGNAL_ANDROID_PROJECT_TITLE);


    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
    this.oneSignal.iOSSettings(iosSettings);
    this.oneSignal.setLogLevel({
        logLevel: Constants.ONE_SIGNAL_VERBOSE?6:1, //Are we verbose logging? If not, log only fatal errors
        visualLevel: 1
    });

    this.oneSignal.handleNotificationReceived().subscribe((data: any) => {
        if(Constants.ONE_SIGNAL_VERBOSE){
          console.log(JSON.stringify(data));
        }
        //AlertsHelper.hidePopoverAlert();
        if (data) {
            if (data.payload.additionalData.SKU) {
                this.events.publish(Constants.EVENT_FLASH_DEAL_NOTIFICATION_RECEIVED, data.payload.additionalData.SKU);
            }
        }
        this.badge.increase(1);
    });

    this.oneSignal.handleNotificationOpened().subscribe((data) => {
      if(Constants.ONE_SIGNAL_VERBOSE){
        console.log("NOTIFICATION OPENED", data);
      }
       // this.menuController.close('main_menu');
       // this.menuController.close('custom_shopping_lists_menu');
        LocalStorageHelper.saveToLocalStorage('fromNotification', 'true');
        this.checkSession(data);
        this.badge.decrease(1);
    });

    this.oneSignal.endInit();
    }



    private checkSession(data) {

        if (Constants.ONE_SIGNAL_VERBOSE) {
            console.log("ONESIGNAL CHECK SESSION...")
        }
        if (data) {
            if (data.notification.payload.additionalData.SKU) {
                //  this.programProvider.getFlashDealsProduct//(data.notification.payload.additionalData.SKU)
                this.flashDealProvider.navigateToFlashDeal(data.notification.payload.additionalData.SKU);

               if (Constants.ONE_SIGNAL_VERBOSE) {
                console.log("ONE SIGNAL HAS PAcKAGE")
            }
            }
        }
        else {
            if (Constants.ONE_SIGNAL_VERBOSE) {
                console.log("ONESIGNAL NOTIFICATION PACKET IS NULL...")
            }
        }
    }

    setNotificationsAndLocationPermissions() {
        // if (this.platform.is('ios')) {
        let isNotificationShowed = LocalStorageHelper.getFromLocalStorage('NotifPermissions') === 'true';
        //     if (isNotificationShowed) {
        //         this.oneSignal.addPermissionObserver().subscribe((data) => console.log('onesignal permission data', data));
        //         this.askForLocation();
        //     }
        // }
        // if (this.platform.is('android')) {
        //     this.askForLocation();
        // }
        let neverShowModal = LocalStorageHelper.getFromLocalStorage('locationModalNeverShow') === 'true';
        if (((this.platform.is('ios') && isNotificationShowed) || this.platform.is('android'))
            && !neverShowModal) {
            this.askForLocation();
        }
    }

    askForLocation() {
        this.getLocation().then(res => {
           console.log(res.coords.latitude);
           console.log(res.coords.longitude);
           console.log("POSITION GRABBED");
        }).catch(err => {
                console.error(err);
                let popoverContent = {
                    type: Constants.LOCATION_PERMISSIONS_NOT_GRANTED,
                    title: this.translateProvider.translate(Constants.O_ZONE),
                    message: this.translateProvider.translate(Constants.LOCATION_PERMISSIONS_MESSAGE),
                    negativeButtonText: this.translateProvider.translate(Constants.CANCEL),
                    positiveButtonText: this.translateProvider.translate(Constants.SCAN_GRANT_PERMISSION),
                    dismissButtonText: Constants.LOCATION_NEVER_SHOW
                };

                this.popover.show(popoverContent);
            }
        );
    }

    getLocation() {
            return this.geolocation.getCurrentPosition();
    }

}