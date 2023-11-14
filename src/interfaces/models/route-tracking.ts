export type MapDetails = {
  distance: string;
  eta: string;
  customerName: string;
  shipToNo: string;
  truckId: string;
  invoices: number[];
};

export type ReportFormData = {
  comments?: string;
  email: string;
  errorDate: string;
  errorType: string;
  shipToNumber?: string;
};
