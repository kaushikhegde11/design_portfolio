/** A compact creative workstation: wooden easel, canvas and side monitor.
 * One horizontal spring separates the working surfaces from their supports. */
const { Cam, clamp, disposer, fit, hull, mk, open, pointer, poly,
  prism, proj, register, ringAt, rings, rrect, run, solid, put, spring, stepS } = HL;

function mount({stage,svg,read},value) {
  const bag=disposer(), C=Cam(45,0.5,2.1);
  fit(C,[[-55,18,0],[-26,-8,92],[2,18,0],[49,6,40],[49,6,74]],200,166);
  const P=proj(C), root=mk("g",{},svg);
  const front=q=>q.nu+q.nv>0;
  const arm=solid(root), easel=mk("g",{},root), monitor=mk("g",{},root);
  const rear=solid(easel), left=solid(easel), right=solid(easel), brace=solid(easel);
  const grain=mk("path",{class:"nf lo"},easel);
  const canvas=solid(easel), canvasInset=mk("path",{class:"nf lo"},easel);
  const shelf=solid(easel), clampTop=solid(easel);
  const neck=solid(monitor), housing=solid(monitor);
  const screen=solid(monitor), bezel=mk("path",{class:"nf lo"},monitor);
  const guides=mk("path",{class:"nf dash"},root);
  // Guides stay behind both opaque working surfaces.
  root.prepend(guides);
  const boardRing=rings(-23,31,23,83,2.5,0.8);
  const housingRing=rings(-27,40,27,74,3,1);
  const screenRing=rings(-25,42,25,72,2.3,0.8);
  const viewRing=rrect(-22,45,22,69,1.5,8);
  const gap=spring(4); let reach=value,point=null,active=-1,last=NaN;
  const boardFace=g=>(u,v,d)=>P(-27+u,13+g*0.6-v*0.11+d,v+g*0.35);
  const screenFace=g=>(u,v,d)=>P(22+u,7+g*0.8+d,v);
  const housingFace=(u,v,d)=>P(22+u,4+d,v);

  function rail(part,x0,z0,x1,z1,y,width) {
    const dx=x1-x0,dz=z1-z0,length=Math.hypot(dx,dz),a=dx/length,b=dz/length;
    const R=rings(-width/2,0,width/2,length,1,0.55);
    const face=(u,v,d)=>P(x0+u*b+v*a,y-v*0.08+d,z0-u*a+v*b);
    put(part,prism(face,front,...R,0,2.8));
  }
  function draw(g) {
    // One rounded support connects the monitor to the easel's frame.
    put(arm,prism((u,v,d)=>P(u,4+d,v),front,...rings(-21,50,22,54,1,0.6),0,3));
    rail(rear,-27,0,-27,90,-8,4);
    rail(left,-55,0,-28,92,15,4.5);
    rail(right,1,0,-25,92,15,4.5);
    put(brace,prism((u,v,d)=>P(-27+u,13+d,v),front,...rings(-20,24,20,28,1,0.6),0,2.8));
    grain.setAttribute("d",open([P(-50,18,5),P(-47,17.5,15)])+open([P(-3,18,5),P(-6,17.5,15)]));
    put(canvas,prism(boardFace(g),front,...boardRing,0,2.4));
    canvasInset.setAttribute("d",poly(ringAt(boardFace(g),rrect(-19,35,19,79,1.7,8),2.4)));
    put(shelf,prism(P,front,...rings(-53,10,0,22,1.4,0.7),29,32));
    put(clampTop,prism((u,v,d)=>P(-27+u,6+d,v),front,...rings(-5,84,5,88,1,0.6),0,3));
    put(neck,prism(housingFace,front,...rings(-3,50,3,59,1,0.6),0,3));
    put(housing,prism(housingFace,front,...housingRing,0,3));
    put(screen,prism(screenFace(g),front,...screenRing,0,1));
    bezel.setAttribute("d",poly(ringAt(screenFace(g),viewRing,1)));
    guides.setAttribute("d",open([housingFace(-21,48,3),screenFace(g)(-21,48,0)])+open([P(-44,10,56),boardFace(g)(-17,56,0)]));
  }
  function contains(p,shape) {
    let sign=0;
    for(let i=0;i<shape.length;i++) {
      const a=shape[i],b=shape[(i+1)%shape.length];
      const c=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
      if(Math.abs(c)<0.001)continue;
      const s=Math.sign(c);if(sign&&sign!==s)return false;sign=s;
    }
    return true;
  }
  function pick() {
    let a=-1;
    if(point) {
      // Pick from the target, never the spring's moving drawing.
      const shapes=[hull(ringAt(boardFace(gap.t),boardRing[0],2.4)),hull(ringAt(screenFace(gap.t),screenRing[0],1))];
      for(let i=1;i>=0;i--)if(contains(point,shapes[i])){a=i;break;}
    }
    if(a===active)return;active=a;
    canvas.sil.classList.toggle("hi",a<=0);screen.sil.classList.toggle("hi",a===1);
    read.textContent=a<0?"rest":a===0?"canvas":"monitor";
  }
  function target(){gap.t=point?reach:4;pick();B.wake();}
  const B=register(stage,dt=>{const moving=stepS(gap,dt);if(gap.x!==last){draw(gap.x);last=gap.x;}return moving;});
  bag.add(B.unregister);
  bag.add(pointer(stage,{move:p=>{point=p;target();},leave:()=>{point=null;target();}}));
  bag.add(()=>svg.replaceChildren());canvas.sil.classList.add("hi");read.textContent="rest";
  draw(gap.x);last=gap.x;
  return {set:v=>{reach=v;target();},destroy:bag.dispose};
}
hairline({name:"studio",means:"A wooden easel and side monitor: move across to separate the canvas and screen from their supports.",rules:[1,3,4,5,6,7,8,9,10],range:[8,14,20],mount});
