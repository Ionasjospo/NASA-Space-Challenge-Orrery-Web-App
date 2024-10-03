import { getNeoData } from './api.js';
import { planets } from './data/planetsData.js';

// Variables principales de Three.js
let scene, camera, renderer;
let planetMeshes = [];
let planetOrbitAngles = [];

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
    camera.position.z = 70; // Alejar un poco la cámara
    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);
    // Crear el renderizador
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container').appendChild(renderer.domElement);
    
    // Crear los planetas
    createPlanets();

    // Crear el Sol
    createSun();
    
    // Añadir luz solar (opcional)
    addSunLight();
    
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

        // Añadir el planeta a la escena
        scene.add(mesh);
        
        // Guardar el planeta en planetMeshes
        planetMeshes.push(mesh);
        
        // Inicializar el ángulo orbital a 0
        planetOrbitAngles.push(0);

        // Crear la órbita y añadirla a la escena
        const orbitLine = createOrbit(planet.orbitalRadius);
        scene.add(orbitLine); // Añadimos la línea de la órbita
    });
}

function createOrbit(radius) {
    const orbitPoints = new THREE.BufferGeometry(); 
    const segments = 64; // Número de segmentos para crear el círculo

    // Almacenar los vértices en un array
    const vertices = [];
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2; // Ángulo en radianes
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        vertices.push(x, 0, z); // Añadimos los vértices en las coordenadas (x, y, z)
    }

    // Convertimos el array de vértices en un buffer
    orbitPoints.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    // Material de la línea de la órbita (blanco o cualquier otro color visible)
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });

    // Crear la línea cerrada usando los puntos calculados
    const orbitLine = new THREE.LineLoop(orbitPoints, material);

    return orbitLine;
}

function createSun() {
    const sunGeometry = new THREE.SphereGeometry(8, 32, 32); // Tamaño del Sol

    // Material con emisión para simular brillo
    const sunMaterial = new THREE.MeshPhongMaterial({
        color: 0xffff00, // Color del Sol (amarillo)
        emissive: 0xffcc00, // Emisión de luz (amarillo-naranja)
        emissiveIntensity: 1, // Intensidad del brillo
        shininess: 100 // Brillo especular
    });

    // Crear el mesh del Sol
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);

    // Posicionar el Sol en el centro de la escena
    sunMesh.position.set(0, 0, 0);

    // Añadir el Sol a la escena
    scene.add(sunMesh);
}

function addSunLight() {
    const sunLight = new THREE.PointLight(0xffffff, 1.5, 300); // Luz blanca brillante
    sunLight.position.set(0, 0, 0); // En el centro, donde está el Sol

    // Añadir la luz a la escena
    scene.add(sunLight);
}



function animate() {
    requestAnimationFrame(animate);

    // Actualizar la posición de los planetas en su órbita
    planetMeshes.forEach((mesh, index) => {
        const planet = planets[index];

        // Actualizar el ángulo orbital de acuerdo a la velocidad del planeta
        planetOrbitAngles[index] += planet.orbitalSpeed;
        
        // Calcular la nueva posición del planeta en su órbita
        mesh.position.x = planet.orbitalRadius * Math.cos(planetOrbitAngles[index]);
        mesh.position.z = planet.orbitalRadius * Math.sin(planetOrbitAngles[index]);
        
        // Rotar el planeta sobre su eje
        mesh.rotation.y += 0.01;
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
