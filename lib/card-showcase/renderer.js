// WebGL renderer for the card showcase: one shared subdivided card mesh, bent in the vertex shader,
// rounded and softened in the fragment shader. Plain WebGL1 so it runs wherever WebGL does.
import {mat4FromQP,perspective,lookAt,viewDepth} from './math.js';

const VERT=`
attribute vec2 aPos;
uniform mat4 uProj;
uniform mat4 uView;
uniform mat4 uModel;
uniform vec2 uSize;
uniform float uBend;
uniform float uPivot;
uniform vec3 uLight;
varying vec2 vUv;
varying float vShade;
varying float vDepth;
void main(){
 vec2 p=aPos*uSize;
 vec3 pos=vec3(p,0.);
 vec3 n=vec3(0.,0.,1.);
 float pivot=uPivot*uSize.x;
 // Wrap the card around a cylinder through its pivot edge: arc length is kept, so the photo
 // follows the sheet and the far edge curls rather than stretching.
 if(abs(uBend)>.0001){
  float a=(p.x-pivot)*uBend;
  pos=vec3(pivot+sin(a)/uBend,p.y,(1.-cos(a))/uBend);
  n=vec3(-sin(a),0.,cos(a));
 }
 vec4 world=uModel*vec4(pos,1.);
 vec3 wn=normalize((uModel*vec4(n,0.)).xyz);
 vShade=.86+.14*abs(dot(wn,uLight));
 vec4 view=uView*world;
 vDepth=-view.z;
 vUv=aPos+.5;
 gl_Position=uProj*view;
}`;

const frag=derivatives=>`${derivatives?'#extension GL_OES_standard_derivatives : enable\n':''}
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uTex;
uniform vec2 uSize;
uniform float uRadius;
uniform vec2 uResolution;
uniform vec2 uFocus;
uniform float uSoft;
uniform float uChroma;
uniform float uFog;
uniform vec2 uFogRange;
uniform vec3 uBg;
varying vec2 vUv;
varying float vShade;
varying float vDepth;
void main(){
 vec2 p=(vUv-.5)*uSize;
 vec2 q=abs(p)-(uSize*.5-uRadius);
 float d=length(max(q,0.))+min(max(q.x,q.y),0.)-uRadius;
 float aa=${derivatives?'max(fwidth(d),.0001)':'.006'};
 float alpha=1.-smoothstep(-aa,aa,d);
 if(alpha<.002)discard;
 vec2 uv=gl_FrontFacing?vUv:vec2(1.-vUv.x,vUv.y);
 // Sharp where the eye rests; softer toward the frame's edges and the far rows (a mip bias, not a blur pass).
 vec2 off=gl_FragCoord.xy/uResolution*2.-1.-uFocus;
 float periph=smoothstep(.45,1.25,length(off*vec2(1.,.8)));
 float far=smoothstep(uFogRange.x,uFogRange.y,vDepth);
 float bias=uSoft*max(periph,far*.7);
 vec3 col=texture2D(uTex,uv,bias).rgb;
 if(uChroma>0.){vec2 ca=off*uChroma*periph;col.r=texture2D(uTex,uv+ca,bias).r;col.b=texture2D(uTex,uv-ca,bias).b;}
 col*=vShade*(gl_FrontFacing?1.:.72);
 col=mix(col,uBg,uFog*far);
 gl_FragColor=vec4(col*alpha,alpha);
}`;

const UNIFORMS=['uProj','uView','uModel','uSize','uBend','uPivot','uLight','uTex','uRadius','uResolution','uFocus','uSoft','uChroma','uFog','uFogRange','uBg'];
const LIGHT=(()=>{const v=[-.35,.55,.75],l=Math.hypot(...v);return v.map(x=>x/l)})();

function compile(gl,type,source){
 const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
 if(gl.getShaderParameter(shader,gl.COMPILE_STATUS))return shader;
 gl.deleteShader(shader);return null;
}

// Tries each source in turn (e.g. a small preview, then the full photo); resolves null if none load in time.
export function loadImage(sources,timeout=10000){
 return new Promise(resolve=>{
  const list=sources.filter(Boolean);let done=false;
  const finish=img=>{if(!done){done=true;clearTimeout(timer);resolve(img)}};
  const timer=setTimeout(()=>finish(null),timeout);
  const next=()=>{
   const src=list.shift();if(!src)return finish(null);
   const img=new Image();
   try{if(new URL(src,location.href).origin!==location.origin)img.crossOrigin='anonymous'}catch{}
   img.onload=()=>finish(img);img.onerror=next;img.src=src;
  };
  next();
 });
}

