import {pageMetadata} from '../../../lib/seo';
import {money} from '../../../lib/project';
import {purchaseBudget} from '../../../lib/purchase-budget';
import UpfrontCashCalculator from '../../../components/UpfrontCashCalculator';
export const metadata=pageMetadata("Malaysia Property Upfront Cash Calculator","Estimate the down payment, legal fees, stamp duty and upfront cash for a Malaysian property purchase. Confirm final costs with your solicitor.","/tools/upfront-cash-calculator/");

const example=purchaseBudget({price:500000,margin:90,buyer:'local',payment:'loan',firstHome:'no'});
const exampleFees=example.rows.filter(row=>row.payable!==null);

export default function Page(){
 return <main className="calculator-shell upfront-shell">
  <div className="tools-intro">
   <h1>Malaysia Property <em>Upfront Cash Calculator</em></h1>
   <p>Estimate your down payment, legal fees and stamp duty. Include any confirmed developer contributions and solicitor quotes to refine your budget.</p>
  </div>
  <div className="tools-workbench">
   <section className="upfront-example" aria-labelledby="upfront-example-title">
    <h2 id="upfront-example-title">How much cash do you need for a RM500,000 condo?</h2>
    <p>With 90% financing, a local buyer would budget <strong>{money(example.total)}</strong> for the down payment and estimated fees below, plus any charges that require a quote. This example assumes a residential developer purchase under the Housing Development Act in Peninsular Malaysia, with no duty relief or developer contributions.</p>
    <table>
     <thead><tr><th scope="col">Upfront cost</th><th scope="col">Estimated amount</th></tr></thead>
     <tbody>
      <tr><th scope="row">Down payment</th><td>{money(example.contribution)}</td></tr>
      {exampleFees.map(row=><tr key={row.id}><th scope="row">{row.label}</th><td>{money(row.payable)}</td></tr>)}
     </tbody>
     <tfoot><tr><th scope="row">Subtotal before quoted charges</th><td>{money(example.total)}</td></tr></tfoot>
    </table>
    <p>Ask your solicitor about disbursements, separate agreement stamping, any applicable consent charges and any transfer legal work billed separately.</p>
    <a className="outline" href="#purchase-calculator">Estimate my upfront costs</a>
   </section>
   <div id="purchase-calculator"><UpfrontCashCalculator/></div>
   <details className="calculator-sources">
    <summary>Calculation notes and sources</summary>
    <div className="tools-source-copy">
     <p>For a residential developer purchase under the Housing Development Act in Peninsular Malaysia. Sale and purchase agreement (SPA) and loan legal estimates use the Solicitors’ Remuneration Order 2023 and assume 8% SST. Enter transfer legal fees only if your solicitor quotes them separately. Cash purchases exclude loan fees.</p>
     <p>Standard transfer duty for local buyers and permanent residents uses progressive bands. The estimate for foreign buyers without permanent residency uses 8% for residential property. Duty uses the higher of the purchase price and market value. If market value is higher, enter your solicitor’s confirmed duty amount. Legal fees above RM7.5 million require a quote. The loan duty estimate assumes a standard 0.5% secured housing loan.</p>
     <p>The first-home option models the exemption for qualifying sale and purchase agreements signed from 1 January 2026 through 31 December 2027 under P.U. (A) 448/2025 and 449/2025. Before applying it, confirm citizenship, ownership history, qualifying property type, the RM500,000 threshold and the agreement date. The calculator uses the entered price, so confirm the market value and eligibility with your solicitor.</p>
     <p>The separately announced Budget 2027 proposal for homes above RM500,000 is outside this estimate. Foreign buyers should confirm any state thresholds, consent and levies. Enter confirmed developer coverage and solicitor quotes inclusive of applicable tax.</p>
     <p>First-home sources checked 20 November 2026. <a href="https://lom.agc.gov.my/ilims/upload/portal/akta/outputp/3267964/PUA448_2025.pdf">Transfer duty amendment</a> · <a href="https://lom.agc.gov.my/ilims/upload/portal/akta/outputp/3268816/P.U.%20%28A%29%20449_2025.pdf">Loan duty amendment</a> · <a href="https://stamps.hasil.gov.my/stamps/files/announcement/1770693376.pdf">HASiL statutory declaration</a> · <a href="https://www.mof.gov.my/portal/en/news/speech/speech-the-fifth-madani-budget-2027">Budget 2027 proposal</a> · <a href="https://www.malaysianbar.org.my/cms/upload_files/document/Solicitors%20Remuneration%20Order%202023.pdf">Solicitors’ Remuneration Order 2023</a>.</p>
    </div>
   </details>
  </div>
 </main>
}
