
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ItemProgram } from '../../interfaces/models/item-program';
import { ApiService } from '../../services/api/api';
import { LocalStorageHelper } from '../../helpers/local-storage';
import * as ConstantsUrl from '../../util/constants-url';
import * as Constants from '../../util/constants';
import { DatabaseProvider } from '../database/database';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class ProgramProvider {
  private readonly userToken: string;
  private readonly selectedProgramSubject: Subject<any> = new Subject<any>();
  private readonly packQuantity: BehaviorSubject<any> = new BehaviorSubject<any>(false);

  constructor(private readonly apiProvider: ApiService, private readonly databaseProvider: DatabaseProvider) {
    const userInfo = JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER));
    if (userInfo) {
      this.userToken = userInfo.userToken;
    }
  }

  public setPackQuantity(value) {
    this.packQuantity.next(value);
  }

  public isPackQuantity() {
    return this.packQuantity.asObservable();
  }

  public selectProgram(program: ItemProgram) {
    this.selectedProgramSubject.next(program);
  }

  public getSelectedProgram() {
    return this.selectedProgramSubject.asObservable();
  }

  public getProductPrograms(productSku) {
    const params = {
      'user_token': this.userToken,
      'sku': productSku
    };
    return this.apiProvider.post(ConstantsUrl.URL_PRODUCT_PROGRAMS, params);
  }


  public isMarketOnlyProgram(programNumber: string) {
    return this.databaseProvider.getMarketTypeForProgram(programNumber);
  }

}
