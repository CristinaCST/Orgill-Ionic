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
   * Shows a generic prompt with an OK button and custom message.
   * TODO: Should make a public method out of this... Streamline the entire popover process
   * @param message Message string key or the actuall message
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
   * Returns the validated quantity and shows popovers depending on the action taken, if it's the case
   * @param suggestedValue - Value that needs validation
   * @param program - The product program, needed for program rules
   * @param product - The product
   * @returns Number - a validated quantity or the same if it's ok.
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
    
   

    if (product.QTY_ROUND_OPTION === 'X') {
      let shelfPack = Number(product.SHELF_PACK);
      if (suggestedValue > shelfPack) {
        if (shelfPack % suggestedValue === 0) {
          return suggestedValue;
        } else {
          this.showPrompt(Strings.QUANTITY_X_WARNING);
          return shelfPack * Math.ceil(suggestedValue / shelfPack)
        }
      } else {
        this.showPrompt(Strings.QUANTITY_X_WARNING);
        return shelfPack;
      }
    }else if(product.QTY_ROUND_OPTION === 'Y'){
      if (suggestedValue < Number(product.SHELF_PACK) && suggestedValue >= (Number(product.SHELF_PACK) * 0.7)){
       // this.showPrompt(Strings.QUANTITY_Y_UNDER_70_PERCENT)
        return Number(product.SHELF_PACK);
      }
      return suggestedValue;
    }else{
      return suggestedValue;
    }
  }

  /**
   * WARNING: Perform quantity validation before call-in this method. 
   * @param quantity - Quantity wanted but it needs to be pre-validated 
   * @param product - Product
   */
  public getPrice(quantity: number, product: Product){
    if(quantity < Number(product.SHELF_PACK) && product.QTY_ROUND_OPTION === 'Y'){
      return Number(product.YOURCOST) * quantity + Number(product.YOURCOST) * 0.4 * quantity;
    }else{
      return Number(product.YOURCOST) * quantity;
    }
  }
}