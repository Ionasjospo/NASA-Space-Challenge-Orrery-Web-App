import { getNeoData } from './api.js';
import { planets } from './data/planetsData.js';

// Variables principales de Three.js
let scene, camera, renderer;
let planetMeshes = [];

// Inicializar la escena
function init() {
    // Crear la escena
    scene = new THREE.Scene();
    
    // Crear la cámara
    camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );
    camera.position.z = 50; // Alejar un poco la cámara
    
    // Crear el renderizador
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container').appendChild(renderer.domElement);
    
    // Crear los planetas
    createPlanets();
    
    // Empezar la animación
    animate();
    
    // Obtener datos de NEOs
    getNeoData().then(renderNEOs);
}

// Función para crear planetas
function createPlanets() {
    planets.forEach(planet => {
        const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: planet.color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(planet.position.x, planet.position.y, planet.position.z);
        planetMeshes.push(mesh);
        scene.add(mesh);
    });
}

// Función para animar la escena
function animate() {
    requestAnimationFrame(animate);
    
    // Movimiento básico de los planetas (rotación y traslación)
    planetMeshes.forEach((mesh, index) => {
        mesh.rotation.y += 0.01; // Rotación sobre su eje
        // Simular una órbita básica alrededor del sol (posición del sol es el origen)
        const planet = planets[index];
        mesh.position.x = planet.position.x * Math.cos(Date.now() * 0.2 / planet.orbitalPeriod);
        mesh.position.z = planet.position.z * Math.sin(Date.now() * 0.2 / planet.orbitalPeriod);
    });
    
    renderer.render(scene, camera);
}

// Renderizar NEOs (objetos cercanos a la Tierra)
function renderNEOs(neoData) {
    neoData.forEach(neo => {
        const geometry = new THREE.SphereGeometry(neo.size, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Color rojo para los NEOs
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(neo.position.x, neo.position.y, neo.position.z);
        scene.add(mesh);
    });
}

// Ajustar el tamaño del render cuando se cambia el tamaño de la ventana
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Inicializar la escena
init();
