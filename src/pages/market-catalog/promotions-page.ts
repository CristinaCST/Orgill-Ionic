import { Component, OnInit } from '@angular/core';
import { TranslateWrapperService } from '../../services/translate/translate';
import { NavigatorService } from '../../services/navigator/navigator';
import { Catalog } from '../catalog/catalog';
import { Program } from '../../interfaces/models/program';
import { PromotionsService } from '../../services/promotions/promotions';

@Component({
  selector: 'promotions-page',
  templateUrl: 'promotions-page.html'
})
export class PromotionsPage implements OnInit {
  public pageTitle: string = this.translateProvider.translate('promotions');

  public promotionsOnlyPrograms: Program[] = [];

  constructor(
    public translateProvider: TranslateWrapperService,
    private readonly promotionsService: PromotionsService,
    private readonly navigatorService: NavigatorService
  ) {}

  public ngOnInit(): void {
    this.getPromotionsOnlyPrograms();
  }

  public showPromotionsPrograms(program: Program): void {
    const params: any = {
      programName: program.NAME,
      programNumber: program.PROGRAMNO
    };

    this.navigatorService.setRoot(Catalog, params).catch(err => console.error(err));
  }

  public getPromotionsOnlyPrograms(): void {
    this.promotionsService.promotionsOnlyPrograms$.subscribe(data => {
      this.promotionsOnlyPrograms = data;
    });
  }
}
