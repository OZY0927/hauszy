export default function BrandLoader({intro=false}){
 return <div className={'hauszy-loader'+(intro?' hauszy-loader-intro':'')} role="status" aria-label="Loading Hauszy">
  <div className="hauszy-loader-content" aria-hidden="true">
   <div className="hauszy-loader-word">{[...'hauszy'].map((letter,index)=><span key={index} style={{'--letter-index':index}}>{letter}</span>)}</div>
   <div className="hauszy-loader-line"><span/></div>
   <p>Your next move, in Penang.</p>
  </div>
 </div>;
}
