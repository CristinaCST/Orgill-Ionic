export interface Purchase {
  id: string;
  program_no: string;
  po: string;
  program_name: string;
  type: string;
  confirmation: string;
  location: string;
  purchase_date: string;
  total?: string;
}
