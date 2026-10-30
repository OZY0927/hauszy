'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {countryList,isValidFor,phoneParts} from '../lib/phone';
import Icon from './Icon';
// Country-code picker (searchable) and number on one row. value/onChange use {country,code,number}; the number is kept exactly as typed.
export default function PhoneInput({label,value=null,onChange,required=false,autoComplete='tel-national',placeholder='Phone number'}){
  const id=useId(),[country,setCountry]=useState(()=>phoneParts(value).country),[number,setNumber]=useState(()=>phoneParts(value).number),[open,setOpen]=useState(false),[query,setQuery]=useState(''),[active,setActive]=useState(0);
  const emitted=useRef(JSON.stringify(value??null)),root=useRef(null),trigger=useRef(null),search=useRef(null),numberInput=useRef(null),list=useRef(null);
  const countries=countryList(),current=countries.find(c=>c.code===country)||countries[0];
  const q=query.trim().toLowerCase().replace(/^\+/,''),matches=q?countries.filter(c=>c.name.toLowerCase().includes(q)||c.code.toLowerCase()===q||c.dial.startsWith(q)):countries;
  useEffect(()=>{const key=JSON.stringify(value??null);if(key!==emitted.current){emitted.current=key;const p=phoneParts(value);setCountry(p.country);setNumber(p.number)}},[value]);
  useEffect(()=>{numberInput.current?.setCustomValidity(number.replace(/\D/g,'')&&!isValidFor(country,number)?`Enter a valid phone number for ${current.name} (+${current.dial}).`:'')},[number,country,current]);
  useEffect(()=>{if(!open)return;search.current?.focus();const close=e=>{if(!root.current?.contains(e.target))setOpen(false)};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[open]);
  useEffect(()=>{if(open)list.current?.querySelector('[data-active="true"]')?.scrollIntoView({block:'nearest'})},[active,open]);
  function emit(nextCountry,nextNumber){const c=countries.find(v=>v.code===nextCountry)||current,out={country:c.code,code:'+'+c.dial,number:nextNumber.trim()};emitted.current=JSON.stringify(out);onChange?.(out)}
  function choose(c){setCountry(c.code);setOpen(false);setQuery('');emit(c.code,number);numberInput.current?.focus()}
  function toggle(){setQuery('');setActive(Math.max(0,countries.findIndex(c=>c.code===country)));setOpen(o=>!o)}
  function keys(e){if(e.key==='ArrowDown'){e.preventDefault();setActive(a=>Math.min(a+1,matches.length-1))}else if(e.key==='ArrowUp'){e.preventDefault();setActive(a=>Math.max(a-1,0))}else if(e.key==='Enter'){e.preventDefault();if(matches[active])choose(matches[active])}else if(e.key==='Escape'||e.key==='Tab'){if(e.key==='Escape')e.preventDefault();setOpen(false);if(e.key==='Escape')trigger.current?.focus()}}
  return <div className="phone-field" ref={root}>
    {label&&<label className="phone-label" htmlFor={id+'number'}>{label}</label>}
    <div className="phone-row">
      <button ref={trigger} type="button" className="phone-country" aria-haspopup="listbox" aria-expanded={open} aria-label={`Country code ${current.name} +${current.dial}. Change country`} onClick={toggle}><span className="phone-iso">{current.code}</span><span>+{current.dial}</span><Icon name="chevronDown"/></button>
      <input ref={numberInput} id={id+'number'} type="tel" inputMode="tel" autoComplete={autoComplete} required={required} maxLength={20} placeholder={placeholder} value={number} onChange={e=>{const v=e.target.value.replace(/[^\d\s()-]/g,'');setNumber(v);emit(country,v)}}/>
    </div>
    {open&&<div className="phone-popover">
      <div className="phone-search"><Icon name="search"/><input ref={search} type="search" role="combobox" aria-expanded="true" aria-autocomplete="list" aria-controls={id+'list'} aria-activedescendant={matches[active]?id+matches[active].code:undefined} aria-label="Search country or code" placeholder="Search country or code" value={query} onChange={e=>{setQuery(e.target.value);setActive(0)}} onKeyDown={keys}/></div>
      <ul ref={list} id={id+'list'} role="listbox" aria-label="Countries">{matches.length?matches.map((c,i)=><li key={c.code} id={id+c.code} role="option" aria-selected={c.code===country} data-active={i===active} onPointerEnter={()=>setActive(i)} onClick={()=>choose(c)}><span className="phone-iso">{c.code}</span><span className="phone-name">{c.name}</span><span className="phone-dial">+{c.dial}</span>{c.code===country&&<Icon name="check"/>}</li>):<li className="phone-empty" role="presentation">No matching country</li>}</ul>
    </div>}
  </div>}
