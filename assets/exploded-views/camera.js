/** A camera, gently exploded along its optical axis. Horizontal input scrubs
 * the gap; target-pose hit areas pick a part without following the spring. */
const {
  Cam, circ, clamp, disposer, fillet, fit, hull, mk, open, pointer, poly, prism,
  proj, register, ringAt, rings, rrect, run, solid, put, spring, stepS,
} = HL;

function mount({ stage, svg, read }, value) {
  const bag = disposer(), C = Cam(45, 0.5, 2.15);
  // Match the other landing-page drawings' rest width and optical centre.
  fit(C, [[-18,-44,0],[-18,44,0],[116,-44,0],[116,44,0],[-18,-44,71],[116,44,71]], 221.13, 196.33);
  const P = proj(C), root = mk("g", {}, svg);
  const front = (q) => q.nu + q.nv > 0;
  const roundFront = (q) => q.nu * 0.612 + q.nv * 0.5 > 0;
  const bodyRing = rings(-18,-44,9,44,5,1.2);
  const finderRing = rings(-13,-11,6,11,3,1);
  const shutterRing = rings(-8,25,4,37,6,0.8);
  const dialRing = rings(-15,-32,-3,-20,6,0.8);
  const sensorRing = [rrect(-17,-13,17,13,3,10), rrect(-15.8,-11.8,15.8,11.8,1.8,10)];
  const lensRing = [circ(22,80),circ(20.8,80)];
  const glassRing = [circ(19,80),circ(17.8,80)];
  const CY = -6, CZ = 30;
  const face = (x) => (u,v,z) => P(x + z, CY + u, CZ + v);
  const guide = mk("path", { class: "nf dash" }, root);
  const groups = Array.from({length:4}, () => mk("g", {}, root));
  const ledAt = P(6, 38, 60.8);
  mk("circle", { class:"camera-led-halo", cx:ledAt[0], cy:ledAt[1], r:3.1 }, root);
  mk("circle", { class:"camera-led-body", cx:ledAt[0], cy:ledAt[1], r:1.45 }, root);
  mk("circle", { class:"camera-led-core", cx:ledAt[0], cy:ledAt[1], r:0.48 }, root);
  const body = solid(groups[0]), dial = solid(groups[0]);
  const dialTicks = mk("path", {class:"nf lo"}, groups[0]);
  const finder = solid(groups[0]), shutter = solid(groups[0]);
  const finderWindow = mk("path", {class:"nf lo"}, groups[0]);
  const mountRing = solid(groups[0]);
  const mountScrews = mk("path", {class:"nf lo"}, groups[0]);
  const grip = mk("path", {class:"lo"}, groups[0]);
  const sensor = solid(groups[1]), chip = mk("path", {class:"lo"}, groups[1]);
  const barrel = solid(groups[2]);
  const grooves = mk("path", {class:"nf lo"}, groups[2]);
  const glass = solid(groups[3]), optic = mk("path", {class:"nf lo"}, groups[3]);
  const blades = mk("path", {class:"nf lo"}, groups[3]);
  const outlines = [body.sil,sensor.sil,barrel.sil,glass.sil];
  const names = ["body","sensor","barrel","glass"];
  const gap = spring(10);
  let reach = value, point = null, active = -1, lastGap = NaN;

  // Each plane's rounded face is a real camera feature, never a label.
  const yz = (ring,x) => poly(ring.map(q => P(x,CY+q.u,CZ+q.v)));
  const windowRing = rrect(-7,63,7,68,1.4,8);
  const gripRing = rrect(24,8,39,53,5,10);
  const chipRing = rrect(-12,-8,12,8,1.3,8);
  const aperture = circ(14.5,80);
  const diaphragm = circ(6.5,6);

  function positions(g) { return [9,18 + g * 0.6,28 + g * 1.55,49 + g * 2.85]; }
  function draw(g) {
    const x = positions(g);
    guide.setAttribute("d",open([P(9,CY,CZ),P(x[3]+3,CY,CZ)]));
    put(body,prism(P,front,...bodyRing,0,60));
    put(dial,prism(P,front,...dialRing,60,63));
    dialTicks.setAttribute("d",Array.from({length:6},(_,i) => {
      const a=i*Math.PI/3, c=Math.cos(a), s=Math.sin(a);
      return open([P(-9+c*3,-26+s*3,63),P(-9+c*4.7,-26+s*4.7,63)]);
    }).join(""));
    put(finder,prism(P,front,...finderRing,60,71));
    put(shutter,prism(P,front,...shutterRing,60,63));
    finderWindow.setAttribute("d",poly(windowRing.map(q => P(6,q.u,q.v))));
    put(mountRing,prism(face(9),roundFront,circ(20,80),circ(18.8,80),0,2.5));
    mountScrews.setAttribute("d",[0,2,4].map(i => {
      const a=i*Math.PI/3, u=Math.cos(a)*16, v=Math.sin(a)*16;
      return poly(circ(0.9,16).map(q => face(11.5)(u+q.u,v+q.v,0)));
    }).join(""));
    grip.setAttribute("d",poly(gripRing.map(q => P(9,q.u,q.v))));
    put(sensor,prism(face(x[1]),roundFront,...sensorRing,0,2.4));
    chip.setAttribute("d",yz(chipRing,x[1]+2.4));
    put(barrel,prism(face(x[2]),roundFront,...lensRing,0,15));
    grooves.setAttribute("d",[3,6,9].map(d => open(ringAt(face(x[2]+d),run(lensRing[0],roundFront),0))).join(""));
    put(glass,prism(face(x[3]),roundFront,...glassRing,0,3));
    optic.setAttribute("d",yz(aperture,x[3]+3));
    blades.setAttribute("d",poly(fillet(diaphragm.map(q => face(x[3]+3)(q.u,q.v,0)),diaphragm.map(() => 0.8),4))+diaphragm.map((q,i) => {
      const a=i*Math.PI/3+0.55;
      return open([face(x[3]+3)(q.u,q.v,0),face(x[3]+3)(14.5*Math.cos(a),14.5*Math.sin(a),0)]);
    }).join(""));
  }

  // Convex silhouettes from the TARGET, so a still pointer cannot chase motion.
  function hitShapes(g) {
    const x = positions(g);
    return [
      hull([...ringAt(P,bodyRing[0],0),...ringAt(P,bodyRing[0],60),...ringAt(P,finderRing[0],71)]),
      hull([...ringAt(face(x[1]),sensorRing[0],0),...ringAt(face(x[1]),sensorRing[0],2.4)]),
      hull([...ringAt(face(x[2]),lensRing[0],0),...ringAt(face(x[2]),lensRing[0],15)]),
      hull([...ringAt(face(x[3]),glassRing[0],0),...ringAt(face(x[3]),glassRing[0],3)]),
    ];
  }
  function inside(p,shape) {
    let sign = 0;
    for (let i=0;i<shape.length;i++) {
      const a=shape[i], b=shape[(i+1)%shape.length];
      const c=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
      if (Math.abs(c)<0.001) continue;
      const s=Math.sign(c); if (sign && sign!==s) return false; sign=s;
    }
    return true;
  }
  function pick() {
    let a=-1;
    if (point) {
      const shapes=hitShapes(gap.t);
      for (let i=3;i>=0;i--) if (inside(point,shapes[i])) { a=i; break; }
    }
    if (a===active) return;
    active=a;
    outlines.forEach((el,i) => el.classList.toggle("hi",i===(a<0?3:a)));
    read.textContent=a<0?"rest":names[a];
  }
  function target() {
    gap.t=point ? reach : 10;
    pick(); B.wake();
  }
  const B=register(stage,(dt) => {
    const moving=stepS(gap,dt);
    if (gap.x!==lastGap) { draw(gap.x); lastGap=gap.x; }
    return moving;
  });
  bag.add(B.unregister);
  bag.add(pointer(stage,{
    move:(p) => { point=p; target(); },
    leave:() => { point=null; target(); },
  }));
  bag.add(() => svg.replaceChildren());
  glass.sil.classList.add("hi"); read.textContent="rest";
  draw(gap.x); lastGap=gap.x;
  return { set:(v) => { reach=v; target(); }, destroy:bag.dispose };
}

hairline({
  name:"camera",
  means:"A camera in four parts: move left to right to open the optical stack, and hover a part to inspect it.",
  rules:[1,3,4,5,6,8,9,10],
  range:[12,19,23],
  mount,
});
