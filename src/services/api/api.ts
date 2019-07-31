import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocalStorageHelper } from '../../helpers/local-storage';
import * as ConstantsURL from '../../util/constants-url';
import * as Constants from '../../util/constants';
import { Observable } from 'rxjs/Observable';
import { SecureActionsService } from '../../services/secure-actions/secure-actions';

@Injectable()
export class ApiService {

  public baseUrl: string;

  constructor(private readonly http: HttpClient, private readonly secureActions: SecureActionsService) {
    this.baseUrl = this.getServiceBaseURL();
  }

  private setHeaders(): any {
    const headers: any = {};
    headers['Content-Type'] = 'application/json';
    return headers;
  }

  public get(baseUrl: string = this.baseUrl, path: string, params: any = {}): Observable<any> {
    return this.http.get(baseUrl + path, { headers: this.setHeaders(), params });
  }

  public post(path: string, body: any & { user_token?: string }, requiresToken: boolean = false): Observable<any> {
    if (requiresToken) {
      return this.secureActions.waitForAuth().flatMap(user => {
        body.user_token = user.userToken;

        return this.http.post(
          this.baseUrl + path,
          JSON.stringify(body),
          { headers: this.setHeaders() }
        ).take(1);
      });
    }
    
    return this.http.post(
      this.baseUrl + path,
      JSON.stringify(body),
      { headers: this.setHeaders() }
    ).take(1);
  }

  private getServiceBaseURL(): string {
    if (! LocalStorageHelper.hasKey(Constants.DEVICE_LANGUAGE)) {
      return ConstantsURL.URL_BASE_EN;
    }
    if (LocalStorageHelper.getFromLocalStorage(Constants.DEVICE_LANGUAGE).toLowerCase().includes(Constants.LANG_FR)) {
      return ConstantsURL.URL_BASE_FR;
    }
    return ConstantsURL.URL_BASE_EN;
  }


}
