import * as THREE from "three";
import TWEEN from "https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.5.0/dist/tween.esm.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/TransformControls.js";
import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/FBXLoader.js";
import { TOP, BOTTOM, FRONT, BACK, LEFT, RIGHT } from "./orientations.js";
const scale = document.getElementById("scale");
const rotate = document.getElementById("rotate");
const translate = document.getElementById("translate");
const delete_object = document.getElementById("delete");
const log = document.getElementById("log");
const snap = document.getElementById("snap");
const apartment = document.getElementById("apartment");
const officeOctagon = document.getElementById("officeOctagon");
const officeLarge = document.getElementById("officeLarge");
const shop = document.getElementById("shop");
let camera,
  scene,
  renderer,
  controls,
  selected,
  transform,
  dropSelected,
  ground,
  base;
let rollOverMesh, rollOverMaterial;

let objects = [];
let models = {
  apartment: ["./assets/apartment.fbx", "apartment", 1, [20, 20, 20]],
  officeOctagon: [
    "./assets/OfficeOctagon_Base.fbx",
    "officeOctagon",
    1,
    [8, 8, 8],
  ],
  officeLarge: ["./assets/OfficeOld_Large.fbx", "officeLarge", 1, [8, 8, 8]],
  shop: ["./assets/SM_Bld_Shop_01.fbx", "shop", 1, [18, 18, 18]],
};
let pointer = new THREE.Vector2();
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
let snap_val = 0.1;
let curr_choice = "apartment";
const model = new FBXLoader();
const texture = new THREE.TextureLoader().load("./assets/texture.png");

init();
animate();

function init() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    100000
  );
  camera.position.set(-80, 100, 200);

  // initializing the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x71b1fe);

  const rollOverGeo = new THREE.PlaneGeometry(50, 50);
  rollOverGeo.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  rollOverGeo.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 10, 0));
  rollOverMaterial = new THREE.MeshBasicMaterial({
    color: 0x1ed760,
  });
  rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
  rollOverMesh.visible = false;
  scene.add(rollOverMesh);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 200, 0);
  hemiLight.name = "hemiLight";
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.intensity = 0.8;
  dirLight.position.set(0, 200, 100);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 1000;
  dirLight.shadow.camera.bottom = -1000;
  dirLight.shadow.camera.left = -1000;
  dirLight.shadow.camera.right = 1000;
  dirLight.name = "dirLight";
  dirLight.shadow.mapSize.width = 1024 * 2;
  dirLight.shadow.mapSize.height = 1024 * 2;
  scene.add(dirLight);

  ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    new THREE.MeshPhongMaterial({
      color: 0x6d9ec8,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = "ground";
  objects.push(ground);
  scene.add(ground);

  base = new THREE.Mesh(
    new THREE.BoxGeometry(1000, 1000, 2),
    new THREE.MeshPhongMaterial({
      color: 0x6d9ec8,
    })
  );
  base.rotation.x = -Math.PI / 2;
  base.name = "base";
  base.translateZ(-2);
  scene.add(base);
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
  transform = new TransformControls(camera, renderer.domElement);
  transform.addEventListener("dragging-changed", function (event) {
    controls.enabled = !event.value;
  });
  transform.name = "transform";
  scene.add(transform);

  window.addEventListener("resize", onWindowResize);
  document.addEventListener("mousemove", onDocumentMouseMove);
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
    selected = null;
  }
});
snap.addEventListener("change", function () {
  snap_val = parseFloat(snap.value);
  if (!snap_val) {
    snap_val = 0.1;
  }
  console.log(snap_val);
  transform.setTranslationSnap(snap_val);
  transform.setRotationSnap((snap_val * Math.PI) / 1.8);
  transform.setScaleSnap(snap_val);
  transform.update();
});
log.addEventListener("click", function () {
  let temp = [];
  for (var i = 0; i < scene.children.length; i++) {
    temp.push(scene.children[i].name);
  }
  console.log(temp);
});
function addModel() {
  let choice = models[curr_choice];
  model.load(choice[0], function (object) {
    object.traverse(function (child) {
      if (child.isMesh) {
        objects.push(child);
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.map = texture;
        child.material.transparent = true;
        child.material.opacity = 0.8;
        child.material.needsUpdate = true;
      }
    });

    object.name = choice[1] + "_" + choice[2];
    choice[2]++;
    console.log("Added:" + object.name);
    object.scale.set(choice[3][0], choice[3][1], choice[3][2]);
    object.position.set(pointer.x, 0, pointer.y);
    dropSelected = object;
    scene.add(object);
    // disable img buttons
    apartment.disabled = true;
    shop.disabled = true;
    officeOctagon.disabled = true;
    officeLarge.disabled = true;
  });
}
apartment.addEventListener("click", function () {
  curr_choice = "apartment";
  addModel();
});
officeOctagon.addEventListener("click", function () {
  curr_choice = "officeOctagon";
  addModel();
});
officeLarge.addEventListener("click", function () {
  curr_choice = "officeLarge";
  addModel();
});
shop.addEventListener("click", function () {
  curr_choice = "shop";
  addModel();
});

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
  const raycaster = new THREE.Raycaster();
  event.preventDefault();
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(objects, false);
  if (intersects.length > 0) {
    const intersect = intersects[intersects.length - 1];
    rollOverMesh.position.set(intersect.point.x, 0, intersect.point.z);
    rollOverMesh.position.divideScalar(2).floor().multiplyScalar(2);
    rollOverMesh.position.x -= 15;
    rollOverMesh.position.z += 15;
  }
}

