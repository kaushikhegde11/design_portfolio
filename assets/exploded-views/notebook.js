/** One hinged book whose paper leaves open into an even fan around the spine. */
const { Cam, disposer, fit, facing, mk, poly, pointer, prism, proj, register,
  rings, rrect, open, solid, put, spring, stepS } = HL;

function mount({ stage, svg, read }) {
  const bag = disposer(), C = Cam(45, 0.5, 1.95);
  fit(C, [[-44, -42, 0], [44, 42, 0], [-44, -42, 58], [44, 42, 58]], 200, 166);
  const P = proj(C), front = facing(C), root = mk("g", {}, svg);
  const back = solid(root), spine = solid(root), cover = solid(root);
  const coverInset = mk("path", { class:"nf lo" }, root);
  const hinge = mk("path", { class:"nf lo" }, root);
  const PAGE_COUNT = 7, PAGE_W = 72, SPINE_X = -38, SPINE_Z = 4.2;
  const pages = Array.from({ length:PAGE_COUNT }, () => ({
    body:solid(root), rules:mk("path", { class:"nf lo" }, root),
  }));
  const backRing = rings(-42, -37, 42, 37, 5, 1);
  const spineRing = rings(-42, -38, -35, 38, 1.5, 0.7);
  const pageRing = rrect(0, -34, PAGE_W, 34, 1.4, 8);
  const coverRing = rrect(0, -37, 76, 37, 3, 8);
  const coverInsetRing = rrect(4, -33, 72, 33, 2, 8);
  const gap = spring(0.35);
  let point = null, last = NaN;

  const angleAt = (i, amount) => {
    const t = i / (PAGE_COUNT - 1);
    const rest = (0.5 + t * 1.2) * Math.PI / 180;
    const open = (t * 34) * Math.PI / 180;
    return rest + (open - rest) * amount;
  };
  const pageFace = (angle) => (u, v, d) => {
    const c = Math.cos(angle), s = Math.sin(angle);
    return P(SPINE_X + u * c - d * s, v, SPINE_Z + u * s + d * c);
  };

  function linesAt(face, offset) {
    return [-22, -10, 2, 14].map((y, i) =>
      poly(rrect(18 + (i % 2) * 3, y, 59 - (i % 2) * 5, y + 0.55, 0.25, 4)
        .map(q => face(q.u, q.v, offset)))
    ).join("");
  }

  function draw(amount) {
    put(back, prism(P, front, ...backRing, 0, 3.4));
    put(spine, prism(P, front, ...spineRing, 2.8, 8.5));
    hinge.setAttribute("d", open([P(-38, -34, 4.2), P(-38, 34, 4.2), P(-38, 34, 7.8)]));

    pages.forEach((page, i) => {
      const offset = 0.15 + i * 0.42;
      const face = pageFace(angleAt(i, amount));
      put(page.body, prism(face, q => q.nu * 0.707 + q.nv * 0.707 > 0,
        pageRing, null, offset, offset + 0.38));
      page.rules.setAttribute("d", linesAt(face, offset + 0.39));
    });

    const coverAngle = angleAt(PAGE_COUNT - 1, amount) + 0.115;
    const face = pageFace(coverAngle);
    put(cover, prism(face, q => q.nu * 0.707 + q.nv * 0.707 > 0,
      coverRing, null, 3.2, 6.5));
    coverInset.setAttribute("d", poly(coverInsetRing.map(q => face(q.u, q.v, 6.55))));
  }

  function target() { gap.t = point ? 1 : 0; B.wake(); }
  const B = register(stage, dt => {
    const moving = stepS(gap, dt);
    if (gap.x !== last) { draw(gap.x); last = gap.x; }
    return moving;
  });
  bag.add(B.unregister);
  bag.add(pointer(stage, {
    move:p => { point = p; target(); },
    leave:() => { point = null; target(); },
  }));
  bag.add(() => svg.replaceChildren());
  read.textContent = "closed";
  draw(gap.x); last = gap.x;
  return { set:v => { gap.t = v; B.wake(); }, destroy:bag.dispose };
}

hairline({
  name:"notebook",
  means:"A single book opens at its spine, spreading seven attached pages at equal angles.",
  rules:[1,3,4,5,6,7,8,9,10],
  range:[0,0.5,1],
  mount,
});
