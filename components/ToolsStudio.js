'use client';
import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
function ToolPageFrame({kind,children}){
 const [ready,setReady]=useState(false);
 useEffect(()=>setReady(true),[]);
 return <div className={'tools-studio tool-design-'+kind} data-motion-pending={ready?undefined:''}><div className="tools-tool-view">{children}</div></div>;
}
export default function ToolsStudio({children}){
 const path=usePathname(),kind=path.includes('upfront-cash')?'cash':path.includes('loan-eligibility')?'eligibility':path.includes('roi-calculator')?'roi':'loan';
 return <ToolPageFrame key={path} kind={kind}>{children}</ToolPageFrame>;
}
