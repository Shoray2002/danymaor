import * as THREE from "three";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/FBXLoader.js";
// importing the threejs library from the node_modules folder
// importing the OrbitControls that allows the camera to move around the scene using the mouse
// importing the FBXLoader which is used to load the FBX model file

const scale_add = document.getElementById("scale-add");
const scale_sub = document.getElementById("scale-sub");
const rotate_left = document.getElementById("rotate-left");
const rotate_right = document.getElementById("rotate-right");
let camera, scene, renderer, controls, selected; //basic variables
let objects = [];
let pointer = new THREE.Vector2();
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
  const texture = textureLoader.load("./assets/texture.png");

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
    object.position.set(0, 0, 0);
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
    object.position.set(200, 0, 0);
    // objects.push(object);
    scene.add(object);
  });

  console.log(objects);

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

  // adding the event listeners
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("mousemove", onMouseMove);
}

scale_add.addEventListener("click", function () {
  if (
    selected &&
    selected.scale.x <= 2.0 &&
    selected.scale.y <= 2.0 &&
    selected.scale.z <= 2.0
  ) {
    selected.scale.x += 0.1;
    selected.scale.y += 0.1;
    selected.scale.z += 0.1;
    console.log(selected.scale);
  }
});

scale_sub.addEventListener("click", function () {
  if (
    selected &&
    selected.scale.x > 0.101 &&
    selected.scale.y > 0.101 &&
    selected.scale.z > 0.101
  ) {
    selected.scale.x -= 0.1;
    selected.scale.y -= 0.1;
    selected.scale.z -= 0.1;
  }
});

rotate_left.addEventListener("click", function () {
  if (selected) {
    selected.rotation.y += 0.1;
  }
});
rotate_right.addEventListener("click", function () {
  if (selected) {
    selected.rotation.y -= 0.1;
  }
});

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
        // console.log(selected.material.color);
        selected.material.color.set(0x8fd3fe);
        objects.forEach((object) => {
          if (object !== selected && object.name !== "ground") {
            object.material.color.set(cloneColor);
          }
        });
      }
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

function onMouseMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// function to animate the scene
function animate() {
  // move the camera if any of the movement keys are pressed
  if (moveForward) {
    camera.translateY(1);
  }
  if (moveBackward) {
    camera.translateY(-1);
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
