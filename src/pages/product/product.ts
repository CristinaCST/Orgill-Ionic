import { Component, OnInit } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { Product } from "../../interfaces/models/product";
import { ProgramProvider } from "../../providers/program/program";
import { ItemProgram } from "../../interfaces/models/item-program";
import { PopoversService } from "../../services/popovers/popovers";
import * as Constants from "../../util/constants";
import * as Strings from "../../util/strings";
import { AddToShoppingListPage } from "../add-to-shopping-list/add-to-shopping-list";
import { LoadingService } from "../../services/loading/loading";
import { ShoppingListsProvider } from "../../providers/shopping-lists/shopping-lists";
import { NavigatorService } from '../../services/navigator/navigator';
import { CustomerLocationPage } from '../../pages/customer-location/customer-location';
import { HotDealItem } from '../../interfaces/models/hot-deal-item';
import { PricingService } from '../../services/pricing/pricing';
import * as ConstantsUrl from '../../util/constants-url';
import { LocalStorageHelper } from '../../helpers/local-storage';
import { HotDealService } from '../../services/hotdeal/hotdeal';
import { ProductProvider } from '../../providers/product/product';

@Component({
  selector: 'page-product',
  templateUrl: 'product.html',
})
export class ProductPage implements OnInit {
  public product: Product;
  public quantity: number = 1;
  public subCategoryName: string;
  public activeTab: string = 'summary_tab';
  public productPrograms: Array<ItemProgram> = [];
  public programNumber: number;
  public selectedProgram: ItemProgram;
  public quantityItemPrice: number = 0;
  public programName: string;
  public isHotDeal: boolean = false;
  public hotDeal: HotDealItem;
  private canLeave: boolean = false;
  private lastEvent;

  public fromShoppingList;
  private shoppingListId;
  private id;
  public quantityFromList;

  private loader: LoadingService;

  constructor(public navigatorService: NavigatorService,
    public navParams: NavParams,
    private loadingService: LoadingService,
    private programProvider: ProgramProvider,
    private popoversProvider: PopoversService,
    private shoppingListProvider: ShoppingListsProvider,
    private pricingService: PricingService,
    private hotDealService: HotDealService,
    private productProvider: ProductProvider) {
      this.loader = this.loadingService.createLoader();
  }

  ngOnInit(): void {
    this.loader.show();

    this.product = this.navParams.get('product');
    this.programNumber = this.navParams.get('programNumber');
    this.programName = this.navParams.get('programName');
    this.subCategoryName = this.navParams.get('subcategoryName');
    this.hotDeal = this.navParams.get('hotDeal');
    this.isHotDeal = this.navParams.get('isHotDeal')?true:false;

    this.fromShoppingList = this.navParams.get('fromShoppingList');
    if (this.fromShoppingList) {
      this.shoppingListId = this.navParams.get('shoppingListId');
      this.id = this.navParams.get('id');
      this.quantityFromList = this.navParams.get('quantity');
    }

    if (this.isHotDeal) {
      this.hotDealService.getHotDealProgram(this.product.SKU).subscribe((program) => {
        let hotDealProgram :ItemProgram = JSON.parse(program.d);
        this.productPrograms = [hotDealProgram];
        if (this.productPrograms.length === 0) {
          let content = this.popoversProvider.setContent(Strings.GENERIC_MODAL_TITLE, Strings.PRODUCT_NOT_AVAILABLE, Strings.MODAL_BUTTON_OK,undefined,undefined, Constants.POPOVER_ERROR);
          this.popoversProvider.show(content);
          this.navigatorService.pop().catch(err => console.error(err));
          return;
        }
        let initialProgram: ItemProgram = hotDealProgram;
        this.selectedProgram = initialProgram;
        this.programProvider.selectProgram(initialProgram);
        this.getProduct().then(()=>{
          this.loader.hide();
        });
       
      });
    } else {
      this.programProvider.getProductPrograms(this.product.SKU).subscribe(programs => {
        if (programs) {
          this.productPrograms = JSON.parse(programs.d);
          if (this.productPrograms.length === 0) {
            let content = this.popoversProvider.setContent(Strings.GENERIC_MODAL_TITLE, Strings.PRODUCT_NOT_AVAILABLE, Strings.MODAL_BUTTON_OK, undefined, undefined, Constants.POPOVER_ERROR);
            this.popoversProvider.show(content);
            this.navigatorService.pop().catch(err => console.error(err));
            return;
          }
          let initialProgram: ItemProgram = this.getInitialProgram();
          this.selectedProgram = initialProgram;
          this.programProvider.selectProgram(initialProgram);
          this.getProduct().then(()=>{
            this.loader.hide();
          });
        }
      });
    }

    this.programProvider.getSelectedProgram().subscribe(selectedProgram => this.selectedProgram = selectedProgram);
  }

