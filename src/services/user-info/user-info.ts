import { Injectable } from '@angular/core';
import { ApiService } from '../api/api';
import * as ConstantsUrl from '../../util/constants-url';
import * as Constants from '../../util/constants';
import { LocalStorageHelper } from '../../helpers/local-storage';

@Injectable()
export class UserInfoService {
  private readonly userToken: string;

  constructor(private apiProvider: ApiService) {
    const userInfo = JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER));
    if (userInfo) {
      this.userToken = userInfo.userToken;
    }
  }

  public getUserLocations() {
    const params = { 'user_token': this.userToken };
    return this.apiProvider.post(ConstantsUrl.URL_CUSTOMER_LOCATIONS, params);
  }
}
