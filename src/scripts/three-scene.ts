import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const SEG = 26;
const SEG_LEN = 24;
const TUN_LEN = SEG * SEG_LEN;
const COLORS = [0x39ff9d, 0x1fe6ff, 0xffe14d, 0xeafff5, 0x7c5cff];

export function initThreeScene() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000208, 0.012);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 600);

  scene.add(new THREE.AmbientLight(0x2a3d4d, 0.7));
  const keyLight = new THREE.PointLight(0x9fe8ff, 2.0, 90);
  const rimLight = new THREE.PointLight(0x4dffb0, 1.4, 70);
  scene.add(keyLight, rimLight);

  const dummy = new THREE.Object3D();
  const tmp = new THREE.Object3D();
  const col = new THREE.Color();

  // pillars
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x05080d, roughness: 0.55, metalness: 0.7,
    emissive: 0x05131a, emissiveIntensity: 0.6,
  });
  const PILLAR_N = SEG * 4;
  const pillars = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), pillarMat, PILLAR_N);
  let pi = 0;
  const xs = [-13, -9, 9, 13];
  for (let s = 0; s < SEG; s++) {
    const z = -s * SEG_LEN;
    for (let k = 0; k < 4; k++) {
      dummy.position.set(xs[k] + (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 2, z + (Math.random() - 0.5) * 4);
      dummy.scale.set(1.4 + Math.random() * 1.6, 14 + Math.random() * 5, 1.4 + Math.random() * 1.6);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      pillars.setMatrixAt(pi++, dummy.matrix);
    }
  }
  scene.add(pillars);

  // data blocks
  const blockMat = new THREE.MeshBasicMaterial({
    transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide, depthWrite: false,
  });
  const BLOCK_N = 520;
  const blocks = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), blockMat, BLOCK_N);
  const blockData: any[] = [];
  for (let i = 0; i < BLOCK_N; i++) {
    const ang = Math.random() * Math.PI * 2;
    const rad = 3 + Math.random() * 11;
    blockData.push({
      x: Math.cos(ang) * rad, y: Math.sin(ang) * rad * 0.7, z: -Math.random() * TUN_LEN,
      w: 0.4 + Math.random() * 3.4, h: 0.25 + Math.random() * 1.3,
      rx: (Math.random() - 0.5) * 0.6, ry: (Math.random() - 0.5) * 0.6,
      tw: Math.random() * Math.PI * 2, ts: 1 + Math.random() * 2,
    });
    col.set(COLORS[(Math.random() * COLORS.length) | 0]);
    blocks.setColorAt(i, col);
  }
  scene.add(blocks);

  // code rain
  const rain = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.06, 1),
    new THREE.MeshBasicMaterial({ color: 0x35ff9b, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }),
    260
  );
  const rainData: any[] = [];
  for (let i = 0; i < 260; i++) {
    rainData.push({ x: (Math.random() - 0.5) * 30, y: Math.random() * 30 - 6, z: -Math.random() * TUN_LEN, len: 2 + Math.random() * 6, spd: 6 + Math.random() * 16 });
  }
  scene.add(rain);

  // grids
  function makeGrid(y: number, color: number) {
    const g = new THREE.Group();
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.32 });
    const pts: number[] = [];
    const W = 16, L = TUN_LEN;
    for (let x = -W; x <= W; x += 2) { pts.push(x, y, 0, x, y, -L); }
    for (let z = 0; z >= -L; z -= 4) { pts.push(-W, y, z, W, y, z); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    g.add(new THREE.LineSegments(geo, mat));
    return g;
  }
  const floor = makeGrid(-7.5, 0x0c5a3a);
  const ceil = makeGrid(7.5, 0x0a3f55);
  scene.add(floor, ceil);

  // astronaut
  function buildAstronaut(scale: number, ghost: boolean) {
    const g = new THREE.Group();
    const suit = new THREE.MeshStandardMaterial({
      color: 0xdfe9ee, roughness: 0.42, metalness: 0.25,
      transparent: true, opacity: ghost ? 0.55 : 0.92,
      emissive: 0x16313a, emissiveIntensity: 0.5,
    });
    const visor = new THREE.MeshStandardMaterial({
      color: 0x07141c, roughness: 0.08, metalness: 1.0,
      emissive: 0x1ec8ff, emissiveIntensity: 0.7, transparent: true, opacity: 0.95,
    });
    g.add(new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 0.95, 6, 14), suit));
    const pack = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.15, 0.55), suit);
    pack.position.set(0, 0.05, -0.6); g.add(pack);
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.62, 26, 26), suit);
    helmet.position.y = 1.18; g.add(helmet);
    const vis = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 24, -0.6, 1.2, 0.55, 1.6), visor);
    vis.position.set(0, 1.16, 0.18); g.add(vis);
    const limb = (len: number) => new THREE.Mesh(new THREE.CapsuleGeometry(0.21, len, 5, 10), suit);
    const armL = limb(1.0); armL.position.set(-0.86, 0.15, 0); armL.rotation.z = 0.55; g.add(armL);
    const armR = limb(1.0); armR.position.set(0.86, 0.15, 0); armR.rotation.z = -0.55; g.add(armR);
    const legL = limb(1.15); legL.position.set(-0.32, -1.25, 0); legL.rotation.z = 0.18; g.add(legL);
    const legR = limb(1.15); legR.position.set(0.32, -1.25, 0); legR.rotation.z = -0.18; g.add(legR);
    g.add(new THREE.Mesh(new THREE.SphereGeometry(2.1, 18, 18),
      new THREE.MeshBasicMaterial({ color: 0x7fffe0, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false })));
    g.scale.setScalar(scale);
    return g;
  }
  const hero = new THREE.Group();
  scene.add(hero);
  hero.add(new THREE.Mesh(new THREE.SphereGeometry(2.4, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0x8fffe6, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false })));

  const farAstros: THREE.Group[] = [];
  for (let i = 0; i < 3; i++) {
    const grp = new THREE.Group();
    grp.userData = { z: -40 - i * 70 - Math.random() * 40, x: (Math.random() - 0.5) * 16, y: (Math.random() - 0.5) * 8, sp: 0.4 + Math.random() * 0.5, ph: Math.random() * Math.PI * 2 };
    scene.add(grp); farAstros.push(grp);
  }

  function normalizeAstronaut(obj: THREE.Object3D, targetH: number) {
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);
    obj.position.sub(center);
    const wrap = new THREE.Group();
    wrap.add(obj);
    wrap.scale.setScalar(targetH / (size.y || 1));
    return wrap;
  }

  // holographic ghost shader — the Lusion look comes from the material, not mesh detail
  const ghostMats: THREE.ShaderMaterial[] = [];
  function makeGhostMaterial(rim: number, core: number, power: number, alpha: number) {
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uRim: { value: new THREE.Color(rim) },
        uCore: { value: new THREE.Color(core) },
        uPower: { value: power },
        uAlpha: { value: alpha },
      },
      vertexShader: `
        varying vec3 vN; varying vec3 vView; varying vec3 vWorld;
        void main(){
          vec4 wp = modelMatrix * vec4(position,1.0);
          vWorld = wp.xyz;
          vN = normalize(mat3(modelMatrix) * normal);
          vView = normalize(cameraPosition - wp.xyz);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      fragmentShader: `
        varying vec3 vN; varying vec3 vView; varying vec3 vWorld;
        uniform float uTime,uPower,uAlpha; uniform vec3 uRim,uCore;
        void main(){
          float f = pow(1.0 - clamp(dot(normalize(vView), normalize(vN)),0.0,1.0), uPower);
          float scan = 0.65 + 0.35*(0.5+0.5*sin(vWorld.y*14.0 - uTime*6.0));
          float flick = 0.92 + 0.08*sin(uTime*28.0);
          vec3 col = mix(uCore, uRim, f) + uRim*f*1.6;
          col *= scan*flick;
          float a = (uAlpha*(0.22 + f*1.1))*scan;
          gl_FragColor = vec4(col, a);
        }`,
    });
    ghostMats.push(m);
    return m;
  }
  function applyGhost(root: THREE.Object3D, rim: number, core: number, power: number, alpha: number) {
    root.traverse((o: any) => { if (o.isMesh) o.material = makeGhostMaterial(rim, core, power, alpha); });
  }
  (scene as any).__ghostMats = ghostMats;

  const ASTRO_URL = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';
  new GLTFLoader().load(
    ASTRO_URL,
    (gltf) => {
      const src = gltf.scene;
      const heroModel = normalizeAstronaut(src.clone(true), 4.6);
      applyGhost(heroModel, 0xaffff2, 0x10323c, 2.2, 0.95);
      hero.add(heroModel);
      farAstros.forEach((grp) => {
        const c = normalizeAstronaut(src.clone(true), 4.6);
        c.scale.multiplyScalar(0.5 + Math.random() * 0.4);
        applyGhost(c, 0x6fe9ff, 0x0a2630, 3.0, 0.6);
        grp.add(c);
      });
    },
    undefined,
    () => {
      const h = buildAstronaut(1.0, false); applyGhost(h, 0xaffff2, 0x10323c, 2.2, 0.95); hero.add(h);
      farAstros.forEach((grp) => {
        const a = buildAstronaut(0.55 + Math.random() * 0.4, true);
        applyGhost(a, 0x6fe9ff, 0x0a2630, 3.0, 0.55);
        grp.add(a);
      });
    }
  );

  // ripple shader
  const RippleShader = {
    uniforms: {
      tDiffuse: { value: null }, uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uAmp: { value: 0 }, uAspect: { value: window.innerWidth / window.innerHeight },
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
      varying vec2 vUv; uniform sampler2D tDiffuse;
      uniform float uTime,uAmp,uAspect; uniform vec2 uMouse;
      void main(){
        vec2 uv=vUv; vec2 d=uv-uMouse; d.x*=uAspect;
        float dist=length(d);
        float wave=sin(dist*42.0 - uTime*9.0);
        float decay=exp(-dist*5.5);
        float amp=wave*decay*uAmp*0.016;
        vec2 dir = dist>0.0001? normalize(d) : vec2(0.0);
        vec2 off = dir*amp; float ca = amp*0.7;
        vec3 c;
        c.r = texture2D(tDiffuse, uv+off+dir*ca).r;
        c.g = texture2D(tDiffuse, uv+off).g;
        c.b = texture2D(tDiffuse, uv+off-dir*ca).b;
        gl_FragColor = vec4(c,1.0);
      }`,
  };

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.35, 0.7, 0.08));
  const ripple = new ShaderPass(RippleShader);
  ripple.renderToScreen = true;
  composer.addPass(ripple);

  let mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5, rippleAmp = 0;
  let speed = 26, targetSpeed = 26;

  window.addEventListener('mousemove', (e) => {
    tmx = e.clientX / window.innerWidth;
    tmy = e.clientY / window.innerHeight;
    rippleAmp = Math.min(rippleAmp + 0.16, 1);
  }, { passive: true });

  window.addEventListener('scroll', () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const p = docH > 0 ? window.scrollY / docH : 0;
    targetSpeed = 22 + p * 70;
  }, { passive: true });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    ripple.uniforms.uAspect.value = window.innerWidth / window.innerHeight;
  });

  const clock = new THREE.Clock();
  clock.start();

  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    mx += (tmx - mx) * 0.06;
    my += (tmy - my) * 0.06;
    speed += (targetSpeed - speed) * 0.04;
    rippleAmp *= 0.94;

    camera.position.z -= speed * dt;
    camera.position.x += ((mx - 0.5) * 7 - camera.position.x) * 0.05;
    camera.position.y += ((0.5 - my) * 5 - camera.position.y) * 0.05;
    camera.lookAt((mx - 0.5) * 6, (0.5 - my) * 4, camera.position.z - 30);
    camera.rotation.z = (mx - 0.5) * 0.07;

    keyLight.position.set(camera.position.x + 4, camera.position.y + 5, camera.position.z - 8);
    rimLight.position.set(camera.position.x - 6, camera.position.y - 3, camera.position.z - 18);

    const camZ = camera.position.z;

    for (let i = 0; i < PILLAR_N; i++) {
      pillars.getMatrixAt(i, tmp.matrix);
      tmp.matrix.decompose(tmp.position, tmp.quaternion, tmp.scale);
      if (tmp.position.z > camZ + SEG_LEN) {
        tmp.position.z -= TUN_LEN;
        tmp.updateMatrix();
        pillars.setMatrixAt(i, tmp.matrix);
      }
    }
    pillars.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < BLOCK_N; i++) {
      const b = blockData[i];
      if (b.z > camZ + 8) b.z -= TUN_LEN;
      const pulse = 0.85 + Math.sin(t * b.ts + b.tw) * 0.15;
      tmp.position.set(b.x, b.y, b.z);
      tmp.rotation.set(b.rx + t * 0.1, b.ry + t * 0.12, 0);
      tmp.scale.set(b.w * pulse, b.h * pulse, 1);
      tmp.updateMatrix();
      blocks.setMatrixAt(i, tmp.matrix);
    }
    blocks.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < 260; i++) {
      const r = rainData[i];
      r.y -= r.spd * dt;
      if (r.y < -16) { r.y = 18; r.z = camZ - Math.random() * TUN_LEN; r.x = (Math.random() - 0.5) * 30; }
      if (r.z > camZ + 8) r.z -= TUN_LEN;
      tmp.position.set(r.x, r.y, r.z);
      tmp.rotation.set(0, 0, 0);
      tmp.scale.set(1, r.len, 1);
      tmp.updateMatrix();
      rain.setMatrixAt(i, tmp.matrix);
    }
    rain.instanceMatrix.needsUpdate = true;

    const snap = Math.round(camZ / 4) * 4;
    floor.position.z = snap; ceil.position.z = snap;

    hero.position.set(Math.sin(t * 0.45) * 3.2 + (mx - 0.5) * 2, Math.cos(t * 0.37) * 1.8 + (0.5 - my) * 1.5, camZ - 26);
    hero.rotation.x = t * 0.32;
    hero.rotation.y = t * 0.24;
    hero.rotation.z = Math.sin(t * 0.3) * 0.4;

    for (const a of farAstros) {
      const u: any = a.userData;
      if (u.z > camZ + 6) u.z -= TUN_LEN;
      a.position.set(u.x + Math.sin(t * u.sp + u.ph) * 4, u.y + Math.cos(t * u.sp * 0.8 + u.ph) * 3, u.z);
      a.rotation.x = t * u.sp * 0.6;
      a.rotation.y = t * u.sp * 0.5;
    }

    for (let i = 0; i < ghostMats.length; i++) ghostMats[i].uniforms.uTime.value = t;

    ripple.uniforms.uTime.value = t;
    ripple.uniforms.uAmp.value = rippleAmp;
    ripple.uniforms.uMouse.value.set(mx, 1 - my);

    composer.render();
  }
  frame();
}
