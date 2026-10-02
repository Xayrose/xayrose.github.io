let THREE;

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;

function smoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
  });
}

function setupTilt() {
  if (reduced) return;
  document.querySelectorAll(".tilt-card").forEach(card => {
    const depth = Number(card.dataset.depth || 18);
    const reset = () => {
      if (window.gsap) gsap.to(card, { rotateX: 0, rotateY: 0, duration: .65, ease: "power3.out" });
      else card.style.transform = "";
    };
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      if (window.gsap) {
        gsap.to(card, { rotateY: x * depth, rotateX: -y * depth, duration: .35, overwrite: true, ease: "power2.out" });
      } else {
        card.style.transform = "perspective(900px) rotateX(" + (-y * depth) + "deg) rotateY(" + (x * depth) + "deg)";
      }
      const glow = card.querySelector(".card-glow");
      if (glow) {
        if (window.gsap) gsap.to(glow, { x: x * 90, y: y * 90, duration: .5, overwrite: true });
        else glow.style.transform = "translate(" + (x * 90) + "px," + (y * 90) + "px)";
      }
    });
    card.addEventListener("pointerleave", reset);
  });
}

function setupScroll() {
  if (reduced) return;
  if (!window.gsap || !window.ScrollTrigger) {
    const reveal = () => {
      document.querySelectorAll(".section-head, .project-card, .skill-copy, .about-grid, .contact-card").forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight * .88) el.classList.add("is-visible");
      });
    };
    addEventListener("scroll", reveal, { passive: true });
    reveal();
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  gsap.utils.toArray(".section").forEach(section => {
    gsap.from(section.querySelectorAll(".section-head, .project-card, .skill-copy, .about-grid, .contact-card"), {
      y: 55, opacity: 0, duration: .9, ease: "power3.out", stagger: .08,
      scrollTrigger: { trigger: section, start: "top 78%", once: true }
    });
  });
  gsap.to(".hero-copy", {
    yPercent: -12, opacity: .82, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });
  gsap.to(".hero-orbit", {
    yPercent: 18, rotation: 3, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });
}

