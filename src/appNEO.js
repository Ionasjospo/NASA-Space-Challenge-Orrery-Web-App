let canvas, engine, scene, camera, celestialObjects = [];

// Función para cargar el JSON
async function loadData() {
    try {
        const response = await fetch('./data/NEO.json');  // Ruta al archivo JSON
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
        // Obtener los valores del objeto
        const a = parseFloat(obj.a); // Semi-eje mayor
        const e = parseFloat(obj.e); // Excentricidad
        const diameter = parseFloat(obj.diameter); // Diámetro

        // Aumentar el tamaño del objeto para que sea más visible
        const size = diameter; // Usa el diámetro directamente
        const sphere = BABYLON.MeshBuilder.CreateSphere(`sphere${i}`, { diameter: size, segments: 32 }, scene);
        const material = new BABYLON.StandardMaterial(`material${i}`, scene);
        material.diffuseColor = new BABYLON.Color3(1, 1, 1); // Blanco
        sphere.material = material;
        
        // Posición inicial del objeto (en el perihelio)
        const perihelionDistance = (a * (1 - e)) * 100;  // Escalar la distancia para hacer visible el objeto
        sphere.position.set(perihelionDistance, 0, 0);

        // Guardar el objeto en un array para animarlo más tarde
        celestialObjects.push({ mesh: sphere, orbit: obj });
        scene.addMesh(sphere);

        // Crear y añadir el label con el nombre del objeto
        const label = createLabel(obj.name, perihelionDistance, size + 10, 0);
        scene.addMesh(label);

        console.log(`Objeto ${i}:`, celestialObjects[i]);  // Depuración
        i++;
    });

    // Crear órbitas para los objetos después de procesar los datos
    createOrbits(data);
}


// Crear el label con el nombre
function createLabel(text, x, y, z) {
    const plane = BABYLON.MeshBuilder.CreatePlane("textPlane", { size: 50 }, scene);
    plane.position = new BABYLON.Vector3(x, y, z);

    const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane);
    const textBlock = new BABYLON.GUI.TextBlock();
    textBlock.text = text;
    textBlock.color = "white";
    textBlock.fontSize = 24;
    advancedTexture.addControl(textBlock);

    return plane;
}

// Función para crear órbitas
function createOrbits(data) {
    data.forEach((obj, index) => {
        const a = parseFloat(obj.a); // Semi-eje mayor
        const e = parseFloat(obj.e); // Excentricidad
        const diameter = parseFloat(obj.diameter); // Diámetro del objeto

        // Aumentar el radio de la órbita en función del tamaño del objeto
        const orbitRadius = a * 100; // Escalar el radio para las órbitas y añadir un margen
        const orbitLine = createOrbit(orbitRadius, index);
        scene.addMesh(orbitLine);
    });
}

// Crear las órbitas
function createOrbit(radius, index) {
    const points = [];
    const segments = 64;

    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        points.push(new BABYLON.Vector3(x, 0, z));
    }

    const orbit = BABYLON.MeshBuilder.CreateLines(`orbit${index}`, { points: points }, scene);
    orbit.color = new BABYLON.Color3(0.5, 0.5, 0.5); // gris
    return orbit;
}

// Crear la escena
function init() {
    canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(engine);

    // Crear la cámara
    camera = new BABYLON.ArcRotateCamera("camera", BABYLON.Tools.ToRadians(45), BABYLON.Tools.ToRadians(45), 500, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 50;
    camera.upperRadiusLimit = 1000;

    // Añadir luz solar y ambiental
    addSunLight();
    addAmbientLight();

    // Crear el Sol
    createSun();

    // Cargar los datos desde el archivo JSON
    loadData();

    // Render loop
    engine.runRenderLoop(function () {
        animate();
        scene.render();
    });

    // Ajustar el tamaño al cambiar la ventana
    window.addEventListener('resize', function () {
        engine.resize();
    });
}

// Función de animación
function animate() {
    // Actualización de la posición de los objetos en sus órbitas
    celestialObjects.forEach(({ mesh, orbit }) => {
        // Obtener los parámetros orbitales
        const a = parseFloat(orbit.a); // Semi-eje mayor
        const e = parseFloat(orbit.e); // Excentricidad
        const period = parseFloat(orbit.per_y) * 365; // Convertir el periodo a días

        // Calcular perihelio y afelio
        const perihelionDistance = (a * (1 - e)) * 100; // Perihelio escalado
        const aphelionDistance = (a * (1 + e)) * 100; // Afelio escalado
        const averageDistance = (perihelionDistance + aphelionDistance) / 2; // Distancia promedio

        // Tiempo ajustado para la simulación
        const time = Date.now() * 1.0001;  // Ajustar la velocidad de la simulación

        // Actualizar la posición del objeto usando la distancia promedio
        mesh.position.x = averageDistance * Math.cos(time / period);
        mesh.position.z = averageDistance * Math.sin(time / period);
        mesh.rotation.y += 0.01;  // Rotación del objeto sobre su eje
    });
}

// Crear el Sol
function createSun() {
    const sun = BABYLON.MeshBuilder.CreateSphere("sun", { diameter: 16, segments: 32 }, scene);
    const sunMaterial = new BABYLON.StandardMaterial("sunMaterial", scene);
    sunMaterial.emissiveColor = new BABYLON.Color3(1, 0.8, 0); // Amarillo-naranja brillante
    sun.material = sunMaterial;
    sun.position.set(0, 0, 0);
}

// Añadir luz solar
function addSunLight() {
    const sunLight = new BABYLON.PointLight("sunLight", new BABYLON.Vector3(0, 0, 0), scene);
    sunLight.intensity = 1.5;
    sunLight.range = 1000;
}

// Añadir luz ambiental
function addAmbientLight() {
    const ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, 0), scene);
    ambientLight.intensity = 0.5;
}

// Inicializar la escena
init();
