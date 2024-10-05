
let canvas, engine, scene, camera, celestialObjects = [];


// Función para cargar el JSON
async function loadData() {
    try {
        const response = await fetch('./data/b67r-rgxc.json');  // Ruta al archivo JSON
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
        const sphere = BABYLON.MeshBuilder.CreateSphere(`sphere${i}`, { diameter: size * 2, segments: 32 }, scene);
        const material = new BABYLON.StandardMaterial(`material${i}`, scene);
        material.diffuseColor = new BABYLON.Color3(1, 1, 1); // Blanco
        sphere.material = material;

        // Posición inicial del objeto (en el perihelio)
        const perihelionDistance = q_au_1 * 100;  // Escalar la distancia para hacer visible el objeto
        sphere.position.set(perihelionDistance, 0, 0);

        // Guardar el objeto en un array para animarlo más tarde
        celestialObjects.push({ mesh: sphere, orbit: obj });
        scene.addMesh(sphere);

        // Crear y añadir el label con el nombre del objeto
        const label = createLabel(obj.object_name, perihelionDistance, size + 10, 0);
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
        const q_au_1 = parseFloat(obj.q_au_1);
        const q_au_2 = parseFloat(obj.q_au_2);
        const radius = (q_au_1 + q_au_2) / 2 * 100; // Escalar el radio para las órbitas
        const orbitLine = createOrbit(radius, index);
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
    orbit.color = new BABYLON.Color3(1, 1, 1); // Blanco
    return orbit;
}

// Crear la escena
function init() {
    canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(engine);

    // Crear la cámara
    camera = new BABYLON.ArcRotateCamera(
        "camera",
        BABYLON.Tools.ToRadians(45),
        BABYLON.Tools.ToRadians(45),
        500,
        new BABYLON.Vector3(0, 0, 0),
        scene
    );
    

    // Vincular la cámara al canvas para permitir el control del usuario
    camera.attachControl(canvas, true);

    // Habilitar la entrada de la rueda del ratón para el zoom
    camera.inputs.addMouseWheel();

    // Configurar los límites del zoom
    camera.lowerRadiusLimit = 50;    // Distancia mínima al centro (más cerca)
    camera.upperRadiusLimit = 2500;  // Distancia máxima al centro (más lejos)

    // Ajustar la sensibilidad del zoom en dispositivos táctiles
    camera.pinchPrecision = 50; // Valor más alto significa zoom más lento en táctil

    canvas.addEventListener('wheel', function (event) {
        // Prevenir el comportamiento predeterminado para evitar el desplazamiento de la página
        event.preventDefault();
    
        // Ajustar el radio de la cámara (distancia al centro) basado en el delta del evento
        const delta = event.deltaY;
    
        // Puedes ajustar el factor de sensibilidad aquí
        const zoomFactor = delta * 1.0;
    
        camera.radius += zoomFactor;
    
        // Asegurar que el radio permanezca dentro de los límites establecidos
        if (camera.radius < camera.lowerRadiusLimit) {
            camera.radius = camera.lowerRadiusLimit;
        } else if (camera.radius > camera.upperRadiusLimit) {
            camera.radius = camera.upperRadiusLimit;
        }
    });
    


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
        // Convertir a valores numéricos
        const period = parseFloat(orbit.p_yr) * 365;  // Convertir el periodo a días
        const q_au_1 = parseFloat(orbit.q_au_1);
        const q_au_2 = parseFloat(orbit.q_au_2);

        const distance = (q_au_1 + q_au_2) / 2 * 100;  // Media entre perihelio y afelio, escalada
        const time = Date.now() * 2;  // Tiempo ajustado para la simulación

        // Actualizar la posición del objeto
        mesh.position.x = distance * Math.cos(time / period);
        mesh.position.z = distance * Math.sin(time / period);
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
