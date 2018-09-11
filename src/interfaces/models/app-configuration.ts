export interface AppConfiguration {
  android_database_url: string;
  ios_database_url: string;
  small_android_database_url: string;
  small_ios_database_url: string;
  last_updated_date: string;
  ordering_enabled?: boolean;
  unlock_code?: string;
}
