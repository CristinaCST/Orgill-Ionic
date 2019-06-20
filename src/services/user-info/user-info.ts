import { Injectable } from '@angular/core';
import { ApiService } from '../api/api';
import * as ConstantsUrl from '../../util/constants-url';
import { Observable } from 'rxjs';
import { APIResponse } from '../../interfaces/response-body/response';
import { AuthService } from '../../services/auth/auth';

@Injectable()
export class UserInfoService {

  constructor(private readonly apiProvider: ApiService, private readonly authService: AuthService) { }

  public getUserLocations(): Observable<APIResponse> {
    const params: any = { 'user_token': this.authService.userToken };
    return this.apiProvider.post(ConstantsUrl.URL_CUSTOMER_LOCATIONS, params);
  }
}
