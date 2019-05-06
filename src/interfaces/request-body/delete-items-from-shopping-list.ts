export interface DeleteItemsFromShoppingListRequest {
  user_token: string;
  shopping_list_id: number;
  product_SKUs: Array<string>;
}
