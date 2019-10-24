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
    this.notificationsAllowed = this.oneSignalService.isPermissionsOn();
  }

  public pushNotificationsSwitch(event): void {
      if(event.checked){
          this.oneSignalService.androidPermissionSwitchOn();
      } else {
          this.oneSignalService.androidPermissionSwitchOff();
      }
  }
}
