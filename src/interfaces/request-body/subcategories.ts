export interface SubcategoriesRequest {
  user_token?: string;  // TODO: Handle this situation better since the transition to new secureAction
  p: string;
  rpp: string;
  program_number: string;
  last_modified: string;
  category_id: string;
}
