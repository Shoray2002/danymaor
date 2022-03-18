import * as THREE from "three";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/FBXLoader.js";

const scale_add = document.getElementById("scale-add");
const scale_sub = document.getElementById("scale-sub");

scale_add.addEventListener("click", function () {
  console.log("add");
});

scale_sub.addEventListener("click", function () {
  console.log("sub");
});

// importing the threejs library from the node_modules folder
// importing the OrbitControls that allows the camera to move around the scene using the mouse
// importing the FBXLoader which is used to load the FBX model file

let camera, scene, renderer, controls, objects; //basic variables
// variables to keep track of the movement of the camera
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

// function calls
init();
animate();

// function to initialize the scene
function init() {
  // creating a new div in the html file to display the scene
  const container = document.createElement("div");
  document.body.appendChild(container);

  // initializing the camera
  // https://threejs.org/docs/?q=camera#api/en/cameras/PerspectiveCamera
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(-80, 100, 200);

  // initializing the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x6d9ec8);

  // setting the lights

  // https://threejs.org/docs/?q=hemis#api/en/lights/HemisphereLight
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 200, 0);
  scene.add(hemiLight);

  // https://threejs.org/docs/?q=dire#api/en/lights/DirectionalLight
  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(0, 200, 100);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 180;
  dirLight.shadow.camera.bottom = -100;
  dirLight.shadow.camera.left = -120;
  dirLight.shadow.camera.right = 120;
  scene.add(dirLight);

  // initializing the ground
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshPhongMaterial({
      color: 0x6d9ec8,
      side: THREE.DoubleSide,
    })
  );

  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);

  // loading the FBX model and texture
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load("./assets/texture.png");

  const model = new FBXLoader();
  model.load("./assets/apartment.fbx", function (object) {
    // modifying the FBX model
    object.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true; // cast shadow
        child.receiveShadow = true; // receive shadow
        child.material.map = texture; // setting the texture onto the model
        child.material.needsUpdate = true; // updating the material
        // make the texture visible from both sides of the model surface
        // child.material.side = THREE.DoubleSide;
      }
    });
    // increasing the size of the model
    object.scale.set(20, 20, 20);
    object.position.set(0, 0, 0);
    scene.add(object);
  });

  // initializing the renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // initializing the controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableZoom = false; // disabling the zoom controls
  controls.update();

  // adding the event listeners
  window.addEventListener("resize", onWindowResize, false);
  window.addEventListener("keydown", onKeyDown, false);
  window.addEventListener("keyup", onKeyUp, false);
}

// function to resize the scene
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

// function when a key is pressed
function onKeyDown(event) {
  switch (event.keyCode) {
    case 38: // up
    case 87: // w
      moveForward = true;
      break;
    case 37: // left
    case 65: // a
      moveLeft = true;
      break;
    case 40: // down
    case 83: // s
      moveBackward = true;
      break;
    case 39: // right
    case 68: // d
      moveRight = true;
      break;
  }
}

// function when a key is released
function onKeyUp(event) {
  switch (event.keyCode) {
    case 38: // up
    case 87: // w
      moveForward = false;
      break;
    case 37: // left
    case 65: // a
      moveLeft = false;
      break;
    case 40: // down
    case 83: // s
      moveBackward = false;
      break;
    case 39: // right
    case 68: // d
      moveRight = false;
      break;
  }
}

// function to animate the scene
function animate() {
  // move the camera if any of the movement keys are pressed
  if (moveForward) {
    camera.translateZ(-1);
  }
  if (moveBackward) {
    camera.translateZ(1);
  }
  if (moveLeft) {
    camera.translateX(-1);
  }
  if (moveRight) {
    camera.translateX(1);
  }
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}
