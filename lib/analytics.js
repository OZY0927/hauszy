export const CONSENT_KEY='hauszy-analytics-consent-v1';
export function analyticsPage(pathname,origin){
 const path=pathname.endsWith('/')?pathname:pathname+'/';
 const pages={'/':'Home','/projects/':'Projects','/about/':'About Me','/privacy/':'Privacy','/terms/':'Terms','/tools/loan-calculator/':'Loan Calculator','/tools/upfront-cash-calculator/':'Upfront Cash Calculator','/tools/loan-eligibility/':'DSR Calculator','/tools/roi-calculator/':'ROI Calculator'};
 const title=pages[path]||(/^\/projects\/[a-zA-Z0-9_-]+\/$/.test(path)?'Project details':null);
 return title?{page_location:new URL(path,origin).href,page_title:title,page_referrer:''}:null;
}
export const deniedConsent={analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'};
