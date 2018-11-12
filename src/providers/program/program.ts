import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ItemProgram} from "../../interfaces/models/item-program";
import {ApiProvider} from "../api-provider";
import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import * as ConstantsUrl from "../../util/constants-url";
import * as Constants from "../../util/constants";
import {DatabaseProvider} from "../database/database";

@Injectable()
export class ProgramProvider {
  private readonly userToken;
  private selectedProgramSubject = new BehaviorSubject<any>({});
  private packQuantity = new BehaviorSubject<any>(false);

  constructor(private apiProvider: ApiProvider, private databaseProvider: DatabaseProvider) {
    let userInfo = JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER));
    if (userInfo) {
      this.userToken = userInfo.userToken;
    }
  }

  setPackQuantity(value) {
    this.packQuantity.next(value);
  }

  isPackQuantity() {
    return this.packQuantity.asObservable();
  }

  selectProgram(program: ItemProgram) {
    this.selectedProgramSubject.next(program);
  }

  getSelectedProgram() {
    return this.selectedProgramSubject.asObservable();
  }

  getProductPrograms(productSku) {
    let params = {
      "user_token": this.userToken,
      "sku": productSku
    };
    return this.apiProvider.post(ConstantsUrl.URL_PRODUCT_PROGRAMS, params)
  }

  isMarketOnlyProgram(programNumber: string) {
    return this.databaseProvider.getMarketTypeForProgram(programNumber);
  }

}
