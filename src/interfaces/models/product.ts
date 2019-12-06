export interface Product {
  CatID: string;
  SKU: string;
  QTY_ROUND_OPTION: string;
  MODEL: string;
  NAME: string;
  VENDOR_NAME: string;
  SELLING_UNIT: string;
  UPC_CODE: string;
  SUGGESTED_RETAIL: string;
  YOURCOST: string;
  IMAGE: string;  // TODO: This still needed?
  SHELF_PACK: string;
  VELOCITY_CODE: string;
  TOTAL_REC_COUNT: string;
  program_number?: any;
}
