import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocalStorageHelper } from '../../helpers/local-storage';
import * as ConstantsURL from '../../util/constants-url';
import * as Constants from  '../../util/constants';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ApiService {

  public baseUrl: String;

  constructor(public http: HttpClient) {
    this.baseUrl = this.getServiceBaseURL();
  }

  private setHeaders() {
    const headers = {};
    headers['Content-Type'] = 'application/json';
    return headers;
  }

  public get(baseUrl = this.baseUrl, path: string, params = {}): Observable<any> {
    return this.http.get(baseUrl + path, { headers: this.setHeaders(), params });
  }

  public post(path: string, body: Object = {}): Observable<any> {
    return this.http.post(
      this.baseUrl + path,
      JSON.stringify(body),
      { headers: this.setHeaders() }
    );
  }

  private getServiceBaseURL(): string {
    if (! LocalStorageHelper.hasKey(Constants.DEVICE_LANGUAGE)) {
      return ConstantsURL.URL_BASE_EN;
    }
    if (LocalStorageHelper.getFromLocalStorage(Constants.DEVICE_LANGUAGE).toLowerCase().includes(Constants.LANG_FR)) {
      return ConstantsURL.URL_BASE_FR;
    } else {
      return ConstantsURL.URL_BASE_EN;
    }

  }


}
