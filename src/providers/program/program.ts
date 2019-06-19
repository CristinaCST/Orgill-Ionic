
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ItemProgram } from '../../interfaces/models/item-program';
import { ApiService } from '../../services/api/api';
import { LocalStorageHelper } from '../../helpers/local-storage';
import * as ConstantsUrl from '../../util/constants-url';
import * as Constants from '../../util/constants';
import { DatabaseProvider } from '../database/database';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs';
import { APIResponse } from '../../interfaces/response-body/response';
import { User } from '../../interfaces/models/user';

@Injectable()
export class ProgramProvider {
  private readonly userToken: string;
  private readonly selectedProgramSubject: Subject<ItemProgram> = new Subject<ItemProgram>();
  private readonly packQuantity: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private readonly apiProvider: ApiService, private readonly databaseProvider: DatabaseProvider) {
    const userInfo: User = JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER));
    if (userInfo) {
      this.userToken = userInfo.userToken;
    }
  }

  public setPackQuantity(value: boolean): void {
    this.packQuantity.next(value);
  }

  public isPackQuantity(): Observable<boolean> {
    return this.packQuantity.asObservable();
  }

  public selectProgram(program: ItemProgram): void {
    this.selectedProgramSubject.next(program);
  }

  public getSelectedProgram(): Observable<ItemProgram> {
    return this.selectedProgramSubject.asObservable();
  }

  public getProductPrograms(productSku: string): Observable<APIResponse> {
    const params: any = {
      user_token: this.userToken,
      sku: productSku
    };
    return this.apiProvider.post(ConstantsUrl.URL_PRODUCT_PROGRAMS, params);
  }


  public isMarketOnlyProgram(programNumber: string): Promise<any> {
    return this.databaseProvider.getMarketTypeForProgram(programNumber);
  }

}
