// Central rules for the mortgage & buying-cost calculator. Every rate, threshold and date used in
// lib/purchase-costs.js lives here so it can be re-verified and updated in one place.
// status: 'enacted' = in force under legislation; 'announced' = Budget measure whose gazetted order was
// not independently checked; 'secondary' = taken from professional/secondary summaries; 'placeholder' =
// a rough editable default with no statutory basis, always to be replaced by a quotation.
export const LAST_VERIFIED='2026-10-28';

const SOURCES={
  stampAct:{label:'Stamp Act 1949, First Schedule (AGC Laws of Malaysia)',url:'https://lom.agc.gov.my'},
  pwc:{label:'PwC Malaysia — stamp duty guide',url:'https://www.pwc.com/my/en/publications/mtb/stamp-duty.html'},
  skrine:{label:'Skrine — Finance Bill 2025 amendments to the Stamp Act',url:'https://www.skrine.com/insights/alerts/november-2025/proposed-amendments-to-the-stamp-act'},
  kpmg:{label:'KPMG — Finance and Tax Bills 2025 highlights',url:'https://assets.kpmg.com/content/dam/kpmg/my/pdf/financebill2026.pdf'},
  budget2026:{label:'RinggitPlus — Budget 2026 first-home stamp duty extension',url:'https://ringgitplus.com/en/blog/budget-2026/budget-2026-stamp-duty-exemptions-extended-for-homebuyers.html'},
  sro:{label:'Solicitors’ Remuneration Order 2023 (Malaysian Bar)',url:'https://www.malaysianbar.org.my/cms/upload_files/document/Solicitors%20Remuneration%20Order%202023.pdf'},
  sroSummary:{label:'Conventus Law — SRO 2023 scale summary',url:'https://conventuslaw.com/report/malaysia-the-solicitors-remuneration-order-2023/'},
  penang:{label:'Legal That Works — foreign purchase rules by state',url:'https://www.legalthatworks.com/blog/foreign-residential-property-rules-by-state-peninsular-malaysia'}
};

