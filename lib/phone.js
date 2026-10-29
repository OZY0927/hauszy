import {getCountries,getCountryCallingCode,parsePhoneNumberFromString} from 'libphonenumber-js/min';
export const DEFAULT_COUNTRY='MY';
let countries;
// Every country libphonenumber knows, named in English, Malaysia first then A–Z.
export function countryList(){if(countries)return countries;let names=null;try{names=new Intl.DisplayNames(['en'],{type:'region'})}catch{}
  const list=getCountries().map(code=>({code,name:names?.of(code)||code,dial:getCountryCallingCode(code)})).sort((a,b)=>a.name.localeCompare(b.name));
  const home=list.findIndex(c=>c.code===DEFAULT_COUNTRY);if(home>0)list.unshift(...list.splice(home,1));return countries=list}
// Reads stored numbers in any format ("+60 12-345 6789", "60123456789", "012-345 6789") into a valid PhoneNumber, or null.
export function toPhone(value,fallback=DEFAULT_COUNTRY){const text=String(value||'').trim();if(!text)return null;const digits=text.replace(/\D/g,'');
  for(const candidate of [text.startsWith('+')?text:null,digits?'+'+digits:null]){if(!candidate)continue;const p=parsePhoneNumberFromString(candidate);if(p?.isValid())return p}
  const local=parsePhoneNumberFromString(text,fallback);return local?.isValid()?local:null}
// Splits a stored number into the country picker and the local-number box.
export function splitPhone(value,fallback=DEFAULT_COUNTRY){const p=toPhone(value,fallback);if(p)return {country:p.country||fallback,number:p.formatNational()};return {country:fallback,number:String(value||'').trim()}}
// Joins the picker and number into E.164 ("+60123456789"); '' when no number is entered.
export function joinPhone(country,number){const digits=String(number||'').replace(/\D/g,'');if(!digits)return '';const p=parsePhoneNumberFromString(number,country);return p?.number||`+${getCountryCallingCode(country)}${digits.replace(/^0+/,'')}`}
export const isValidFor=(country,number)=>!!parsePhoneNumberFromString(String(number||''),country)?.isValid();
