import { Injectable } from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Md5} from "ts-md5";
import {LoginRequest} from "../../interfaces/request-body/login-request";
import {ApiProvider} from "../api-provider";
import * as ConstantsURL from "../../util/constants-url";

@Injectable()
export class AuthServiceProvider {

  constructor(private apiProvider : ApiProvider) {
  }

  private encryption(password){
    return Md5.hashStr(password.toLowerCase());
  }

  login(credentials: LoginRequest): Observable<any>{
    let encryptedPassword;
    encryptedPassword = this.encryption(credentials.password.toLowerCase());
    credentials.password = encryptedPassword;
    credentials.username = credentials.username.toLowerCase();
    return this.apiProvider.post(ConstantsURL.URL_LOGIN,credentials);
  }




}
