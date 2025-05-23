import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { SecureActionsService } from '../../services/secure-actions/secure-actions';
import { environment } from '../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { User } from '../../interfaces/models/user';
import {LocalStorageHelper} from "../../helpers/local-storage";
import * as Constants from '../../util/constants';
import {TRANSPORTATION_TOKEN} from "../../util/constants";
import {hammer} from "ionicons/icons";
import {RequestOptions} from "@angular/http";


@Injectable()
export class ApiService {
  public baseUrl: string;
  public userToken: string;
  public transportationToken: string;

  constructor(
    private readonly http: HttpClient,
    public readonly secureActions: SecureActionsService,
    public translate: TranslateService
  ) {
    console.log("use", this.transportationToken);
    translate.onLangChange.subscribe(() => {
      this.baseUrl = this.getServiceBaseURL();
    });

    secureActions
      .waitForAuth()
      .first()
      .subscribe((user: User) => {
        this.userToken = user.user_Token;
      });
  }

  private setHeaders(setDashboardAuthorization?: boolean): any {
    const headers: any = {};
    headers['Content-Type'] = 'application/json';

    if (this.userToken) {
      headers.user_token = this.userToken;
    }

    if (setDashboardAuthorization) {
      this.transportationToken = LocalStorageHelper.getFromLocalStorage(TRANSPORTATION_TOKEN);
      headers.Authorization = this.transportationToken;
      headers.user_token = this.transportationToken;
    }

    return headers;
  }

  public get(
    path: string,
    params: any = {},
    baseUrl: string = this.baseUrl,
    setDashboardAuthorization?: boolean,
  ): Observable<any> {
    return this.http.get(baseUrl + path, { headers: this.setHeaders(setDashboardAuthorization), params });
  }

  public post(
    path: string,
    body: any & { user_token?: string },
    requiresToken: boolean = false,
    useExternalAPI: boolean = false,
    baseUrl: string = useExternalAPI ? '' : this.getServiceBaseURL()
  ): Observable<any> {
    if (requiresToken) {
      body[useExternalAPI ? 'token' : 'user_token'] = this.userToken;
      return this.http.post(baseUrl + path, JSON.stringify(body), { headers: this.setHeaders(useExternalAPI) }).take(1);
    }
    return this.http.post(this.baseUrl + path, JSON.stringify(body), { headers: this.setHeaders() }).take(1);
  }

  public fetch(path: string, token: string): Observable<any> {
    const headers: any = this.setHeaders();
    headers.user_token = token;
    return this.http.get(this.baseUrl + path, { headers });
  }

  public put(path: string, body: any, baseUrl: string = this.baseUrl): Observable<any> {
    return this.http.put(baseUrl + path, body, { headers: this.setHeaders() });
  }

  public delete(path: string, params: any = {}, baseUrl: string = this.baseUrl): Observable<any> {
    return this.http.delete(baseUrl + path, { headers: this.setHeaders(), params });
  }

  private getServiceBaseURL(): string {
    if (this.translate.currentLang === 'fr') {
      return environment.baseUrlFrench;
    }
    return environment.baseUrlEnglish;
  }
}
