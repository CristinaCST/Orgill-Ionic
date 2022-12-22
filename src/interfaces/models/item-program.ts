export interface ItemProgram {
  sku: string;
  program_no: string;
  program_name: string;
  release_date: string;
  price: string;
  min_qty: string;
  max_qty: number;
  REGPRICE?: string;
  AVAILQTY?: string;
}
