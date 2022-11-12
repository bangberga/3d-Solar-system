import "./style.css";
import {
  CineonToneMapping,
  DoubleSide,
  Layers,
  Material,
  // GridHelper,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TextureLoader,
  Vector2,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";

const canvas = document.getElementById("bg") as HTMLCanvasElement;

const vertexShader = `
  varying vec2 vUv;

  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`;

const fragmentShader = `
  uniform sampler2D baseTexture;
  uniform sampler2D bloomTexture;

	varying vec2 vUv;

	void main() {
		gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
	}
`;

// Texture
const textureLoader = new TextureLoader();

// Scene
const scene = new Scene();
scene.background = textureLoader.load("/sky.jpg");

// Camera
const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-15, 35, 60);
camera.lookAt(0, 0, 0);

// Material
const darkMaterial = new MeshBasicMaterial({ color: "black" });
const nonBloomedMeshes: Mesh[] = [];
const nonBloomedMeshMaterials = new Map<string, Material>();

// Layer
const BLOOM_LAYER = 1;
const bloomLayer = new Layers();
bloomLayer.set(BLOOM_LAYER);

// Renderer
const renderer = new WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = CineonToneMapping;
renderer.toneMappingExposure = 1.5;

// Composer
const renderPass = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new Vector2(window.innerWidth, window.innerHeight),
  1,
  0.5,
  0.2
);

const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(window.innerWidth, window.innerHeight);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderPass);
bloomComposer.addPass(bloomPass);

const finalPass = new ShaderPass(
  new ShaderMaterial({
    uniforms: {
      baseTexture: { value: null },
      bloomTexture: { value: bloomComposer.renderTarget2.texture },
    },
    vertexShader,
    fragmentShader,
    defines: {},
  }),
  "baseTexture"
);
finalPass.needsSwap = true;

const finalComposer = new EffectComposer(renderer);
finalComposer.setSize(window.innerWidth, window.innerHeight);
finalComposer.addPass(renderPass);
finalComposer.addPass(finalPass);

// Sun
const sun = new Mesh(
  new SphereGeometry(15, 30, 30),
  new MeshBasicMaterial({ map: textureLoader.load("/sun.webp") })
);
const sunLight = new PointLight(0xffffff);
sunLight.castShadow = true;
sun.layers.enable(BLOOM_LAYER);
sun.add(sunLight);
scene.add(sun);

// the Earth
const earth = new Mesh(
  new SphereGeometry(3, 30, 30),
  new MeshStandardMaterial({
    map: textureLoader.load("/earth.webp"),
  })
);
earth.castShadow = true;
earth.receiveShadow = true;
earth.rotateZ(45);
scene.add(earth);

// Moon
const moon = new Mesh(
  new SphereGeometry(1.2, 30, 30),
  new MeshBasicMaterial({
    map: textureLoader.load("/moon.jpg"),
  })
);
moon.layers.enable(BLOOM_LAYER);
const moonLight = new PointLight(0xffffff, 1, 3);
moonLight.castShadow = true;
moon.add(moonLight);
scene.add(moon);

// Saturn
const saturn = new Mesh(
  new SphereGeometry(5, 30, 30),
  new MeshStandardMaterial({ map: textureLoader.load("/saturn.webp") })
);
saturn.castShadow = true;
saturn.receiveShadow = true;
scene.add(saturn);

// Saturn's ring
const saturnBelt = new Mesh(
  new RingGeometry(6, 10, 30, 1),
  new MeshStandardMaterial({
    map: textureLoader.load("/saturn ring.jpg"),
    side: DoubleSide,
  })
);
saturnBelt.castShadow = true;
saturnBelt.receiveShadow = true;
saturnBelt.rotateX(-45);
scene.add(saturnBelt);

// Jupiter
const jupiter = new Mesh(
  new SphereGeometry(7, 30, 30),
  new MeshStandardMaterial({ map: textureLoader.load("/jupiter.jpg") })
);
jupiter.castShadow = true;
jupiter.receiveShadow = true;
scene.add(jupiter);

// Mars
const mars = new Mesh(
  new SphereGeometry(2.5, 30, 30),
  new MeshStandardMaterial({ map: textureLoader.load("/mars.webp") })
);
mars.castShadow = true;
mars.receiveShadow = true;
scene.add(mars);

// Mercury
const mercury = new Mesh(
  new SphereGeometry(1.7, 30, 30),
  new MeshStandardMaterial({ map: textureLoader.load("/mercury.jpg") })
);
mercury.castShadow = true;
mercury.receiveShadow = true;
scene.add(mercury);

// Uranus
const uranus = new Mesh(
  new SphereGeometry(3.5, 30, 30),
  new MeshStandardMaterial({ map: textureLoader.load("/uranus.jpg") })
);
uranus.castShadow = true;
uranus.receiveShadow = true;
scene.add(uranus);

