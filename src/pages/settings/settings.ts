import { Component, OnInit } from '@angular/core';
import * as VersionFile from '../../util/version';
import { OneSignalService } from '../../services/onesignal/onesignal';
import { ModalController, Modal } from 'ionic-angular';
import { AuthService } from '../../services/auth/auth';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage implements OnInit {
  public applicationVersion: String = VersionFile.VERSION;
  public notificationsAllowed: boolean = false;
  public allowLanguageSwitch: boolean;

  constructor(
    private readonly oneSignalService: OneSignalService,
    private readonly modal: ModalController,
    private readonly authService: AuthService
  ) {
    this.oneSignalService.isSubscriptionOn().then(state => this.notificationsAllowed = state);
  }

  public ngOnInit(): void {
    this.authService.getAllowLanguageSwitchListener().subscribe(result => {
      this.allowLanguageSwitch = result;
    });
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
