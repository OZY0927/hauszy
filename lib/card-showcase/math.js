// Minimal vector, quaternion and column-major mat4 helpers for the card showcase (no 3D library needed).
// Quaternions are [x,y,z,w]; matrices are Float32Array(16) in WebGL's column-major order.
export const clamp=(v,lo=0,hi=1)=>Math.min(hi,Math.max(lo,v));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const range=(v,[a,b])=>clamp((v-a)/Math.max(1e-6,b-a));
export const easeInOut=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
export const easeOut=t=>1-Math.pow(1-t,3);
// Deterministic 0..1 noise from an integer, so layouts match across renders and refreshes.
export const hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s)};

export const qAxis=(x,y,z,angle)=>{const s=Math.sin(angle/2);return [x*s,y*s,z*s,Math.cos(angle/2)]};
export function qMul(a,b){
 const [ax,ay,az,aw]=a,[bx,by,bz,bw]=b;
 return [aw*bx+ax*bw+ay*bz-az*by,aw*by-ax*bz+ay*bw+az*bx,aw*bz+ax*by-ay*bx+az*bw,aw*bw-ax*bx-ay*by-az*bz];
}
// Shortest-path spherical interpolation, so no card ever takes the long way round.
export function qSlerp(a,b,t){
 let [bx,by,bz,bw]=b,d=a[0]*bx+a[1]*by+a[2]*bz+a[3]*bw;
 if(d<0){d=-d;bx=-bx;by=-by;bz=-bz;bw=-bw}
 let k0=1-t,k1=t;
 if(d<.9995){const o=Math.acos(d),s=Math.sin(o);k0=Math.sin(k0*o)/s;k1=Math.sin(k1*o)/s}
 const q=[k0*a[0]+k1*bx,k0*a[1]+k1*by,k0*a[2]+k1*bz,k0*a[3]+k1*bw],n=Math.hypot(...q)||1;
 return q.map(v=>v/n);
}
export function qRotate(q,v){
 const [x,y,z,w]=q,tx=2*(y*v[2]-z*v[1]),ty=2*(z*v[0]-x*v[2]),tz=2*(x*v[1]-y*v[0]);
 return [v[0]+w*tx+y*tz-z*ty,v[1]+w*ty+z*tx-x*tz,v[2]+w*tz+x*ty-y*tx];
}

export function mat4FromQP(q,p,out=new Float32Array(16)){
 const [x,y,z,w]=q,x2=x+x,y2=y+y,z2=z+z,xx=x*x2,xy=x*y2,xz=x*z2,yy=y*y2,yz=y*z2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2;
 out[0]=1-(yy+zz);out[1]=xy+wz;out[2]=xz-wy;out[3]=0;
 out[4]=xy-wz;out[5]=1-(xx+zz);out[6]=yz+wx;out[7]=0;
 out[8]=xz+wy;out[9]=yz-wx;out[10]=1-(xx+yy);out[11]=0;
 out[12]=p[0];out[13]=p[1];out[14]=p[2];out[15]=1;
 return out;
}
// Perspective with a lens shift: content moves by -shift in normalised device coordinates,
// which slides the scene into one half of the frame without turning the camera.
export function perspective(fovy,aspect,near,far,shiftX=0,shiftY=0,out=new Float32Array(16)){
 const f=1/Math.tan(fovy/2),nf=1/(near-far);
 out.fill(0);
 out[0]=f/aspect;out[5]=f;out[8]=shiftX;out[9]=shiftY;out[10]=(far+near)*nf;out[11]=-1;out[14]=2*far*near*nf;
 return out;
}
export function lookAt(eye,target,up=[0,1,0],out=new Float32Array(16)){
 let zx=eye[0]-target[0],zy=eye[1]-target[1],zz=eye[2]-target[2],l=Math.hypot(zx,zy,zz)||1;zx/=l;zy/=l;zz/=l;
 let xx=up[1]*zz-up[2]*zy,xy=up[2]*zx-up[0]*zz,xz=up[0]*zy-up[1]*zx;l=Math.hypot(xx,xy,xz)||1;xx/=l;xy/=l;xz/=l;
 const yx=zy*xz-zz*xy,yy=zz*xx-zx*xz,yz=zx*xy-zy*xx;
 out[0]=xx;out[1]=yx;out[2]=zx;out[3]=0;
 out[4]=xy;out[5]=yy;out[6]=zy;out[7]=0;
 out[8]=xz;out[9]=yz;out[10]=zz;out[11]=0;
 out[12]=-(xx*eye[0]+xy*eye[1]+xz*eye[2]);out[13]=-(yx*eye[0]+yy*eye[1]+yz*eye[2]);out[14]=-(zx*eye[0]+zy*eye[1]+zz*eye[2]);out[15]=1;
 return out;
}
// View-space depth (positive in front of the camera) of a world point.
export const viewDepth=(view,p)=>-(view[2]*p[0]+view[6]*p[1]+view[10]*p[2]+view[14]);
