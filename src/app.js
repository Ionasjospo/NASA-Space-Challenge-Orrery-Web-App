// Inicialización de Three.js
let scene, camera, renderer;
let celestialObjects = [];

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

        console.log(`Objeto ${i}:`, celestialObjects[i]);  // Depuración
        i++;
    });
}



// Inicialización de la escena
function init() {
    scene = new THREE.Scene();

    // Configurar la cámara en una posición adecuada
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 100, 300);  // Elevar la cámara más arriba y alejarla
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container').appendChild(renderer.domElement);

    // Cargar los datos desde el archivo JSON
    loadData();

    // Iniciar la animación
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
        const time = Date.now() * 2.2;  // Tiempo ajustado para la simulación

        // Actualizar la posición del objeto
        mesh.position.x = distance * Math.cos(time / period);
        mesh.position.z = distance * Math.sin(time / period);
        mesh.rotation.y += 0.01;  // Rotación del objeto sobre su eje
    });

    // Renderizar la escena
    renderer.render(scene, camera);
}

// Ajustar el tamaño al cambiar la ventana
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Inicializar la escena
init();
