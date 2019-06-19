import { Injectable } from '@angular/core';
import { ApiService } from '../api/api';
import * as ConstantsUrl from '../../util/constants-url';
import * as Constants from '../../util/constants';
import { LocalStorageHelper } from '../../helpers/local-storage';
import { Observable } from 'rxjs';
import { APIResponse } from '../../interfaces/response-body/response';
import { User } from '../../interfaces/models/user';

@Injectable()
export class UserInfoService {
  private readonly userToken: string;

  constructor(private readonly apiProvider: ApiService) {
    const userInfo: User = JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER));
    if (userInfo) {
      this.userToken = userInfo.userToken;
    }
  }

  public getUserLocations(): Observable<APIResponse> {
    const params: any = { 'user_token': this.userToken };
    return this.apiProvider.post(ConstantsUrl.URL_CUSTOMER_LOCATIONS, params);
  }
}
