import {createRemoteJWKSet,jwtVerify} from 'jose';
import {firebaseConfig} from './firebase-config.js';
import {isAllowedAdminUid} from './admin-access.js';
import {RequestError} from './revalidation-security.js';
const googleKeys=createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),{timeoutDuration:5000});
export async function verifyAdminIdToken(token,{keys=googleKeys,lookup=fetch}={}){
 let payload;
 try{({payload}=await jwtVerify(token,keys,{algorithms:['RS256'],issuer:`https://securetoken.google.com/${firebaseConfig.projectId}`,audience:firebaseConfig.projectId,requiredClaims:['exp','iat','auth_time','sub']}))}catch(error){if(error.code==='ERR_JWKS_TIMEOUT'||error instanceof TypeError)throw new RequestError(503,'Authentication temporarily unavailable.');throw new RequestError(401,'Invalid or expired session.');}
 const now=Math.floor(Date.now()/1000);
 if(typeof payload.sub!=='string'||!payload.sub||payload.sub.length>128||typeof payload.iat!=='number'||payload.iat>now||typeof payload.auth_time!=='number'||payload.auth_time>payload.iat)throw new RequestError(401,'Invalid session.');
 if(!isAllowedAdminUid(payload.sub)||payload.firebase?.sign_in_provider!=='password')throw new RequestError(403,'Administrator access required.');
 let response,user;try{response=await lookup(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:token}),cache:'no-store',signal:AbortSignal.timeout(8000)});if(response.ok)user=(await response.json()).users?.[0]}catch{throw new RequestError(503,'Authentication temporarily unavailable.');}
 if(response.status===429||response.status>=500)throw new RequestError(503,'Authentication temporarily unavailable.');
 // Account lookup checks current disable/revocation state in addition to the JWT signature.
 if(!user||user.localId!==payload.sub||user.disabled||Number(user.validSince||0)>payload.auth_time)throw new RequestError(401,'Your session expired. Sign in again.');
 return payload.sub;
}
