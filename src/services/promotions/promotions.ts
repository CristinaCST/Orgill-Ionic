import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Program } from '../../interfaces/models/program';

@Injectable()
export class PromotionsService {
  private readonly promotionsOnlyProgramsSubject: BehaviorSubject<Program[]> = new BehaviorSubject<Program[]>([]);

  public promotionsOnlyPrograms$: Observable<Program[]> = this.promotionsOnlyProgramsSubject.asObservable();

  public setPromotionsOnlyPrograms(programs: Program[]): void {
    return this.promotionsOnlyProgramsSubject.next(programs);
  }
}