// Neptune
const neptune = new Mesh(
  new SphereGeometry(3.2, 30, 30),
  new MeshStandardMaterial({ map: textureLoader.load("/neptune.jpg") })
);
neptune.castShadow = true;
neptune.receiveShadow = true;
scene.add(neptune);

// Get non bloomed meshes
scene.traverse((obj) => {
  if (obj instanceof Mesh && !bloomLayer.test(obj.layers)) {
    nonBloomedMeshes.push(obj);
    nonBloomedMeshMaterials.set(obj.uuid, obj.material);
  }
});

// stars
function addStars() {
  const star = new Mesh(
    new SphereGeometry(0.2, 24, 24),
    new MeshBasicMaterial({ color: 0xffffff })
  );
  const [x, y, z] = Array(3)
    .fill(0)
    .map(() => MathUtils.randFloatSpread(200));
  star.layers.enable(1);
  star.position.set(x, y, z);
  scene.add(star);
}
for (let i = 0; i < 400; i++) {
  addStars();
}

// Helper
// scene.add(new GridHelper(200, 50));

// Control
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 1;
controls.maxDistance = 150;

// Animate
function makeMove(
  type: "sin" | "cos",
  speed: number = 0.004,
  start: number = 0
) {
  let deg = start;
  return () => {
    deg += speed;
    return Math[type](deg);
  };
}
const moveEarthX = makeMove("sin");
const moveEarthY = makeMove("sin");
const moveEarthZ = makeMove("cos");
const moveMoonX = makeMove("sin", 0.015);
const moveMoonY = makeMove("sin", 0.015);
const moveMoonZ = makeMove("cos", 0.015);
const moveSaturnX = makeMove("sin", undefined, 90);
const moveSaturnY = makeMove("sin");
const moveSaturnZ = makeMove("cos");
const moveJupiterX = makeMove("sin", undefined, 90);
const moveJupiterY = makeMove("sin");
const moveJupiterZ = makeMove("cos");
const moveMarsX = makeMove("sin", 0.005);
const moveMarsY = makeMove("sin", 0.005);
const moveMarsZ = makeMove("cos", 0.005);
const moveMercuryX = makeMove("sin", 0.01);
const moveMercuryY = makeMove("sin", 0.01);
const moveMercuryZ = makeMove("cos", 0.01);
const moveUranusX = makeMove("sin");
const moveUranusY = makeMove("sin");
const moveUranusZ = makeMove("cos");
const moveNeptuneX = makeMove("sin");
const moveNeptuneY = makeMove("sin");
const moveNeptuneZ = makeMove("cos");

(function animate() {
  requestAnimationFrame(animate);
  for (const mesh of nonBloomedMeshes) {
    mesh.material = darkMaterial;
  }
  sun.rotation.y += 0.001;
  earth.rotation.y += 0.01;
  moon.rotation.y += 0.02;
  saturn.rotation.y += 0.01;
  jupiter.rotation.y += 0.03;
  mars.rotation.y += 0.015;
  mercury.rotation.y += 0.015;
  uranus.rotation.y += 0.015;
  neptune.position.y += 0.01;
  const earthX = -35 * moveEarthX();
  const earthY = 20 * moveEarthY();
  const earthZ = -30 * moveEarthZ();
  earth.position.set(earthX, earthY, earthZ);
  const moonX = 5 * moveMoonX();
  const moonY = 5 * moveMoonY();
  const moonZ = -5 * moveMoonZ();
  moon.position.set(earthX + moonX, earthY + moonY, earthZ + moonZ);
  const saturnX = -50 * moveSaturnX();
  const saturnY = -40 * moveSaturnY();
  const saturnZ = 30 * moveSaturnZ();
  saturn.position.set(saturnX, saturnY, saturnZ);
  saturnBelt.position.set(saturnX, saturnY, saturnZ);
  jupiter.position.set(
    60 * moveJupiterX(),
    50 * moveJupiterY(),
    40 * moveJupiterZ()
  );
  mars.position.set(-42 * moveMarsX(), 27 * moveMarsY(), -37 * moveMarsZ());
  mercury.position.set(
    25 * moveMercuryX(),
    10 * moveMercuryY(),
    -20 * moveMercuryZ()
  );
  uranus.position.set(
    -70 * moveUranusX(),
    60 * moveUranusY(),
    50 * moveUranusZ()
  );
  neptune.position.set(
    80 * moveNeptuneX(),
    70 * moveNeptuneY(),
    -60 * moveNeptuneZ()
  );

  bloomComposer.render();
  for (const mesh of nonBloomedMeshes) {
    mesh.material = nonBloomedMeshMaterials.get(mesh.uuid) as Material;
  }
  finalComposer.render();
})();

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  bloomComposer.setSize(width, height);
  finalComposer.setSize(width, height);
});
