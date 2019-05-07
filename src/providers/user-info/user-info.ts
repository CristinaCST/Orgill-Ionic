import {Injectable} from '@angular/core';
import {ApiProvider} from "../api/api";
import * as ConstantsUrl from "../../util/constants-url";
import * as Constants from "../../util/constants";
import {LocalStorageHelper} from "../../helpers/local-storage";

@Injectable()
export class UserInfoProvider {
  private readonly userToken;

  constructor(private apiProvider: ApiProvider) {
    let userInfo = JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER));
    if (userInfo) {
      this.userToken = userInfo.userToken;
    }
  }

  getUserLocations() {
    let params = {"user_token": this.userToken};
    return this.apiProvider.post(ConstantsUrl.URL_CUSTOMER_LOCATIONS, params);
  }
}
