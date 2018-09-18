import {Injectable} from '@angular/core';
import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import * as ConstantsUrl from "../../util/constants-url";
import * as Constants from "../../util/constants";
import {ApiProvider} from "../api-provider";
import {EmptyObservable} from "rxjs/observable/EmptyObservable";

@Injectable()
export class CatalogsProvider {

  private readonly userToken;

  constructor(private apiProvider: ApiProvider) {
    let userInfo = JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER));
    if (userInfo) {
      this.userToken = userInfo.userToken;
    }
  }

  getPrograms() {
    if (this.userToken) {
      let params = {"user_token": this.userToken};
      return this.apiProvider.post(ConstantsUrl.URL_PROGRAMS, params);
    } else {
      return new EmptyObservable;
    }
  }

}
