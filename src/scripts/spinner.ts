import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { loadOriginalEnvironment } from "./environment";

let restarts = 0;

export async function mountSpinner(host: HTMLElement) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  // Capped at 2x: a 3x phone would otherwise render 9x the pixels of 1x every frame for no visible gain.
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0xf7f6f3, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf7f6f3);
  const camera = new THREE.PerspectiveCamera(THREE.MathUtils.radToDeg(0.6), 1, 0.01, 200);
  camera.position.set(0, 0.3, 5.5);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = false;
  controls.minPolarAngle = Math.PI / 2;
  controls.maxPolarAngle = Math.PI / 2;
  let environment: THREE.WebGLRenderTarget | undefined;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x666666, .7));
  const light = new THREE.DirectionalLight(0xffffff, .5);
  light.position.set(0, 5, 0);
  const front = new THREE.DirectionalLight(0xffffff, .5);
  front.position.set(0, 0, 5);
  scene.add(light, front);
  let disposed = false;
  let model: THREE.Object3D | undefined;
  const orbitAxis = new THREE.Vector3(0, 1, 0);
  const orbitOffset = new THREE.Vector3();
  let visible = false;
  let frame = 0;
  let last = 0;
  const render = () => {
    if (!disposed && model) renderer.render(scene, camera);
  };
  const shouldAnimate = () =>
    visible &&
    !document.hidden &&
    !reduced.matches &&
    !!model &&
    !disposed;
  const onControlsChange = () => { if (!shouldAnimate()) render(); };
  const tick = (time: number) => {
    frame = 0;
    if (!shouldAnimate()) return;
    // Match production's 0.05 radians/frame at 60Hz, independent of refresh rate.
    // Orbit the camera, as Babylon did, so lighting stays fixed with the model.
    if (last) {
      const delta = Math.min((time - last) / 1000, 0.1);
      orbitOffset.copy(camera.position).sub(controls.target).applyAxisAngle(orbitAxis, -3 * delta);
      camera.position.copy(controls.target).add(orbitOffset);
      controls.update();
    }
    last = time;
    render();
    frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    controls.enabled = !reduced.matches;
    if (shouldAnimate()) frame = requestAnimationFrame(tick);
    else if (visible && !document.hidden) render();
  };
  const resize = () => {
    const width = host.clientWidth,
      height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const mobile = window.innerWidth <= 768;
    if (model) model.position.y = mobile ? -8 : -5;
    orbitOffset.copy(camera.position).sub(controls.target).normalize().multiplyScalar(mobile ? 33 : 22);
    camera.position.copy(controls.target).add(orbitOffset);
    camera.updateProjectionMatrix();
    controls.update();
    render();
  };
  const resizeObserver = new ResizeObserver(resize);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  // A lost context can't be reused once disposed, so start over on a fresh one (at most twice, in case the GPU keeps failing).
  const lost = () => {
    cleanup();
    if (restarts++ < 2) mountSpinner(host).catch(() => host.setAttribute("aria-label", "A little something to celebrate."));
  };
  const disposeModel = (object: THREE.Object3D) =>
    object.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      node.geometry.dispose();
      const materials = Array.isArray(node.material)
        ? node.material
        : [node.material];
      materials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value instanceof THREE.Texture) value.dispose();
        });
        material.dispose();
      });
    });
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    resizeObserver.disconnect();
    document.removeEventListener("visibilitychange", sync);
    reduced.removeEventListener("change", sync);
    window.removeEventListener("pagehide", onPageHide);
    controls.removeEventListener("change", onControlsChange);
    controls.dispose();
    renderer.domElement.removeEventListener("webglcontextlost", lost);
    if (model) disposeModel(model);
    environment?.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    delete host.dataset.ready;
  };
  const onPageHide = (event: PageTransitionEvent) => {
    if (!event.persisted) cleanup();
  };
  window.addEventListener("pagehide", onPageHide);
  try {
    // Fetch the environment and the model together; neither needs the other.
    const [environmentResult, gltfResult] = await Promise.allSettled([
      loadOriginalEnvironment(renderer),
      new GLTFLoader().loadAsync("/3d/champagne-9.glb"),
    ]);
    if (environmentResult.status === "fulfilled") environment = environmentResult.value;
    if (disposed || environmentResult.status === "rejected" || gltfResult.status === "rejected") {
      if (gltfResult.status === "fulfilled") disposeModel(gltfResult.value.scene);
      // cleanup() already ran before the environment existed, so release it here.
      if (disposed) { environment?.dispose(); return; }
      throw environmentResult.status === "rejected" ? environmentResult.reason : (gltfResult as PromiseRejectedResult).reason;
    }
    scene.environment = environmentResult.value.texture;
    scene.environmentIntensity = 1;
    host.dataset.environment = 'sanGiuseppeBridge';
    const gltf = gltfResult.value;
    // Keep production units and camera framing rather than normalizing the whole model.
    model = gltf.scene;
    model.scale.setScalar(40);
    model.updateMatrixWorld(true);
    const bucket = model.getObjectByName('Ice_bucket01');
    if (!bucket) throw new Error('Ice bucket missing from model');
    const bounds = new THREE.Box3().setFromObject(bucket);
    controls.target.set((bounds.min.x + bounds.max.x) / 2, bounds.min.y, (bounds.min.z + bounds.max.z) / 2);
    camera.position.copy(controls.target).add(new THREE.Vector3(22, 0, 0));
    const anisotropy = renderer.capabilities.getMaxAnisotropy();
    model.traverse(node => {
      if (!(node instanceof THREE.Mesh)) return;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      for (const material of materials) {
        for (const value of Object.values(material)) {
          if (value instanceof THREE.Texture) value.anisotropy = anisotropy;
        }
        if (material instanceof THREE.MeshPhysicalMaterial && material.name === 'glass') {
          // Three r167's transmission buffer omits other transmissive surfaces.
          // The wine inside is transmissive too: use the model's original alpha
          // for the thin outer glass, retaining its reflections without hiding the wine.
          material.transmission = 0;
          material.opacity = 0.2;
          material.transparent = true;
          material.depthWrite = false;
          material.needsUpdate = true;
        }
      }
    });
    scene.add(model);
    host.append(renderer.domElement);
    host.dataset.ready = "";
    renderer.domElement.setAttribute("aria-hidden", "true");
    controls.addEventListener("change", onControlsChange);
    renderer.domElement.addEventListener("webglcontextlost", lost);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    resizeObserver.observe(host);
    observer.observe(host);
    resize();
    sync();
  } catch (error) {
    cleanup();
    throw error;
  }
}
