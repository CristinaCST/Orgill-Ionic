import { Component } from '@angular/core';
import * as VersionFile from '../../util/version';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  public applicationVersion: String = VersionFile.VERSION;
  public copyrightYear: number = new Date().getFullYear();
}
