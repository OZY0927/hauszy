import {getCountries,getCountryCallingCode,parsePhoneNumberFromString} from 'libphonenumber-js/min';
// Country picked first when a phone field is empty. Visitors can pick any other country; numbers are never reformatted to it.
export const DEFAULT_COUNTRY='MY';
let countries;
// Every country libphonenumber knows, named in English, the default first then A–Z.
export function countryList(){if(countries)return countries;let names=null;try{names=new Intl.DisplayNames(['en'],{type:'region'})}catch{}
  const list=getCountries().map(code=>({code,name:names?.of(code)||code,dial:getCountryCallingCode(code)})).sort((a,b)=>a.name.localeCompare(b.name));
  const home=list.findIndex(c=>c.code===DEFAULT_COUNTRY);if(home>0)list.unshift(...list.splice(home,1));return countries=list}
const known=code=>typeof code==='string'&&getCountries().includes(code);
// Phones are stored as {country:'SG',code:'+65',number:'9123 4567'}: the picked country and the number exactly as typed.
// Older single-string values ("+60123456789") are split into the same shape so they still load.
export function phoneParts(value){
  if(value&&typeof value==='object'){const country=known(value.country)?value.country:DEFAULT_COUNTRY;return {country,code:'+'+getCountryCallingCode(country),number:String(value.number||'').trim()}}
  const text=String(value||'').trim(),p=text.startsWith('+')?parsePhoneNumberFromString(text):parsePhoneNumberFromString(text,DEFAULT_COUNTRY);
  if(p?.country)return {country:p.country,code:'+'+p.countryCallingCode,number:p.nationalNumber};
  return {country:DEFAULT_COUNTRY,code:'+'+getCountryCallingCode(DEFAULT_COUNTRY),number:text}}
// For tel: and WhatsApp links only: "+6591234567", or '' when no number. Storage and display keep the typed number.
export function phoneE164(value){const {country,code,number}=phoneParts(value),digits=number.replace(/\D/g,'');if(!digits)return '';return parsePhoneNumberFromString(number,country)?.number||code+digits.replace(/^0+/,'')}
// "+65 9123 4567": the country code, then the number as typed.
export function phoneDisplay(value){const {code,number}=phoneParts(value);return number?`${code} ${number}`:''}
export const isValidFor=(country,number)=>!!parsePhoneNumberFromString(String(number||''),country)?.isValid();
