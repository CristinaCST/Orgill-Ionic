import { Component } from '@angular/core';
import * as VersionFile from '../../util/version';
import { OneSignalService } from '../../services/onesignal/onesignal';
import { ModalController, Modal } from 'ionic-angular';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  public applicationVersion: String = VersionFile.VERSION;
  public notificationsAllowed: boolean = false;

  constructor(
    private readonly oneSignalService: OneSignalService,
    private readonly modal: ModalController
  ) {
    this.oneSignalService.isSubscriptionOn().then(state => this.notificationsAllowed = state);
  }

  public pushNotificationsSwitch(event: { checked: any; }): void {
      if (event.checked) {
          this.oneSignalService.androidSubscriptionSwitchOn();
      } else {
          this.oneSignalService.androidSubscriptionSwitchOff();
      }
  }

  public openModal(): void {
    const modalLanguages: Modal = this.modal.create('ModalLanguagesPage');

    modalLanguages.present();
  }
}
