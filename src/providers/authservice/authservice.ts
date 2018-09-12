import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Md5} from "ts-md5";
import {LoginRequest} from "../../interfaces/request-body/login-request";
import {ApiProvider} from "../api-provider";
import * as ConstantsURL from "../../util/constants-url";
import 'rxjs/add/operator/map';
import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import * as Constants from "../../util/constants";
import {User} from "../../interfaces/models/user";


@Injectable()
export class AuthServiceProvider {

  private user: User;

  constructor(private apiProvider: ApiProvider) {
  }

  private static encryption(password) {
    return Md5.hashStr(password.toLowerCase()).toString();
  }

  login(credentials: LoginRequest): Observable<any> {

    credentials.username = credentials.username.toLowerCase();
    credentials.password = AuthServiceProvider.encryption(credentials.password);

    return this.apiProvider.post(ConstantsURL.URL_LOGIN, credentials).map(user => {

      console.log(user);
      this.user.password = credentials.password;
      this.user.user_name = credentials.username;
      this.user.userToken = JSON.parse(user.d)['User_Token'];

      //TODO it is not safe--> remove static in the future & public
      LocalStorageHelper.saveToLocalStorage(Constants.USER, JSON.stringify(this.user));
    });
  }


}