function buildSkillSphere() {
  const box = document.getElementById("skills-sphere");
  if (!box) return;
  const names = ["HTML", "CSS", "JS", "Python", "Node", "React", "Telegram", "SQL", "Git", "Docker", "API", "Automation"];
  const center = { x: 50, y: 50 };
  const points = names.map((name, i) => {
    const a = (i / names.length) * Math.PI * 2;
    const rx = 33 + (i % 3) * 4;
    const ry = 29 + ((i + 1) % 3) * 3;
    return {
      name,
      x: center.x + Math.cos(a) * rx,
      y: center.y + Math.sin(a) * ry,
      v: i % 4 === 0
    };
  });
  const nodes = [];
  points.forEach((p, i) => {
    const dot = document.createElement("span");
    dot.className = "skill-dot" + (p.v ? " v" : "");
    dot.style.left = p.x + "%";
    dot.style.top = p.y + "%";
    dot.title = p.name;
    box.appendChild(dot);
    nodes.push({ el: dot, x: p.x, y: p.y });
  });
  nodes.forEach((a, i) => {
    const targets = [i + 1, i + 3].filter(j => j < nodes.length);
    targets.forEach(j => {
      const b = nodes[j];
      const x1 = a.x, y1 = a.y, x2 = b.x, y2 = b.y;
      const dx = x2 - x1, dy = y2 - y1;
      const length = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const line = document.createElement("i");
      line.className = "skill-line";
      line.style.left = x1 + "%";
      line.style.top = y1 + "%";
      line.style.width = length + "%";
      line.style.transform = "rotate(" + angle + "deg)";
      box.appendChild(line);
    });
  });
  if (!reduced) {
    let t = 0;
    const tick = () => {
      t += .006;
      nodes.forEach((n, i) => {
        const base = points[i];
        n.el.style.left = (base.x + Math.sin(t * 1.4 + i) * 1.8) + "%";
        n.el.style.top = (base.y + Math.cos(t * 1.1 + i) * 1.5) + "%";
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

function setupThree() {
  const mount = document.getElementById("webgl");
  if (!mount) return;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0a12, .055);
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, .1, 100);
  camera.position.set(0, 0, 7);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute("aria-hidden", "true");
  mount.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const cyanMat = new THREE.MeshStandardMaterial({ color: 0x00f5ff, metalness: .7, roughness: .22, transparent: true, opacity: .7 });
  const violetMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, metalness: .65, roughness: .25, transparent: true, opacity: .62 });
  const wire = new THREE.MeshBasicMaterial({ color: 0x00f5ff, wireframe: true, transparent: true, opacity: .14 });

  const torus = new THREE.Mesh(new THREE.TorusGeometry(1.45, .035, 12, 80), cyanMat);
  torus.position.set(1.7, .3, -1.2);
  group.add(torus);

  const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 1), violetMat);
  ico.position.set(-1.8, -.7, -2.4);
  group.add(ico);

  const icoWire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.42, 1), wire);
  icoWire.position.copy(ico.position);
  group.add(icoWire);

  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(.65, .025, 100, 10, 2, 3), cyanMat);
  knot.position.set(.2, 1.45, -4);
  knot.scale.setScalar(.85);
  group.add(knot);

  const particles = new THREE.BufferGeometry();
  const count = reduced ? 500 : 1100;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 8 + Math.random() * 18;
    const a = Math.random() * Math.PI * 2;
    positions[i*3] = Math.cos(a) * r + (Math.random() - .5) * 3;
    positions[i*3+1] = (Math.random() - .5) * 12;
    positions[i*3+2] = -Math.random() * 28;
  }
  particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const pmat = new THREE.PointsMaterial({ color: 0x7ddff0, size: .018, transparent: true, opacity: .5 });
  scene.add(new THREE.Points(particles, pmat));

  const ambient = new THREE.AmbientLight(0x6677aa, 1.8);
  scene.add(ambient);
  const cyanLight = new THREE.PointLight(0x00f5ff, 35, 18);
  cyanLight.position.set(3, 2, 3);
  scene.add(cyanLight);
  const violetLight = new THREE.PointLight(0xa855f7, 28, 15);
  violetLight.position.set(-4, -2, -2);
  scene.add(violetLight);

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener("pointermove", e => {
    mouse.tx = (e.clientX / innerWidth - .5) * 2;
    mouse.ty = (e.clientY / innerHeight - .5) * 2;
  }, { passive: true });

  let scroll = 0;
  const readScroll = () => { scroll = scrollY; };
  addEventListener("scroll", readScroll, { passive: true });

  const clock = new THREE.Clock();
  const target = new THREE.Vector3();
  function animate() {
    const t = clock.getElapsedTime();
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const progress = Math.min(1, scroll / maxScroll);

    if (!reduced) {
      mouse.x += (mouse.tx - mouse.x) * .035;
      mouse.y += (mouse.ty - mouse.y) * .035;

      // Scroll-driven camera flight through the 3D space.
      const targetZ = 7 - progress * 9;
      const targetY = -progress * 1.8;
      camera.position.z += (targetZ - camera.position.z) * .025;
      camera.position.y += ((targetY - mouse.y * .18) - camera.position.y) * .025;

      group.position.z = -progress * 5.5;
      group.rotation.y = mouse.x * .22 + t * .055 + progress * Math.PI * .7;
      group.rotation.x = mouse.y * .1 + Math.sin(t * .25) * .04;

      torus.rotation.x = t * .35 + progress * 1.4;
      torus.rotation.z = t * .22;
      ico.rotation.x = -t * .18;
      ico.rotation.y = t * .3 + progress * 1.1;
      icoWire.rotation.copy(ico.rotation);
      knot.rotation.x = t * .25;
      knot.rotation.y = -t * .32;
    } else {
      camera.position.y += ((-mouse.y * .08) - camera.position.y) * .02;
    }

    camera.position.x += ((mouse.x * .35) - camera.position.x) * .02;
    target.set(mouse.x * .5, mouse.y * -.25 + progress * -.9, -3.5 - progress * 4.5);
    camera.lookAt(target);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}

smoothScroll();
buildSkillSphere();
setupTilt();
setupScroll();

async function loadThreeAndStart() {
  try {
    THREE = await import("https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js");
    setupThree();
  } catch (error) {
    const mount = document.getElementById("webgl");
    if (mount) mount.style.display = "none";
  }
}

loadThreeAndStart();