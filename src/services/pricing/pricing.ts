import { Injectable } from "@angular/core";
import { ItemProgram } from "../../interfaces/models/item-program";
import { Product } from "../../interfaces/models/product";
import { PopoversProvider } from "../../providers/popovers/popovers";
import * as Strings from "../../util/strings";
import * as Constants from "../../util/constants";

@Injectable()
export class PricingService {

  constructor(private popoversProvider: PopoversProvider){

  }

  /**
   * TODO: Should make a public method out of this... Streamline the entire popover process
   */
  private showPrompt(message: String){
    let content = {
      type: Constants.PERMISSION_MODAL,
      title: Strings.GENERIC_MODAL_TITLE,
      message,
      positiveButtonText: Strings.MODAL_BUTTON_OK,
    }

    this.popoversProvider.show(content);
  }

  /**
   * 
   * @param suggestedValue 
   * @param program 
   * @param product 
   */
  public validateQuantity(suggestedValue: number, program: ItemProgram, product: Product) {

    let minQty = Math.max(1, Number(program.MINQTY));

    if (suggestedValue > Number(program.MAXQTY) && Number(program.MAXQTY) > 0) {
     
    this.showPrompt(Strings.QUANTITY_ROUNDED_MAX);
     return Number(program.MAXQTY);
    }

    if (!suggestedValue || suggestedValue < minQty) {
      this.showPrompt(Strings.QUANTITY_ROUNDED_MIN);
      return minQty;
    }
    
    if (suggestedValue < Number(product.SHELF_PACK) && suggestedValue >= (Number(product.SHELF_PACK) * 0.7)){
      this.showPrompt(Strings.QUANTITY_UNDER_70_PERCENT)
      return Number(product.SHELF_PACK);
    }

    if (product.QTY_ROUND_OPTION === 'X') {
      let shelfPack = Number(product.SHELF_PACK);
      if (suggestedValue > shelfPack) {
        if (shelfPack % suggestedValue === 0) {
          return suggestedValue;
        } else {
          this.showPrompt(Strings.QUANTITY_ROUNDED_X);
          return shelfPack * Math.ceil(suggestedValue / shelfPack)
        }
      } else {
        this.showPrompt(Strings.QUANTITY_ROUNDED_X);
        return shelfPack;
      }
    }else{
      return suggestedValue;
    }
  }

  /**
   * WARNING: Perform quantity validation before callin this method. 
   * @param quantity 
   * @param product 
   */
  public getPrice(quantity: number, product: Product){

  }
}