// Inicialización de Three.js
let scene, camera, renderer;

let celestialObjects = [];
let planetMeshes = [];
let planetOrbitAngles = [];

// Función para cargar el JSON
async function loadData() {
    try {
        const response = await fetch('../src/data/b67r-rgxc.json');  // Ruta al archivo JSON
        const data = await response.json();
        processData(data);
    } catch (error) {
        console.error("Error al cargar el JSON:", error);
    }
}

// Procesar el JSON y crear objetos 3D
function processData(data) {
    let i = 0;
    data.forEach(obj => {
        // Convertir los valores de strings a números
        const q_au_1 = parseFloat(obj.q_au_1);
        const q_au_2 = parseFloat(obj.q_au_2);

        // Aumentar el tamaño del objeto para que sea más visible
        const size = q_au_1 * 10;  // Aumentar el factor para que el objeto se vea más grande
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const mesh = new THREE.Mesh(geometry, material);
        
        // Posición inicial del objeto (en el perihelio)
        const perihelionDistance = q_au_1 * 100;  // Escalar la distancia para hacer visible el objeto
        mesh.position.set(perihelionDistance, 0, 0);

        // Guardar el objeto en un array para animarlo más tarde
        celestialObjects.push({ mesh, orbit: obj });
        scene.add(mesh);

        // Crear y añadir el sprite con el nombre del objeto
        const label = createLabel(obj.object_name); // Usar el nombre del objeto
        label.position.set(perihelionDistance, size + 10, 0); // Ajustar la posición del sprite sobre el objeto
        scene.add(label);

        console.log(`Objeto ${i}:`, celestialObjects[i]);  // Depuración
        i++;
    });

    // Crear órbitas para los objetos después de procesar los datos
    createOrbits(data);
}

// Crear el sprite con el nombre
function createLabel(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = '20px Arial';
    context.fillStyle = 'white';
    context.fillText(text, 0, 20);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(100, 90, 1); // Escalar el sprite para hacerlo visible

    return sprite;
}

// Función para crear órbitas
function createOrbits(data) {
    data.forEach(obj => {
        const q_au_1 = parseFloat(obj.q_au_1);
        const q_au_2 = parseFloat(obj.q_au_2);
        const radius = (q_au_1 + q_au_2) / 2 * 100; // Escalar el radio para las órbitas
        const orbitLine = createOrbit(radius);
        scene.add(orbitLine);
    });
}

// Crear la escena
function init() {
    scene = new THREE.Scene();

    // Crear la cámara
    camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );
    camera.position.set(0, 100, 300);  // Elevar y alejar la cámara
    camera.lookAt(0, 0, 0);

    // Crear el renderizador
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container').appendChild(renderer.domElement);
    
    // Cargar los datos desde el archivo JSON
    loadData();

    // Crear el Sol
    createSun();
    
    // Añadir luz solar (opcional)
    addSunLight();
    
    // Empezar la animación
    animate();
}

// Función de animación
function animate() {
    requestAnimationFrame(animate);

    // Actualización de la posición de los objetos en sus órbitas
    celestialObjects.forEach(({ mesh, orbit }) => {
        // Convertir a valores numéricos
        const period = parseFloat(orbit.p_yr) * 365;  // Convertir el periodo a días
        const q_au_1 = parseFloat(orbit.q_au_1);
        const q_au_2 = parseFloat(orbit.q_au_2);

        const distance = (q_au_1 + q_au_2) / 2 * 100;  // Media entre perihelio y afelio, escalada
        const time = Date.now() * 2.1;  // Tiempo ajustado para la simulación

        // Actualizar la posición del objeto
        mesh.position.x = distance * Math.cos(time / period);
        mesh.position.z = distance * Math.sin(time / period);
        mesh.rotation.y += 0.01;  // Rotación del objeto sobre su eje
    });

    // Renderizar la escena
    renderer.render(scene, camera);
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

// Ajustar el tamaño al cambiar la ventana
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Inicializar la escena
init();
