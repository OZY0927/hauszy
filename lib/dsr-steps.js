export const dsrSteps=['Income','Commitments','Loan terms','Results'];
export function validateDsrStep(step,data,debts){
 if(step===0&&(!(Number(data.income)>0)||!Number.isFinite(Number(data.income))))return 'Enter your net monthly income.';
 if(step===1&&debts.some(debt=>!Number.isFinite(Number(debt.amount||0))||Number(debt.amount||0)<0))return 'Monthly commitments must be RM0 or more.';
 if(step===2){if(data.dsr===''||!Number.isFinite(+data.dsr)||+data.dsr<=0||+data.dsr>100)return 'Enter a target DSR above 0% and up to 100%.';if(data.rate===''||!Number.isFinite(+data.rate)||+data.rate<0||+data.rate>20)return 'Enter an interest rate from 0% to 20%.';if(!Number.isInteger(+data.years)||+data.years<1||+data.years>35)return 'Enter a tenure from 1 to 35 whole years.'}
 return '';
}
export function defaultDsrCommitments(){return ['Existing housing loan','Car / hire-purchase loan','Personal loan / financing','PTPTN / education loan','Credit-card monthly commitment','BNPL / other instalments'].map(name=>({name,amount:''}))}
