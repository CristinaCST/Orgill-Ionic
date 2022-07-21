import { URL_BASE_DEV, URL_BASE_DEV_NEW, URL_BASE_PROD } from '../util/constants-url';
export const environment: {
  production: boolean;
  baseUrlEnglish: string;
  baseUrlFrench: string;
} = {
  production: true,
  baseUrlEnglish: URL_BASE_DEV_NEW,
  baseUrlFrench: 'http://dmwebservice-cafr.orgill.com/service.asmx/'
};
