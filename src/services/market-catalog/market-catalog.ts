import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Program } from '../../interfaces/models/program';

@Injectable()
export class MarketCatalogsService {

  private readonly marketOnlyProgramsSubject: BehaviorSubject<Program[]> = new BehaviorSubject<Program[]>([]);

  public marketOnlyPrograms$: Observable<Program[]> = this.marketOnlyProgramsSubject.asObservable();

  public setMarketOnlyPrograms(programs: Program[]): void {
    return this.marketOnlyProgramsSubject.next(programs);
  }

}
