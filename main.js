import * as THREE from "three";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/TransformControls.js";
import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/FBXLoader.js";
// importing the threejs library from the node_modules folder
// importing the OrbitControls that allows the camera to move around the scene using the mouse
// importing the FBXLoader which is used to load the FBX model file

const scale = document.getElementById("scale");
const rotate = document.getElementById("rotate");
const translate = document.getElementById("translate");
let camera, scene, renderer, controls, selected, transform; //basic variables
let objects = [];
let pointer = new THREE.Vector2();
// variables to keep track of the movement of the camera
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

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
    new THREE.PlaneGeometry(4000, 4000),
    new THREE.MeshPhongMaterial({
      color: 0x6d9ec8,
    })
  );

  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  mesh.name = "ground";
  objects.push(mesh);
  scene.add(mesh);

  // loading the FBX model and texture
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load("./assets/apartment.png");

  const model = new FBXLoader();
  model.load("./assets/apartment.fbx", function (object) {
    // modifying the FBX model
    object.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
        child.castShadow = true; // cast shadow
        child.receiveShadow = true; // receive shadow
        child.material.map = texture; // setting the texture onto the model
        child.material.needsUpdate = true; // updating the material
        // make the texture visible from both sides of the model surface
        // child.material.side = THREE.DoubleSide;
      }
    });
    // increasing the size of the model
    object.name = "apartment";
    object.scale.set(20, 20, 20);
    object.position.set(-100, 0, 0);
    // objects.push(object);
    scene.add(object);
  });
  model.load("./assets/apartment.fbx", function (object) {
    // modifying the FBX model
    object.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
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
    object.position.set(100, 0, 0);
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
  controls.update();

  transform = new TransformControls(camera, renderer.domElement);
  transform.addEventListener("dragging-changed", function (event) {
    controls.enabled = !event.value;
  });
  scene.add(transform);
  // adding the event listeners
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("keydown", onXDown);
  window.addEventListener("mousemove", onMouseMove);
}

scale.addEventListener("click", function () {
  if (selected) {
    transform.setMode("scale");
  }
});
translate.addEventListener("click", function () {
  if (selected) {
    transform.setMode("translate");
  }
});
rotate.addEventListener("click", function () {
  if (selected) {
    transform.setMode("rotate");
  }
});

// function to resize the scene
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// function when a key is pressed
function onXDown(event) {
  switch (event.keyCode) {
    // x
    case 88:
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      mouse.x = pointer.x;
      mouse.y = pointer.y;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(objects);
      if (intersects.length > 1) {
        console.log(intersects[0].object.name);
        selected = intersects[0].object;
        let cloneColor = selected.material.color.clone();
        selected.material.color.set(0x8fd3fe);
        objects.forEach((object) => {
          if (object !== selected && object.name !== "ground") {
            object.material.color.set(cloneColor);
            transform.attach(selected);
            transform.setMode("translate");
          }
        });
      }
      break;
  }
}

function onMouseMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// function to animate the scene
function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}
