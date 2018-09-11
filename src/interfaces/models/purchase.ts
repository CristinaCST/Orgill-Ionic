import {Program} from "./program";
import {ShoppingListItem} from "./shopping-list-item";

export interface Purchase {
  purchase_id: number;
  PO: string;
  date: string;
  location_number: string;
  type: number;
  total: number;
  confirmation_number: string;
  item_program: Program;
  purchase_items: Array<ShoppingListItem>
}
