import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    (Window.width * 0.8) / Window.height,
    1,
    1000
);
let renderer;

camera.position.z = 5;

const loader = new THREE.TextureLoader();
loader.load("w-pizza.jpeg", function (texture) {
    scene.background = texture;
});

const geometry = new THREE.RingGeometry(10, 11, 60);
const material = new THREE.MeshBasicMaterial({ color: "white" });
const circle = new THREE.Mesh(geometry, material);
scene.add(circle);

const coneGeometry = new THREE.ConeGeometry(5, 11, 32, 3, 1, 0, 2);
const coneMaterial = new THREE.MeshBasicMaterial({ color: "black" });
const cone = new THREE.Mesh(coneGeometry, coneMaterial);
scene.add(cone);

const animate = () => {
    requestAnimationFrame(animate);
    circle.rotation.x += 0.01;
    circle.rotation.y += 0.01;
    cone.rotation.x += 0.01;
    cone.rotation.y += 0.01;
    renderer.render(scene, camera);
};

const resize = (el) => {
    renderer.setSize(window.innerWidth, window.innerHeight * 0.8);
    //camera.aspect = window.innerWidth / window.innerHeight;
    camera.aspect = el.clientWidth / el.clientHeight;
    camera.updateProjectionMatrix();
};

export const createScene = (el) => {
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el });
    const controls = new OrbitControls(camera, renderer.domElement);
    //controls.update() must be called after any manual changes to the camera's transform
    camera.position.set(0, 20, 100);
    controls.update();
    resize(el);
    animate();
};

window.addEventListener("resize", resize);
