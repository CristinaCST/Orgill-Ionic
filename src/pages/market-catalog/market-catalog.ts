import { Component, OnInit } from '@angular/core';
import { TranslateWrapperService } from '../../services/translate/translate';
import { NavigatorService } from '../../services/navigator/navigator';
import { Catalog } from '../../pages/catalog/catalog';
import { MARKET_CATALOG } from '../../util/strings';
import { Program } from '../../interfaces/models/program';
import { ThrowStmt } from '@angular/compiler';
import { MarketCatalogsService } from '../../services/market-catalog/market-catalog';

@Component({
  selector: 'market-catalog',
  templateUrl: 'market-catalog.html'
})
export class MarketCatalogPage implements OnInit {
  public pageTitle: string = this.translateProvider.translate(MARKET_CATALOG);

  public marketOnlyPrograms: Program[] = [];

  constructor(
    public translateProvider: TranslateWrapperService,
    private readonly marketCatalogsService: MarketCatalogsService,
    private readonly navigatorService: NavigatorService) {

  }

  public ngOnInit(): void {
    this.getMarketOnlyPrograms();
  }

  public showMarketPrograms(program: Program): void {
    const params: any = {
      programName: program.NAME,
      programNumber: program.PROGRAMNO
    };

    this.navigatorService.setRoot(Catalog, params).catch(err => console.error(err));
  }

  public getMarketOnlyPrograms(): void {
    this.marketCatalogsService.marketOnlyPrograms$.subscribe(data => {
      this.marketOnlyPrograms = data;
    });
  }

}
