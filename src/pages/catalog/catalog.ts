import { Component, OnInit } from '@angular/core';
import { NavParams, NavOptions, Events } from 'ionic-angular';
import { Category } from '../../interfaces/models/category';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { CatalogsProvider } from '../../providers/catalogs/catalogs';
import { ProductsPage } from '../products/products';
import { LoadingService } from '../../services/loading/loading';
import { TranslateWrapperService } from '../../services/translate/translate';
import { ProductsSearchPage } from '../products-search/products-search';
import { ScannerPage } from '../scanner/scanner';
import { NavigatorService } from '../../services/navigator/navigator';
import { Product } from '../../interfaces/models/product';
import { getNavParam } from '../../helpers/validatedNavParams';
import { NavbarCustomButton } from '../../interfaces/models/navbar-custom-button';
import { PopoversService, PopoverContent } from '../../services/popovers/popovers';
import { Program } from 'interfaces/models/program';

@Component({
  selector: 'page-catalog',
  templateUrl: 'catalog.html'
})
export class Catalog implements OnInit {
  private programs: Program[];
  private programNumber: string;
  public programName: string;
  public categories: Category[];
  public catalogIndex: number;
  private currentSubCategory: Category;
  public readonly menuCustomButtons: NavbarCustomButton[] = [];
  private readonly categoriesLoader: LoadingService;
  private readonly simpleLoader: LoadingService;

  constructor(
    public navigatorService: NavigatorService,
    public navParams: NavParams,
    public catalogProvider: CatalogsProvider,
    public loadingService: LoadingService,
    public popoversService: PopoversService,
    public translateProvider: TranslateWrapperService,
    private readonly events: Events
  ) {
    this.menuCustomButtons.push(
      { action: () => this.getCatalogDetails(), icon: 'information-circle', identifier: 'regular-catalog-info-btn' },
      { action: () => this.goToScanPage(), icon: 'barcode' }
    );

    this.categoriesLoader = loadingService.createLoader(
      this.translateProvider.translate(Strings.LOADING_ALERT_CONTENT_CATEGORIES)
    );
    this.simpleLoader = loadingService.createLoader();
  }

  public ngOnInit(): void {
    this.events.subscribe(Constants.EVENT_LOADING_FAILED, this.reloadMethodHandler);
    this.initCatalog();
  }

  public ngOnDestroy(): void {
    this.events.unsubscribe(Constants.EVENT_LOADING_FAILED, this.reloadMethodHandler);
  }

  private reloadMethodHandler(culprit?: string): void {
    if (this.categories === undefined || this.categories.length === 0 || culprit === 'categories' || !culprit) {
      this.initCatalog();
    }
  }

  private initCatalog(): void {
    this.programName = getNavParam(this.navParams, 'programName', 'string');
    this.programNumber = getNavParam(this.navParams, 'programNumber', 'number');
    this.catalogIndex = getNavParam(this.navParams, 'catalogIndex', 'number', 0);
    this.currentSubCategory = getNavParam(this.navParams, 'currentSubCategory', 'object');

    if (!this.programName) {
      this.programName = this.translateProvider.translate(Strings.REGULAR_CATALOG).toUpperCase();
    }
    if (!this.programNumber) {
      this.programNumber = '';
    }
    const categoriesFromNavParam: Category[] = getNavParam(this.navParams, 'categories', 'object');
    if (categoriesFromNavParam) {
      this.categories = categoriesFromNavParam;
    } else {
      this.getCategories();
      this.getPrograms();
    }
  }

  private getPrograms(): void {
    this.catalogProvider.getPrograms().subscribe((response: any) => {
      this.programs = response;
    });
  }

  private getCategories(): void {
    this.categoriesLoader.show();
    this.catalogProvider.getCategories(this.programNumber).subscribe(
      (response: any) => {
        const responseData: Category[] = response;
        this.categories = this.sortCategories(responseData);
        this.categoriesLoader.hide();
      },
      err => {
        //   this.reloadService.paintDirty('categories');
        this.categoriesLoader.hide();
      }
    );
  }

  public sortCategories(responseData: Category[]): Category[] {
    return responseData.sort((category1, category2): number => {
      return category1.catName.localeCompare(category2.catName);
    });
  }

  public selectCategory(category: Category): void {
    this.categoriesLoader.show();
    this.catalogProvider.getSubcategories(this.programNumber, category.catID).subscribe(
      (response: any) => {
        const responseData: Category[] = response;
        if (responseData.length > 0) {
          const categories: Category[] = this.sortCategories(responseData);
          this.navigatorService
            .push(Catalog, {
              programName: category.catName,
              programNumber: this.programNumber,
              categories,
              currentSubCategory: category,
              catalogIndex: this.catalogIndex + 1
            })
            .catch(err => console.error(err));
          this.categoriesLoader.hide();
        } else {
          const productsPageParams: any = {
            programNumber: this.programNumber,
            programName: category.catName,
            category
          };
          this.navigatorService
            .push(ProductsPage, productsPageParams, { paramEquality: false } as NavOptions)
            .catch(err => console.error(err));
          this.categoriesLoader.hide();
        }
      },
      err => {
        // TODO: SOLVE THIS
      }
    );
  }

  private getCatalogDetails(): void {
    const program: Program = this.programs.filter(singleProgram => {
      return singleProgram.programno === this.programNumber.toString();
    })[0];

    let content: PopoverContent;
    if (this.programNumber !== '' && program) {
      content = this.popoversService.setContent(
        this.programName,
        JSON.stringify(program),
        undefined,
        undefined,
        undefined,
        'catalogInfo'
      );
    } else {
      content = this.popoversService.setContent(this.programName, Strings.SHOPPING_LIST_DESCRIPTION_NOT_PROVIDED);
    }

    this.popoversService.show(content);
  }

  private filterBadRequest(data: Product[]): Product[] {
    return data.length === 0 || data[0].catID === 'Bad Request' ? [] : data;
  }

  public onSearched($event: any): void {
    this.simpleLoader.show();
    this.catalogProvider
      .search($event, this.currentSubCategory ? this.currentSubCategory.catID : '', this.programNumber)
      .subscribe(
        (data: any) => {
          if (data) {
            const dataFound: Product[] = this.filterBadRequest(data);
            const params: any = {
              searchString: $event,
              searchData: dataFound,
              programNumber: this.programNumber,
              programName: this.programName,
              category: this.currentSubCategory,
              numberOfProductsFound: dataFound[0] ? dataFound[0].totaL_REC_COUNT : 0
            };
            this.navigatorService.push(ProductsSearchPage, params, { paramsEquality: false } as NavOptions).then();
            this.simpleLoader.hide();
          }
        },
        err => {
          LoadingService.hideAll();
        }
      );
  }

  public goToScanPage(): void {
    this.navigatorService
      .push(ScannerPage, {
        type: 'scan_barcode_tab'
      })
      .catch(err => console.error(err));
  }
}
