// Texture
const textureLoader = new THREE.TextureLoader();

var materials = [
  "src/images/iq3.jpg", //right
  "src/images/code.jpeg", //left
  "src/images/01b.jpg", //top
  "src/images/01b.jpg", //bottom 
  "src/images/01b.jpg", //front
  "src/images/01b.jpg", //back
].map(pic => {
return new THREE.MeshLambertMaterial({map: textureLoader.load(pic)});
});

const Textures = textureLoader.load(textureLoader);
// const Textures = textureLoader.load("src/images/01b.jpg");

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
// scene.setClearColor(null)
// renderer.setClearColor( 0x000000, 1); // the default

// Objects
const geometry = new THREE.BoxBufferGeometry(5, 2.5, 2.5);

// Materials

// const material = new THREE.MeshStandardMaterial({
//   color: 0xffffff,
//   transparent: true,
//   // opacity: 0.5
//   }
// );
// material.setClearColor(null);
// material.map = Textures;

// materials
const shape = new THREE.Mesh(geometry, materials);
scene.add(shape);

// Lights
const pointLight = new THREE.PointLight(0xffffff, 4);
pointLight.position.x = 5;
pointLight.position.y = 5;
pointLight.position.z = 5;
scene.add(pointLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 5;
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));

/**
 * Animate
 */

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const vals = [0.42,0.02442,0.024]
  // Update objects
  shape.rotation.y = (vals[0]) * elapsedTime;
  shape.rotation.x = (vals[1]) * elapsedTime;
  shape.rotation.z = (vals[2]) * elapsedTime;

  // console.log(elapsedTime)

  // Update Orbital Controls
  // controls.update()

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();