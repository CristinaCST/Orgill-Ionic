import {ShoppingListItem} from "../models/shopping-list-item";

export interface AddItemToShoppingListRequest {
  user_token: string;
  shopping_list_id: number;
  item: ShoppingListItem;
}
