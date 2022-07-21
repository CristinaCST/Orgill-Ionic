import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ItemProgram } from '../../interfaces/models/item-program';
import { ApiService } from '../../services/api/api';
import * as ConstantsUrl from '../../util/constants-url';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs';
import { APIResponse } from '../../interfaces/response-body/response';
import { Program } from 'interfaces/models/program';

@Injectable()
export class ProgramProvider {
  private readonly selectedProgramSubject: Subject<ItemProgram> = new Subject<ItemProgram>();
  private readonly packQuantity: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private readonly apiProvider: ApiService) {}

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

  public getPrograms(): Observable<APIResponse> {
    return this.apiProvider.get(ConstantsUrl.URL_PROGRAMS);
  }

  public getProductPrograms(productSku: string): Observable<APIResponse> {
    return this.apiProvider.get(`${ConstantsUrl.URL_PRODUCT_PROGRAMS}/${productSku}`);
  }

  public isMarketOnlyProgram(programNumber: string): Observable<boolean> {
    return this.apiProvider
      .get(ConstantsUrl.URL_PROGRAMS)
      .take(1)
      .map((receivedPrograms: any) => {
        const programs: Program[] = receivedPrograms;
        if (programs.length > 0) {
          const wantedProgram: Program = programs.find(
            program => program.programno === programNumber && (program.marketonly === 'Y' || program.obeonly === 'Y')
          );
          if (wantedProgram) {
            return true;
          }
          return wantedProgram ? true : false;
        }
        return false;
      });
  }

  public getPastPurchases(productSku: string, customer_number: string): Observable<APIResponse> {
    return this.apiProvider.get(`${ConstantsUrl.URL_PAST_PURCHASES}/${productSku}`, { customer_number });
  }

  public getProductDetails(productSku: string): Observable<APIResponse> {
    return this.apiProvider.get(`${ConstantsUrl.URL_INVENTORY_DETAILS}/${productSku}`);
  }

  public getRetailPrice(productSku: string): Observable<APIResponse> {
    return this.apiProvider.get(`${ConstantsUrl.URL_RETAIL_PRICE}/${productSku}`);
  }
}