function onDocumentMouseDown(event) {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(objects);
  if (intersects.length > 1) {
    console.log(intersects[0].object.parent.name);
    if (intersects[0].object.parent.name) {
      selected = intersects[0].object;
    }
    selected.material.color.set(0x8fd3fe);
    objects.forEach((object) => {
      if (object !== selected && object.name !== "ground") {
        object.material.color.set(0xffffff);
      } else {
        transform.attach(selected);
      }
    });
  }
  if (dropSelected) {
    dropSelected.traverse(function (child) {
      if (child.isMesh) {
        child.material.opacity = 1;
      }
    });
    dropSelected.position.set(
      rollOverMesh.position.x,
      0,
      rollOverMesh.position.z
    );
    apartment.disabled = false;
    shop.disabled = false;
    officeOctagon.disabled = false;
    officeLarge.disabled = false;
    dropSelected = null;
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

  if (dropSelected) {
    dropSelected.position.set(
      rollOverMesh.position.x,
      0,
      rollOverMesh.position.z
    );
  }
  TWEEN.update();
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// view Cube

var cube = document.querySelector(".cube");
const top = document.getElementById("top");
const bottom = document.getElementById("bottom");
const left = document.getElementById("left");
const right = document.getElementById("right");
const front = document.getElementById("front");
const back = document.getElementById("back");
var mat = new THREE.Matrix4();

const tweenCamera = (orientation) => {
  const { offsetFactor, axisAngle } = orientation;
  const offsetUnit = camera.position.length();
  const offset = new THREE.Vector3(
    offsetUnit * offsetFactor.x,
    offsetUnit * offsetFactor.y,
    offsetUnit * offsetFactor.z
  );

  const center = new THREE.Vector3();
  const finishPosition = center.add(offset);

  const positionTween = new TWEEN.Tween(camera.position)
    .to(finishPosition, 300)
    .easing(TWEEN.Easing.Circular.Out);

  const euler = new THREE.Euler(axisAngle.x, axisAngle.y, axisAngle.z);

  // rotate camera too!
  const finishQuaternion = new THREE.Quaternion()
    .copy(camera.quaternion)
    .setFromEuler(euler);
  const quaternionTween = new TWEEN.Tween(camera.quaternion)
    .to(finishQuaternion, 300)
    .easing(TWEEN.Easing.Circular.Out);

  quaternionTween.start();
  positionTween.start();
  renderer.render(scene, camera);
};

top.addEventListener("click", function () {
  tweenCamera(TOP);
});
bottom.addEventListener("click", function () {
  tweenCamera(BOTTOM);
});
right.addEventListener("click", function () {
  tweenCamera(RIGHT);
});
left.addEventListener("click", function () {
  tweenCamera(LEFT);
});
front.addEventListener("click", function () {
  tweenCamera(FRONT);
});
back.addEventListener("click", function () {
  tweenCamera(BACK);
});

renderer.setAnimationLoop(() => {
  mat.extractRotation(camera.matrixWorldInverse);

  cube.style.transform = `translateZ(-300px) ${getCameraCSSMatrix(mat)}`;

  renderer.render(scene, camera);
});

function getCameraCSSMatrix(matrix) {
  var elements = matrix.elements;

  return (
    "matrix3d(" +
    epsilon(elements[0]) +
    "," +
    epsilon(-elements[1]) +
    "," +
    epsilon(elements[2]) +
    "," +
    epsilon(elements[3]) +
    "," +
    epsilon(elements[4]) +
    "," +
    epsilon(-elements[5]) +
    "," +
    epsilon(elements[6]) +
    "," +
    epsilon(elements[7]) +
    "," +
    epsilon(elements[8]) +
    "," +
    epsilon(-elements[9]) +
    "," +
    epsilon(elements[10]) +
    "," +
    epsilon(elements[11]) +
    "," +
    epsilon(elements[12]) +
    "," +
    epsilon(-elements[13]) +
    "," +
    epsilon(elements[14]) +
    "," +
    epsilon(elements[15]) +
    ")"
  );
}

function epsilon(value) {
  return Math.abs(value) < 1e-10 ? 0 : value;
}
