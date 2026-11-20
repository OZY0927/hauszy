import {pageMetadata,toolStructuredData} from '../../../lib/seo';
import {monthlyPayment} from '../../../lib/loan-math';
import {money} from '../../../lib/project';
import LoanCalculator from '../../../components/LoanCalculator';
import JsonLd from '../../../components/JsonLd';
export const metadata=pageMetadata("Malaysia Housing Loan Calculator","Estimate monthly housing-loan repayments, interest and repayment schedules using your selected rate and tenure. Planning estimates only.","/tools/loan-calculator/");
const number=v=>typeof v==='string'&&v!==''&&Number.isFinite(Number(v))&&Number(v)>=0;
export default async function CalculatorPage({searchParams}){
 const params=await searchParams,initial={};
 if(typeof params.project==='string')initial.project=params.project;
 for(const [param,key] of [['price','price'],['dp','downPct'],['da','downAmount'],['rate','rate'],['years','years']])if(number(params[param]))initial[key]=params[param];
 return <><JsonLd data={toolStructuredData(metadata)}/><main className="calculator-shell">
  <div className="tools-intro"><div className="eyebrow">PLAN YOUR NEXT CHAPTER</div><h1>A clearer view of<br/>your <em>next move.</em></h1><p>Work out your monthly instalment and what the loan really costs over time.</p></div>
  <div className="tools-workbench">
   <LoanCalculator key={JSON.stringify(initial)} initial={initial}/>
   <details className="calculator-sources">
    <summary>Monthly repayment example</summary>
    <div className="tools-source-copy">
     <h2>What is the monthly instalment on a RM450,000 home loan?</h2>
     <p>A RM450,000 loan at an illustrative annual interest rate of 4% over 30 years comes to <strong>{money(monthlyPayment(450000,4,30))} a month</strong> in principal and interest. The example assumes equal instalments and a constant rate. It excludes insurance and other purchase costs.</p>
    </div>
   </details>
  </div>
 </main></>
}
