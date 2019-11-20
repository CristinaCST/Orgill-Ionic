import { Component } from '@angular/core';
import * as VersionFile from '../../util/version';
import { OneSignalService } from '../../services/onesignal/onesignal';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  public applicationVersion: String = VersionFile.VERSION;
  public notificationsAllowed: boolean = false;

  constructor(
    private readonly oneSignalService: OneSignalService
  ){
    this.oneSignalService.isSubscriptionOn().then(state => this.notificationsAllowed = state);
  }

  public pushNotificationsSwitch(event): void {
      if(event.checked){
          this.oneSignalService.androidSubscriptionSwitchOn();
      } else {
          this.oneSignalService.androidSubscriptionSwitchOff();
      }
  }
}
