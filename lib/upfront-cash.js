// Malaysian legal-fee scale (Solicitors' Remuneration Order), used by the purchase budget for SPA and loan fees.
export function legalFee(amount,hda=true){
 if(!(amount>0))return 0;
 // The excess above RM7.5m is negotiated; require a quotation instead of inventing it.
 if(amount>7500000)return null;
 const scale=Math.max(500,Math.min(amount,500000)*.0125+Math.max(0,amount-500000)*.01);
 if(!hda)return scale;
 if(amount<=50000)return 500;
 if(amount<=250000)return Math.max(500,scale*.75);
 return scale*(amount<=500000?.70:amount<=1000000?.65:.50);
}
