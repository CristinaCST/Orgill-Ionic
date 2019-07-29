import { Injectable } from '@angular/core';
import { ApiService } from '../api/api';
import * as ConstantsUrl from '../../util/constants-url';
import { Observable } from 'rxjs';
import { APIResponse } from '../../interfaces/response-body/response';

@Injectable()
export class UserInfoService {

  constructor(private readonly apiProvider: ApiService) { }

  public getUserLocations(): Observable<APIResponse> {
    return this.apiProvider.post(ConstantsUrl.URL_CUSTOMER_LOCATIONS, {}, true);
  }
}
