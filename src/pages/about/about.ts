import { Component } from '@angular/core';
import * as VersionFile from '../../util/version';
import {LocalStorageHelper} from "../../helpers/local-storage";
import {UserType} from "../../interfaces/models/user-type";
import {USER} from "../../util/constants";

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  public applicationVersion: String = VersionFile.VERSION;
  public copyrightYear: number = new Date().getFullYear();
  public userName: string = JSON.parse(LocalStorageHelper.getFromLocalStorage('user')).user_name;

}