export const RULES={
  transferDuty:{
    title:'Property transfer duty (Malaysian citizens, PRs and Malaysian-controlled companies)',
    bands:[[100000,.01],[400000,.02],[500000,.03],[Infinity,.04]],roundTo:100,
    text:'1% on the first RM100,000, 2% on the next RM400,000, 3% on the next RM500,000 and 4% above RM1 million, charged on the higher of the consideration and market value. Each band is charged per RM100 or part thereof.',
    status:'enacted',sources:[SOURCES.stampAct,SOURCES.pwc]
  },
  foreignTransfer:{
    title:'Foreign purchaser transfer duty (Item 32(aa) / 32(ab))',
    periods:[
      {from:'2026-01-01',residential:.08,nonResidential:.04},
      {from:'2024-01-01',residential:.04,nonResidential:.04}
    ],roundTo:100,
    text:'Flat duty on the higher of consideration and market value for instruments of transfer to individuals who are neither citizens nor Malaysian PRs, and to foreign companies: 4% from 1 January 2024; residential property 8% from 1 January 2026 (non-residential stays at 4%). Before 2024, the progressive scale applied. Residential includes serviced apartments and SOHO used solely as a dwelling. The rate follows the date of the instrument of transfer; whether 8% applies to a 2026 transfer under a pre-2026 SPA was flagged for LHDN clarification.',
    status:'enacted',note:'Finance Act 2025 wording was checked against professional summaries of the Finance Bill, not the gazetted Act.',sources:[SOURCES.skrine,SOURCES.kpmg]
  },
  foreignControlledCompany:{
    title:'Locally incorporated, foreign-controlled companies',
    text:'Whether the foreign purchaser rate reaches a Malaysian-incorporated company controlled by foreigners depends on the statutory definition. The calculator asks for a quotation instead of guessing.',
    status:'secondary',sources:[SOURCES.skrine]
  },
  loanDuty:{
    title:'Loan agreement stamp duty',rate:.005,roundTo:1000,
    text:'0.5% of the total facility (RM5 per RM1,000 or part thereof) on the principal instrument. Subsidiary instruments carry nominal duty, included in disbursements.',
    status:'enacted',sources:[SOURCES.stampAct,SOURCES.pwc]
  },
  firstHome:{
    title:'First residential home exemption (i-MILIKI)',cap:500000,
    windows:[
      {from:'2021-01-01',to:'2025-12-31',status:'enacted'},
      {from:'2026-01-01',to:'2027-12-31',status:'announced'}
    ],
    text:'Full exemption on the instrument of transfer and the loan agreement for a Malaysian citizen individual buying a first residential home worth up to RM500,000 under an SPA executed in a qualifying window. The purchaser must never have owned residential property, including by inheritance, gift or joint ownership. The calculator tests the higher of price and market value against the cap, because sources differ on which measure the order uses. Serviced apartments and SOHO need lawyer confirmation.',
    status:'announced',note:'2026–2027 extension announced in Budget 2026; the gazetted exemption order and its exact conditions were not independently verified.',sources:[SOURCES.budget2026,SOURCES.pwc]
  },
  legalFees:{
    title:'Legal fees — Solicitors’ Remuneration Order 2023 (Peninsular Malaysia)',
    tableA:[[500000,.0125],[7000000,.01],[Infinity,.01]],minimum:500,negotiableAbove:7500000,
    hdaSpa:[[50000,'flat'],[250000,.75],[500000,.70],[1000000,.65],[Infinity,.60]],
    hdaLoan:[[50000,'flat'],[250000,.75],[500000,.70],[1000000,.65],[Infinity,.50]],
    text:'Table A: 1.25% on the first RM500,000 (minimum RM500), 1% on the next RM7 million, negotiable above RM7.5 million but capped at 1%. Housing Development Act purchases use Table B: RM500 up to RM50,000, then 75% / 70% / 65% of the Table A fee up to RM1 million, and above RM1 million 60% for the SPA and 50% for the financing documents. The calculator applies the percentage for the bracket to the whole Table A fee. In force from 15 July 2023. Outside Peninsular Malaysia, use a quotation.',
    status:'enacted',note:'Table B tiers were checked against a law-firm summary because the official PDF could not be read in text form.',sources:[SOURCES.sro,SOURCES.sroSummary]
  },
  sst:{
    title:'Service tax on professional fees',rate:.08,
    text:'8% service tax (from 1 March 2024) on legal and valuation professional fees. Disbursements, stamp duty and government fees are not taxed.',
    status:'enacted',sources:[SOURCES.pwc]
  },
  valuation:{
    title:'Valuation fee',bands:[[100000,.0025],[1900000,.002],[3000000,.00167],[15000000,.00125],[Infinity,.001]],minimum:300,
    text:'Rough estimate from the commonly cited valuation fee scale. Banks often use panel valuers, may discount or absorb the fee, or skip valuation on developer purchases. Replace with the bank’s quote.',
    status:'secondary',sources:[]
  },
  placeholders:{
    title:'Placeholder estimates',spaDisbursements:1500,loanDisbursements:1200,utilityDeposits:500,advanceMonths:3,
    text:'Disbursements (searches, registration, courier and printing) and utility deposits have no statutory scale. Defaults: RM1,500 for SPA and transfer disbursements, RM1,200 for loan disbursements, RM500 utility deposits, plus 3 months of maintenance and sinking fund as advance charges. Always replace with quotations.',
    status:'placeholder',sources:[]
  },
  penangForeign:{
    title:'Penang foreign purchase thresholds',
    text:'Commonly reported minimum prices: Penang Island RM1 million (strata) and RM3 million (landed); Mainland RM500,000 (strata) and RM1 million (landed). Sources disagree on the consent fee and levy (reported anywhere from 1.5% to 3%, sometimes with a fixed fee), so the calculator does not estimate it. Ask the lawyer or PTG Pulau Pinang for a quotation.',
    status:'secondary',sources:[SOURCES.penang]
  }
};

// Legal scale: SRO 2023 covers conveyancing in Peninsular Malaysia; Sabah, Sarawak and Labuan use quotations.
export const STATES=[
  {id:'penang-island',label:'Penang — Island',legal:'SRO2023',foreignMin:{strata:1000000,landed:3000000}},
  {id:'penang-mainland',label:'Penang — Mainland (Seberang Perai)',legal:'SRO2023',foreignMin:{strata:500000,landed:1000000}},
  {id:'kedah',label:'Kedah',legal:'SRO2023'},
  {id:'perlis',label:'Perlis',legal:'SRO2023'},
  {id:'perak',label:'Perak',legal:'SRO2023'},
  {id:'selangor',label:'Selangor',legal:'SRO2023'},
  {id:'kuala-lumpur',label:'Kuala Lumpur',legal:'SRO2023'},
  {id:'putrajaya',label:'Putrajaya',legal:'SRO2023'},
  {id:'negeri-sembilan',label:'Negeri Sembilan',legal:'SRO2023'},
  {id:'melaka',label:'Melaka',legal:'SRO2023'},
  {id:'johor',label:'Johor',legal:'SRO2023'},
  {id:'pahang',label:'Pahang',legal:'SRO2023'},
  {id:'terengganu',label:'Terengganu',legal:'SRO2023'},
  {id:'kelantan',label:'Kelantan',legal:'SRO2023'},
  {id:'labuan',label:'Labuan',legal:null},
  {id:'sabah',label:'Sabah',legal:null},
  {id:'sarawak',label:'Sarawak',legal:null}
];
