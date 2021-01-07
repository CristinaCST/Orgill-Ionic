import { URL_BASE_PROD, URL_BASE_DEV } from '../util/constants-url';

export const environment: {
  production: boolean;
  baseUrlEnglish: string;
  baseUrlFrench: string;
} = {
  production: true,
  baseUrlEnglish: URL_BASE_PROD,
  baseUrlFrench: 'http://dmwebservice-cafr.orgill.com/service.asmx/'
};
