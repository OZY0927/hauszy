'use client';
import {useEffect,useRef} from 'react';
import {listingMeshFragment} from '../lib/listing-mesh-shader';

export default function ListingMeshBackground(){
 const canvas=useRef(null);
 useEffect(()=>{
  const el=canvas.current,gl=el.getContext('webgl',{alpha:false,antialias:false,depth:false,powerPreference:'low-power'});
  if(!gl)return;
  let frame=0,disposed=false,last=0,time=0;
  const shaders=[];
  function compile(type,source){const shader=gl.createShader(type);shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);return gl.getShaderParameter(shader,gl.COMPILE_STATUS)?shader:null}
  const vertex=compile(gl.VERTEX_SHADER,'attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}'),fragment=compile(gl.FRAGMENT_SHADER,listingMeshFragment);
  const program=gl.createProgram();
  if(!vertex||!fragment){shaders.forEach(s=>gl.deleteShader(s));gl.deleteProgram(program);return}
  gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){shaders.forEach(s=>gl.deleteShader(s));gl.deleteProgram(program);return}
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const uniforms=Object.fromEntries(['u_scene','u_shape','u_surface','u_finish','u_transform','u_space','u_cursor'].map(name=>[name,gl.getUniformLocation(program,name)]));
  const set=(name,...values)=>gl.uniform4f(uniforms[name],...values);
  const theme=getComputedStyle(document.documentElement);
  const hex=name=>theme.getPropertyValue(name).trim();
  const rgb=color=>{const value=color.replace('#','');return [0,2,4].map(i=>parseInt(value.slice(i,i+2),16)/255)};
  // Hauszy paper, terracotta, warm sand and pale cream replace the reference palette.
  const colors=[hex('--paper')||'#FCF8F2',hex('--primary')||'#96351E',hex('--secondary')||'#DBB98F',hex('--surface-soft')||'#F3EADD',hex('--line')||'#E7D8C7'];
  gl.uniform3fv(gl.getUniformLocation(program,'u_colors[0]'),new Float32Array([...colors,...Array(3).fill(colors[0])].flatMap(rgb)));
  set('u_shape',1.26,.35,.28,0);set('u_surface',1.82,1.17,0,1);set('u_finish',0,.15,.007,.04);set('u_transform',5069,0,.15,0);
  let pointer=[0,0],presence=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const draw=()=>{const ratio=Math.min(devicePixelRatio||1,2),width=Math.round(el.clientWidth*ratio),height=Math.round(el.clientHeight*ratio);if(!width||!height)return;if(el.width!==width||el.height!==height){el.width=width;el.height=height;gl.viewport(0,0,width,height)}set('u_scene',width,height,time*-.57,5);set('u_space',.09,.15,...pointer);set('u_cursor',reduced.matches?0:presence,2,.73,.36);gl.drawArrays(gl.TRIANGLES,0,3)};
  const tick=now=>{frame=0;if(disposed||document.hidden||reduced.matches)return;if(now-last>=1000/30){time+=last?Math.min((now-last)/1000,.1):0;last=now;draw()}frame=requestAnimationFrame(tick)};
  const resume=()=>{cancelAnimationFrame(frame);frame=0;last=0;draw();if(!document.hidden&&!reduced.matches&&!disposed)frame=requestAnimationFrame(tick)};
  const move=event=>{const rect=el.getBoundingClientRect();pointer=[(event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2];presence=1};
  const leave=()=>{presence=0};
  const lost=event=>{event.preventDefault();cancelAnimationFrame(frame)};
  const resize=new ResizeObserver(()=>draw());resize.observe(el);
  window.addEventListener('pointermove',move,{passive:true});document.documentElement.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);el.addEventListener('webglcontextlost',lost);
  resume();
  return()=>{disposed=true;cancelAnimationFrame(frame);resize.disconnect();window.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',resume);reduced.removeEventListener('change',resume);el.removeEventListener('webglcontextlost',lost);gl.deleteBuffer(buffer);gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s))};
 },[]);
 return <div className="listing-mesh-background" aria-hidden="true"><canvas ref={canvas}/></div>;
}
