// Rates used by the loan calculator. Last checked 28 October 2026; confirm with your lawyer before relying on them.
export const RULES={
  transferBands:[[100000,.01],[400000,.02],[500000,.03],[Infinity,.04]], // Stamp Act Item 32(a), per RM100 or part
  foreignResidentialRate:.08, // non-citizen, non-PR residential transfers from 1 January 2026
  loanDutyRate:.005, // per RM1,000 or part of the loan
  firstHomeCap:500000, // first-home exemption on transfer and loan duty, SPAs up to 31 December 2027
  legalScale:[[500000,.0125],[7000000,.01],[Infinity,.01]],legalMinimum:500, // SRO 2023 Table A, Peninsular Malaysia
  sst:.08 // service tax on legal fees
};