export function createRenderer(canvas,{segments=24,background=[252/255,248/255,242/255]}={}){
 const attrs={alpha:true,antialias:true,premultipliedAlpha:true,depth:true,powerPreference:'high-performance'};
 let gl=null;
 try{gl=canvas.getContext('webgl',attrs)||canvas.getContext('experimental-webgl',attrs)}catch{}
 if(!gl)return null;
 const derivatives=!!gl.getExtension('OES_standard_derivatives');
 const aniso=gl.getExtension('EXT_texture_filter_anisotropic')||gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
 const vs=compile(gl,gl.VERTEX_SHADER,VERT),fs=compile(gl,gl.FRAGMENT_SHADER,frag(derivatives));
 if(!vs||!fs)return null;
 const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))return null;
 const u=Object.fromEntries(UNIFORMS.map(name=>[name,gl.getUniformLocation(program,name)]));

 // One mesh for every card, subdivided across its width only: bending happens along x.
 const verts=[],index=[];
 for(let y=0;y<=1;y++)for(let x=0;x<=segments;x++)verts.push(x/segments-.5,y-.5);
 for(let x=0;x<segments;x++){const a=x,b=x+1,c=x+segments+1,d=x+segments+2;index.push(a,b,c,b,d,c)}
 const vbo=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);
 const ibo=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(index),gl.STATIC_DRAW);
 const aPos=gl.getAttribLocation(program,'aPos');

 const scratch=document.createElement('canvas'),ctx=scratch.getContext('2d');
 let textures=[],width=1,height=1;
 const proj=new Float32Array(16),view=new Float32Array(16),model=new Float32Array(16);

 // Each photo is cover-cropped to the card's portrait shape and squeezed into a power-of-two square,
 // so it can be mipmapped everywhere; the card's own proportions stretch it back.
 function texture(img,size,aspect){
  scratch.width=scratch.height=size;
  if(img){
   const want=1/aspect,iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height;
   let sw=iw,sh=ih,sx=0,sy=0;
   if(iw/ih>want){sw=ih*want;sx=(iw-sw)/2}else{sh=iw/want;sy=(ih-sh)/2}
   ctx.drawImage(img,sx,sy,sw,sh,0,0,size,size);
  }else{
   const g=ctx.createLinearGradient(0,0,size,size);g.addColorStop(0,'#e7d8c7');g.addColorStop(1,'#dbb98f');
   ctx.fillStyle=g;ctx.fillRect(0,0,size,size);
  }
  const tex=gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,scratch);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  if(aniso)gl.texParameterf(gl.TEXTURE_2D,aniso.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
  return tex;
 }

 return {
  setImages(images,size,aspect){for(const t of textures)gl.deleteTexture(t);textures=images.map(img=>texture(img,size,aspect))},
  resize(w,h){width=canvas.width=w;height=canvas.height=h},
  render(f,{fov,card,optics}){
   const aspect=width/height,distance=Math.hypot(f.eye[0]-f.target[0],f.eye[1]-f.target[1],f.eye[2]-f.target[2]);
   perspective(fov*Math.PI/180,aspect,.1,100,f.shift[0],f.shift[1],proj);
   lookAt(f.eye,f.target,[0,1,0],view);
   gl.viewport(0,0,width,height);
   gl.disable(gl.SCISSOR_TEST);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   // The gallery keeps one side of the frame; nothing is drawn under the text.
   gl.enable(gl.SCISSOR_TEST);
   if(f.side==='top'){const y=Math.round(height*(1-f.keep));gl.scissor(0,y,width,height-y)}else gl.scissor(0,0,Math.round(width*f.keep),height);
   gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
   gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
   gl.useProgram(program);
   gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.enableVertexAttribArray(aPos);gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);
   const calm=1-.75*f.settle;
   gl.uniformMatrix4fv(u.uProj,false,proj);gl.uniformMatrix4fv(u.uView,false,view);
   gl.uniform2f(u.uSize,1,card.aspect);gl.uniform1f(u.uRadius,card.radius);gl.uniform3fv(u.uLight,LIGHT);
   gl.uniform2f(u.uResolution,width,height);gl.uniform2f(u.uFocus,-f.shift[0],-f.shift[1]);
   gl.uniform1f(u.uSoft,optics.soften*calm);gl.uniform1f(u.uChroma,optics.chroma*calm);gl.uniform1f(u.uFog,optics.fog*(1-.5*f.settle));
   gl.uniform2f(u.uFogRange,distance,distance*1.9);gl.uniform3fv(u.uBg,background);
   gl.uniform1i(u.uTex,0);gl.activeTexture(gl.TEXTURE0);
   // Back to front, so the soft corner edges blend over whatever is behind them.
   const order=f.cards.map(c=>({c,z:viewDepth(view,c.position)})).sort((a,b)=>b.z-a.z);
   const count=segments*6;
   for(const {c} of order){
    gl.uniformMatrix4fv(u.uModel,false,mat4FromQP(c.rotation,c.position,model));
    gl.uniform1f(u.uBend,c.bend);gl.uniform1f(u.uPivot,c.pivot);
    gl.bindTexture(gl.TEXTURE_2D,textures[c.card.image]||null);
    gl.drawElements(gl.TRIANGLES,count,gl.UNSIGNED_SHORT,0);
   }
  },
  dispose(){
   for(const t of textures)gl.deleteTexture(t);textures=[];
   gl.deleteBuffer(vbo);gl.deleteBuffer(ibo);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);
  },
 };
}
