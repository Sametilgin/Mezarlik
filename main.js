// 📦 Three.js ve Eklentiler
import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/PointerLockControls.js';

// 🎯 Sahne Kurulumu
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Güzel bir açık mavi

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-8, 2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById('container3D').appendChild(renderer.domElement);


// 💡 Işıklar
scene.add(new THREE.AmbientLight(0x404040));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(10, 10, 10);
dirLight.castShadow = true;
scene.add(dirLight);

// 🟫 Zemin
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0x228B22 })


);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// 🕹️ Kontroller
const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(controls.getObject());

const move = { forward: false, backward: false, left: false, right: false };
const velocity = new THREE.Vector3();

// 🎯 Mezarlar
const tombstones = {};
const mezarBilgileri = {
  mezar1: { isim: 'Ahmet Yılmaz', dogum: 1950, olum: 2020, mezarlik: 'A Blok' },
  mezar2: { isim: 'Ayşe Demir', dogum: 1945, olum: 2015, mezarlik: 'B Blok' },
  mezar3: { isim: 'Mehmet Can', dogum: 1970, olum: 2021, mezarlik: 'C Blok' },
  mezar4: { isim: 'Fatma Kaya', dogum: 1960, olum: 2018, mezarlik: 'D Blok' }
};

const mezarPozisyonlari = [
  { x: 3, y: 0.5, z: -5 },
  { x: -5, y: 0.5, z: 2 },
  { x: 10, y: 0.5, z: -3 },
  { x: -7, y: 0.5, z: -7 }
];

mezarPozisyonlari.forEach((pos, i) => {
  const tomb = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.8, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x228B22 })

  );
  tomb.name = `mezar${i + 1}`;
  tomb.position.set(pos.x, pos.y, pos.z);
  tomb.rotation.y = Math.PI / 2;
  tomb.castShadow = true;
  scene.add(tomb);
  tombstones[tomb.name] = tomb;
});

// 🗿 GLTF Model Yükleme
const loader = new GLTFLoader();
loader.load('mezarlik.glb',
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.2, 0.2, 0.2);
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 1, metalness: 0 });
      }
    });
    
    model.position.set(0, 0, 0);
    scene.add(model);
  },
  undefined,
  (error) => console.error('GLB yüklenirken hata oluştu:', error)
);




// 🎯 Arama ve Oklar
let currentArrow = null;
let arrowOriginalY = 0;
let targetTomb = null;
let showDirectionArrow = false;

function createArrow(target) {
  if (currentArrow) scene.remove(currentArrow);
  const dir = new THREE.Vector3(0, -1, 0);
  const origin = target.position.clone().add(new THREE.Vector3(0, 2, 0));
  currentArrow = new THREE.ArrowHelper(dir, origin, 1, 0xff0000);
  scene.add(currentArrow);
  arrowOriginalY = origin.y;
}

function createDirectionArrow(target) {
  targetTomb = target;
  showDirectionArrow = true;
  
  const hudArrow = document.getElementById('directionArrowHUD');
  hudArrow.style.display = 'block';
  hudArrow.style.position = 'absolute';
  hudArrow.style.width = '30px';
  hudArrow.style.height = '30px';
}


function showInfo(mezarAd) {
  const info = mezarBilgileri[mezarAd];
  if (info) {
    document.getElementById('infoContent').innerHTML = `
      <strong>İsim:</strong> ${info.isim}<br>
      <strong>Doğum:</strong> ${info.dogum}<br>
      <strong>Ölüm:</strong> ${info.olum}<br>
      <strong>Mezarlık:</strong> ${info.mezarlik}
    `;
    document.getElementById('infoBox').classList.add('visible');
  }
}

function searchTomb() {
  const searchInput = document.getElementById('searchName').value.trim().toLowerCase();
  const foundTomb = Object.entries(mezarBilgileri)
    .find(([_, info]) => info.isim.toLowerCase() === searchInput)?.[0];

  if (foundTomb && tombstones[foundTomb]) {
    createArrow(tombstones[foundTomb]);
    createDirectionArrow(tombstones[foundTomb]);
    showInfo(foundTomb);
  } else {
    alert('Böyle bir kişi bulunamadı!');
    showDirectionArrow = false;
    document.getElementById('directionArrowHUD').style.display = 'none';
  }
}

document.getElementById('searchButton').addEventListener('click', searchTomb);
document.getElementById('closeInfoBox').addEventListener('click', () => {
  document.getElementById('infoBox').classList.remove('visible');
  document.getElementById('directionArrowHUD').style.display = 'none';
  showDirectionArrow = false;
});

// 🎮 Kontrol Tuşları
document.addEventListener('keydown', (e) => {
  if (e.code === 'KeyW') move.forward = true;
  if (e.code === 'KeyS') move.backward = true;
  if (e.code === 'KeyA') move.left = true;
  if (e.code === 'KeyD') move.right = true;
});

document.addEventListener('keyup', (e) => {
  if (e.code === 'KeyW') move.forward = false;
  if (e.code === 'KeyS') move.backward = false;
  if (e.code === 'KeyA') move.left = false;
  if (e.code === 'KeyD') move.right = false;
});

// 🎯 Canvas'a tıklayınca kilitle
document.addEventListener('click', (e) => {
  if (e.target.tagName === 'CANVAS') controls.lock();
});

// 🌀 Animasyon Döngüsü
function animate() {
  requestAnimationFrame(animate);

  if (controls.isLocked) {
    const delta = 0.1;
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    if (move.forward) velocity.z -= 100.0 * delta;
    if (move.backward) velocity.z += 100.0 * delta;
    if (move.left) velocity.x -= 100.0 * delta;
    if (move.right) velocity.x += 100.0 * delta;

    controls.moveRight(velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
  }

  if (showDirectionArrow && targetTomb) {
    const cameraPos = new THREE.Vector3().copy(camera.position);
    const targetPos = new THREE.Vector3().copy(targetTomb.position);
  
    // Yalnızca yatay düzlemde çalış (yüksekliği boşver)
    cameraPos.y = 0;
    targetPos.y = 0;
  
    // Kamera hangi yöne bakıyor?
    const cameraDir = new THREE.Vector3();
    camera.getWorldDirection(cameraDir);
    cameraDir.y = 0;
    cameraDir.normalize();
  
    // Mezara doğru vektör
    const toTarget = new THREE.Vector3().subVectors(targetPos, cameraPos).normalize();
  
    // İkisinin arasındaki açıyı bul
    let angle = Math.atan2(
      cameraDir.x * toTarget.z - cameraDir.z * toTarget.x,
      cameraDir.x * toTarget.x + cameraDir.z * toTarget.z
    );
  
    const hudArrow = document.getElementById('directionArrowHUD');
    hudArrow.style.position = 'absolute';
    hudArrow.style.left = '50%';
    hudArrow.style.top = '85%';
    hudArrow.style.transform = `translateX(-50%) rotate(${angle}rad)`;
  }
  
  
  camera.position.y = Math.max(camera.position.y, 1.8);

  if (currentArrow) {
    currentArrow.position.y = arrowOriginalY + Math.sin(Date.now() * 0.005) * 0.5;
    currentArrow.rotation.y += 0.01;
  }

  renderer.render(scene, camera);
}

animate();

// 📏 Pencere Yeniden Boyutlanınca
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
