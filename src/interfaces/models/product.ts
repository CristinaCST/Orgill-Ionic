export interface Product {
  program_number?: string;
  product: Product;
  catID: string;
  sku: string;
  qtY_ROUND_OPTION: string;
  model: string;
  name: string;
  vendoR_NAME: string;
  sellinG_UNIT: string;
  upC_CODE: string;
  suggesteD_RETAIL: string;
  yourcost: string;
  image: string;
  shelF_PACK: string;
  velocitY_CODE: string;
  totaL_REC_COUNT: string;
}

export interface OrderHistory {
  monthname: string;
  year: number;
  quantity: number;
}

export interface InventoryOnHand {
  division: string;
  inventory: number;
}
