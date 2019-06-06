import { Injectable } from "@angular/core";
import { ItemProgram } from "../../interfaces/models/item-program";
import { Product } from "../../interfaces/models/product";
import { PopoversService } from "../popovers/popovers";
import * as Strings from "../../util/strings";
import * as Constants from "../../util/constants";

@Injectable()
export class PricingService {

  constructor(private popoversProvider: PopoversService) {

  }

  /**
   * Shows a generic prompt with an OK button and custom message.
   * TODO: Should make a public method out of this... Streamline the entire popover process
   * @param message Message string key or the actuall message
   */
  private showPrompt(message: String) {
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
   * @returns number - a validated quantity or the same if it's ok.
   */
  public validateQuantity(suggestedValue: number | string, program: ItemProgram, product: Product, getDefaultMode:boolean = false): number {
    if(!suggestedValue)
    {
      return undefined;
    }

    if(typeof suggestedValue == 'string'){
      suggestedValue = Number(suggestedValue.replace(/[^0-9]/g, ''));
    }

    let minQty = Math.max(1, Number(program.MINQTY));
    let shelfPack = Number(product.SHELF_PACK);
    if (product.QTY_ROUND_OPTION === 'X' && shelfPack > 1 && minQty < shelfPack) {
      minQty = shelfPack;
    }

    if (suggestedValue > Number(program.MAXQTY) && Number(program.MAXQTY) > 0) {

      if (!getDefaultMode) {
        this.showPrompt(Strings.QUANTITY_ROUNDED_MAX);
      }

      return Number(program.MAXQTY);
    }

    if (suggestedValue && suggestedValue < minQty) {
      if (!getDefaultMode) {
        this.showPrompt(Strings.QUANTITY_ROUNDED_MIN);
      }
      return minQty;
    }

    if (product.QTY_ROUND_OPTION === 'X') {
      
      if (suggestedValue > shelfPack) {
        if (suggestedValue % shelfPack === 0) {
          return this.maxCheck(suggestedValue);
        } else {
          if (!getDefaultMode) {
            this.showPrompt(Strings.QUANTITY_X_WARNING);
          }
          return this.maxCheck(shelfPack * Math.ceil(suggestedValue / shelfPack));
        }
      } else {
        return shelfPack;
      }
    } else if (product.QTY_ROUND_OPTION === 'Y') {
      if (suggestedValue < Number(product.SHELF_PACK) && suggestedValue >= (Number(product.SHELF_PACK) * 0.7)) {
        // this.showPrompt(Strings.QUANTITY_Y_UNDER_70_PERCENT)
        return Number(product.SHELF_PACK);
      }
      return this.maxCheck(suggestedValue);
    } else {
      return this.maxCheck(suggestedValue);
    }
  }

  public maxCheck(value){
    return Math.min(value,Constants.MAX_QUANTITY_HARDCAP);
  }

  /**
   * WARNING: Perform quantity validation before call-in this method. 
   * @param quantity - Quantity wanted but it needs to be pre-validated 
   * @param product - Product
   */
  public getPrice(quantity: number, product: Product, program: ItemProgram) {
    if (quantity < Number(product.SHELF_PACK) && product.QTY_ROUND_OPTION === 'Y') {
      return Number(program.PRICE) * quantity + Number(program.PRICE) * 0.04 * quantity;
    } else {
      return Number(program.PRICE) * quantity;
    }
  }
}