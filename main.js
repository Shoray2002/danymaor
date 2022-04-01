import * as THREE from "three";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/TransformControls.js";
import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/FBXLoader.js";

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
  ground;
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
  rollOverGeo.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 20, 0));
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
      side: THREE.DoubleSide,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = "ground";
  objects.push(ground);
  scene.add(ground);

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
  document.addEventListener("click", onDocumentMouseDown);
  document.addEventListener("keydown", onDocumentKeyDown);
  document.addEventListener("keyup", onDocumentKeyUp);
  document.addEventListener("mousemove", onDocumentMouseMove);
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
    const intersect = intersects[0];
    rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
    rollOverMesh.position
      .divideScalar(2)
      .floor()
      .multiplyScalar(2)
      .addScalar(-15);
  }
  renderer.render(scene, camera);
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
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
