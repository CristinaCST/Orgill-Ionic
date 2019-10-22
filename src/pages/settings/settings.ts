import { Component } from '@angular/core';
import * as VersionFile from '../../util/version';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  public applicationVersion: String = VersionFile.VERSION;
}