  getInitialProgram() {
    // let programs = this.productPrograms.filter(program => parseInt(program.PROGRAM_NO) === this.programNumber);
    // return programs.length > 0 ? programs[0] : this.productPrograms[0];
    var initialProgram: ItemProgram;
    let programs = this.productPrograms;
    if (this.programNumber == null){
      return programs[0];
    }
    programs.forEach(prog => {
      if(Number(prog.PROGRAM_NO) == this.programNumber){
        initialProgram = prog;
      }
    })

    if (initialProgram == null){
      return programs[0]
    }
    return initialProgram
  }

  close() {
    this.navigatorService.pop().catch(err => console.error(err));
  }


  getProduct(){
    return new Promise((resolve, reject)=>{
      this.productProvider.getProduct(this.product.SKU, this.selectedProgram.PROGRAM_NO).subscribe((result) => {
        const img = this.product.IMAGE;  //Save already processed image by the product component
        this.product = result;  //Get the new product
        this.product.IMAGE = img; //Re-assign already processed image.
        //this.quantity = this.pricingService.validateQuantity(this.quantity,this.selectedProgram,this.product);
        this.loader.hide();
        resolve();
      });
    });
  }


  addToShoppingList() {
    if (this.product.QTY_ROUND_OPTION === 'Y' && this.isMinimum70percentQuantity()) {
      let content = this.popoversProvider.setContent(Strings.GENERIC_MODAL_TITLE, Strings.Y_SHELF_PACK_QUANTITY_WARNING, Strings.MODAL_BUTTON_OK, undefined, undefined);
      this.popoversProvider.show(content);
      this.programProvider.setPackQuantity(true);
    } else if (this.product.QTY_ROUND_OPTION === 'X' && this.quantity % Number(this.product.SHELF_PACK) !== 0) {
      let content = this.popoversProvider.setContent(Strings.GENERIC_MODAL_TITLE, Strings.X_SHELF_PACK_QUANTITY_WARNING, Strings.MODAL_BUTTON_OK, undefined, undefined);
      this.popoversProvider.show(content);
    } else {
      this.navigatorService.push(AddToShoppingListPage, {
        'product': this.product,
        'quantity': this.quantity,
        'selectedProgram': this.selectedProgram,
        'quantityItemPrice': this.quantityItemPrice
      }).catch(err => console.error(err));
    }
  }

  buyNow(){
  
    let hotDeal: HotDealItem = {
      ITEM: this.product,
      LOCATIONS: undefined,
      PROGRAM: this.selectedProgram,
      TOTAL_QUANTITY: this.pricingService.validateQuantity(this.quantity,this.selectedProgram,this.product)
    }

    this.navigatorService.push(CustomerLocationPage, {hotDeal}).catch(err => console.error(err))
  }

  onQuantityChange($event = undefined) {
    if ($event) {
      this.quantity = $event.quantity;
      this.quantityItemPrice = $event.total;
      this.lastEvent = $event;
    }

    this.programProvider.setPackQuantity(false);
  }

  updateList() {
    if (this.fromShoppingList && this.lastEvent) {
      this.loader.show();
      console.log("UPDATING SHOPPING LIST ITEM");
      console.log("ID:" + this.shoppingListId);
      this.shoppingListProvider.updateShoppingListItem(this.product, this.shoppingListId, this.programNumber.toString(), this.lastEvent.productPrice, this.quantity).subscribe(data => {
        this.canLeave = true;
        console.warn("POP");
        this.loader.hide();
         this.navigatorService.pop();
      },
        error => {
          console.error('error updating', error);
        })
    }
  }

  ionViewCanLeave():boolean{
    
    console.log("CONTINUUU");
    if (this.fromShoppingList) {
      if (!this.canLeave) {
        this.updateList();
        return false;
      }
      return true;
    }
    return true;
  }

  public isMinimum70percentQuantity(): boolean {
    return this.quantity >= (Number(this.product.SHELF_PACK) * 0.7) && this.quantity < Number(this.product.SHELF_PACK);
  }

}
