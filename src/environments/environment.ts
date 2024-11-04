import { URL_BASE_DEV_NEW, URL_BASE_PROD, URL_BASE_PROD_NEW } from '../util/constants-url';
export const environment: { production: boolean; baseUrlEnglish: string; baseUrlFrench: string } = {
  production: true,
  baseUrlEnglish: URL_BASE_DEV_NEW,
  baseUrlFrench: 'http://reststage-cafr.orgill.com/api/v1/'
};
