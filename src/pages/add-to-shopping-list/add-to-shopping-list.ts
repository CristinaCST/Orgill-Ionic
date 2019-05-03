import {Component, OnInit} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Product} from "../../interfaces/models/product";
import {ItemProgram} from "../../interfaces/models/item-program";
import {ShoppingListsProvider} from "../../providers/shopping-lists/shopping-lists";
import {ShoppingList} from "../../interfaces/models/shopping-list";
import {PopoversProvider} from "../../providers/popovers/popovers";
import * as Constants from "../../util/constants";
import {ShoppingListItem} from "../../interfaces/models/shopping-list-item";
import {LoadingProvider} from "../../providers/loading/loading";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ProgramProvider} from "../../providers/program/program";
import {Subscription} from 'rxjs';
import {LocalStorageHelper} from "../../helpers/local-storage-helper";

@Component({
  selector: 'page-add-to-shopping-list',
  templateUrl: 'add-to-shopping-list.html',
})
export class AddToShoppingListPage implements OnInit {

  private product: Product;
  private selectedProgram: ItemProgram;
  private quantity: number = 0;
  private productLists = [];
  private quantityItemPrice: number = 0;
  public isAddBtnDisabled: boolean = false;
  public shoppingLists = [];
  public listForm: FormGroup;
  public model: any = {};
  public isMarketOnlyProduct: boolean = false;
  public subscription: Subscription;
  public menuCustomButtons = [];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private shoppingListsProvider: ShoppingListsProvider,
              private popoversProvider: PopoversProvider,
              private formBuilder: FormBuilder,
              private loading: LoadingProvider,
              private programProvider: ProgramProvider) {
    this.menuCustomButtons.push({action: 'addList', icon: 'add'})
  }

  ngOnInit(): void {
    this.loading.presentSimpleLoading();
    this.product = this.navParams.get('product');
    this.selectedProgram = this.navParams.get('selectedProgram');
    this.quantity = this.navParams.get('quantity');
    this.quantityItemPrice = this.navParams.get('quantityItemPrice');

    this.listForm = this.formBuilder.group({
      listOptions: [this.model.listOptions, Validators.required],
    });

    this.initShoppingListInformation();
  }

  initShoppingListInformation() {
    //let subscription = Rx.Observable.forkJoin(this.programProvider.isMarketOnlyProgram(this.selectedProgram.PROGRAM_NO),
    //         this.shoppingListsProvider.getShoppingListForProduct(this.product.SKU),
    //         this.shoppingListsProvider.getLocalShoppingLists());
    //subscription.subscribe(args=>{
    //  this.setProductList(args[1]);
    //       this.checkMarketOnlyProduct(args[0);
    //       this.setAllShoppingList(args[2);
    //       this.loading.hideLoading();
    // })

    Promise.all(
      [this.programProvider.isMarketOnlyProgram(this.selectedProgram.PROGRAM_NO),
        this.shoppingListsProvider.getShoppingListsForProduct(this.product.SKU, this.selectedProgram.PROGRAM_NO),
        this.shoppingListsProvider.getAllShoppingLists()
        //, this.shoppingListsProvider.getLocalShoppingLists()
       ]
    ).then(([programData, productLists, shoppingLists]) => {
      // this.setProductList(productLists);
      productLists.subscribe(data => {
        this.setProductList(data);
      });
      this.checkMarketOnlyProduct(programData);
      // this.setAllShoppingList(shoppingLists);
      shoppingLists.subscribe(data => {
        this.setAllShoppingList(data)
      });
      this.loading.hideLoading();
    }).catch(error => console.error(error));
  }

  setProductList(productLists) {
    // for (let i = 0; i < productLists.rows.length; i++) {
    //   this.productLists[productLists.rows.item(i).id] = productLists.rows.item(i).id;
    // }
    for (let i = 0; i < productLists.length; i++){
      this.productLists[productLists[i].id] = productLists[i].id;
    }
  }

  checkMarketOnlyProduct(data) {
    let programType = data.rows.item(0);
    if (data.rows.length > 0) {
      this.isMarketOnlyProduct = programType.market_only === Constants.MARKET_ONLY_PROGRAM;
    }
    // this.listForm.value.listOptions = data.rows.item(0).market_only.toString() === Constants.MARKET_ONLY_PROGRAM ? Constants.MARKET_ONLY_LIST_ID : Constants.DEFAULT_LIST_ID;
    if (programType.market_only === Constants.MARKET_ONLY_PROGRAM){
      this.listForm.value.listOptions = LocalStorageHelper.getFromLocalStorage(Constants.MARKET_ONLY_LIST_ID);
    }else{
      this.listForm.value.listOptions = LocalStorageHelper.getFromLocalStorage(Constants.DEFAULT_LIST_ID);
    }
    this.checkProductInList(this.listForm.value.listOptions);
  }

  setAllShoppingList(data) {
    // if (shoppingLists.rows.length) {
    //   for (let i = 0; i < shoppingLists.rows.length; i++) {
    //     let list: ShoppingList = {
    //       ListID: shoppingLists.rows.item(i).id,
    //       ListName: shoppingLists.rows.item(i).name,
    //       ListDescription: shoppingLists.rows.item(i).description,
    //       ListType: shoppingLists.rows.item(i).listType
    //     };
    //     this.shoppingLists.push(list);
    //   }
    // }
    var shoppingLists = JSON.parse(data.d);
    if(shoppingLists.length){
      for (let i = 0; i < shoppingLists.length; i++) {
        let list: ShoppingList = {
          ListID: shoppingLists[i].shopping_list_id,
          ListName: shoppingLists[i].list_name,
          ListDescription: shoppingLists[i].list_description,
          ListType: shoppingLists[i].list_type
        };
        this.shoppingLists.push(list);
      }
    }
  }

  newShoppingList() {
    let content = this.popoversProvider.setContent(Constants.SHOPPING_LIST_NEW_DIALOG_TITLE, undefined,
      Constants.SAVE, Constants.CANCEL, undefined, Constants.POPOVER_NEW_SHOPPING_LIST);
    this.subscription = this.popoversProvider.show(content).subscribe(data => {
      if (data && data.listName) {
        this.shoppingListsProvider.checkNameAvailability(data.listName).then(status => {
          if (data.type == 'default'){
            data.type = Constants.CUSTOM_SHOPPING_LIST_TYPE;
          } else {
            data.type = Constants.MARKET_ONLY_CUSTOM_TYPE;
          }
          if (status === 'available') {
            this.shoppingListsProvider.createNewShoppingList(data.listName, data.listDescription, data.type).subscribe(addedList => {
              let list: ShoppingList =
                {
                  ListID: addedList.shopping_list_id,
                  ListName: addedList.list_name,
                  ListDescription: addedList.list_description,
                  ListType: addedList.list_type
                };
              this.shoppingLists.push(list);
              this.listForm.value.listOptions = list.ListID;
            });
          } else {
            let content = this.popoversProvider.setContent(Constants.O_ZONE, Constants.SHOPPING_LIST_NEW_DIALOG_NAME_EXISTS_ERROR);
            this.popoversProvider.show(content);
          }
          this.subscription.unsubscribe();
        });
      }
    });
  }

  cancel() {
    this.navCtrl.pop().catch(err => console.error(err));
  }

   add() {
    if (!this.selectedProgram) {
      let content = this.popoversProvider.setContent(Constants.SHOPPING_LIST_NO_PROGRAM_TITLE, Constants.SHOPPING_LIST_NO_PROGRAM_MESSAGE, undefined);
      this.popoversProvider.show(content);
      return;
    }

    this.saveItemToList();
  }

  saveItemToList() {
    let listItem: ShoppingListItem = {
      product: this.product,
      program_number: this.selectedProgram.PROGRAM_NO,
      item_price: this.quantityItemPrice,
      quantity: this.quantity
    };

    this.loading.presentSimpleLoading();
    //TODO UPDATE WHEN APIS ARE READY
    this.shoppingListsProvider.addItemToShoppingList(this.listForm.value.listOptions, listItem, this.listForm.value.listOptions.isMarketOnly).subscribe(() => {
      this.loading.hideLoading();
      this.cancel();
    });
  }

  checkProductInList(listId: number) {
    this.shoppingListsProvider.checkProductInList(this.product.SKU, listId, this.selectedProgram.PROGRAM_NO).subscribe(data => {
      var temp = JSON.parse(data.d).Status;
      var response = (temp == "True");
      console.log(response);
      if (response){
        this.isAddBtnDisabled = true;
        this.reset(this.popoversProvider.setContent(Constants.O_ZONE, Constants.SHOPPING_LIST_EXISTING_PRODUCT));
      } else {
        this.isAddBtnDisabled = false;
      }
    });
  }

  reset(content) {
    this.popoversProvider.show(content);
    this.isAddBtnDisabled = true;
    this.listForm.controls.listOptions.reset();
  }

  selectList(selectedList: ShoppingList) {
    if (this.isMarketOnlyProduct === true && ((selectedList.ListType.toString() !== Constants.MARKET_ONLY_LIST_TYPE) && (selectedList.ListType.toString() !== Constants.MARKET_ONLY_CUSTOM_TYPE))) {
      this.reset(this.popoversProvider.setContent(Constants.O_ZONE, Constants.SHOPPING_LIST_MARKET_ONLY_PRODUCT));
    } else if (this.isMarketOnlyProduct === false && ((selectedList.ListType.toString() === Constants.MARKET_ONLY_LIST_TYPE) || (selectedList.ListType.toString() === Constants.MARKET_ONLY_CUSTOM_TYPE))) {
      this.reset(this.popoversProvider.setContent(Constants.O_ZONE, Constants.SHOPPING_LIST_DEFAULT_PRODUCT));
    } else {
      this.checkProductInList(selectedList.ListID);
    }
  }
}
