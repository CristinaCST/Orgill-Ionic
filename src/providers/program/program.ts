
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ItemProgram } from '../../interfaces/models/item-program';
import { ApiService } from '../../services/api/api';
import * as ConstantsUrl from '../../util/constants-url';
import { DatabaseProvider } from '../database/database';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs';
import { APIResponse } from '../../interfaces/response-body/response';
import { AuthService } from '../../services/auth/auth';

@Injectable()
export class ProgramProvider {
  private readonly selectedProgramSubject: Subject<ItemProgram> = new Subject<ItemProgram>();
  private readonly packQuantity: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private readonly apiProvider: ApiService, private readonly databaseProvider: DatabaseProvider, private readonly authService: AuthService) {}

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
      user_token: this.authService.userToken,
      sku: productSku
    };
    return this.apiProvider.post(ConstantsUrl.URL_PRODUCT_PROGRAMS, params);
  }


  public isMarketOnlyProgram(programNumber: string): Promise<any> {
    return this.databaseProvider.getMarketTypeForProgram(programNumber);
  }

}
