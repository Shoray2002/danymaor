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
const delete_object = document.getElementById("delete");
const log = document.getElementById("log");
let camera, scene, renderer, controls, selected, transform; //basic variables
let objects = [];
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
  hemiLight.name = "hemiLight";
  scene.add(hemiLight);

  // https://threejs.org/docs/?q=dire#api/en/lights/DirectionalLight
  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(0, 200, 100);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 180;
  dirLight.shadow.camera.bottom = -100;
  dirLight.shadow.camera.left = -120;
  dirLight.shadow.camera.right = 120;
  dirLight.name = "dirLight";
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
    object.name = "apartment2";
    object.scale.set(20, 20, 20);
    object.position.set(100, 0, 0);
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
    object.name = "apartment3";
    object.scale.set(20, 20, 20);
    object.position.set(100, 0, 200);
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
  transform.name = "transform";
  scene.add(transform);
  // adding the event listeners
  window.addEventListener("resize", onWindowResize);
  document.addEventListener("click", onDocumentMouseDown);
  document.addEventListener("keydown", onDocumentKeyDown);
  document.addEventListener("keyup", onDocumentKeyUp);
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
delete_object.addEventListener("click", function () {
  if (selected) {
    console.log("Deleted : " + selected.parent.name);
    var selectedObject = scene.getObjectByName(selected.parent.name);
    scene.remove(selectedObject);
    objects.forEach((object) => {
      if (object.parent.name == selected.parent.name) {
        objects.splice(objects.indexOf(object), 1);
      }
    });
    transform.detach(selected);
  }
});

log.addEventListener("click", function () {
  let temp = [];
  for (var i = 0; i < scene.children.length; i++) {
    temp.push(scene.children[i].name);
  }
  console.log(temp);
});

// function to resize the scene
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseDown(event) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(objects);
  if (intersects.length > 1) {
    console.log(intersects[0].object.parent.name);
    selected = intersects[0].object;
    selected.material.color.set(0x8fd3fe);
    transform.attach(selected);
    objects.forEach((object) => {
      if (object !== selected && object.name !== "ground") {
        object.material.color.set(0xffffff);
      }
    });
  }
}

function onDocumentKeyDown(event) {
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
    // e
    case 69:
      moveUp = true;
      break;
    // q
    case 81:
      moveDown = true;
      break;
    // esc
    case 27:
      transform.detach(selected);
      selected.material.color.set(0xffffff);
      selected = null;
  }
}

function onDocumentKeyUp(event) {
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
    // e
    case 69:
      moveUp = false;
      break;
    // q
    case 81:
      moveDown = false;
      break;
  }
}

// function to animate the scene
function animate() {
  if (selected) {
    if (moveForward) {
      selected.translateZ(-0.1);
    }
    if (moveBackward) {
      selected.translateZ(0.1);
    }
    if (moveLeft) {
      selected.translateX(-0.1);
    }
    if (moveRight) {
      selected.translateX(0.1);
    }
    if (moveUp) {
      selected.translateY(0.1);
    }
    if (moveDown) {
      selected.translateY(-0.1);
    }
  } else {
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
    if (moveUp) {
      camera.translateY(1);
    }
    if (moveDown) {
      camera.translateY(-1);
    }
  }
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
