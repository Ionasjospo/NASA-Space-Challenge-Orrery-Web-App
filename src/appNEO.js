let canvas, engine, scene, camera, celestialObjects = [];

async function loadData() {
    try {
        const response = await fetch('./data/NEO.json');  
        const data = await response.json();
        processData(data);
    } catch (error) {
        console.error("Error al cargar el JSON:", error);
    }
}

function processData(data) {
    let i = 0;
    data.forEach(obj => {
        const a = parseFloat(obj.a); 
        const e = parseFloat(obj.e); 
        const diameter = parseFloat(obj.diameter); 

        const size = diameter * 8; 
        const sphere = BABYLON.MeshBuilder.CreateSphere(`sphere${i}`, { diameter: size, segments: 32 }, scene);
        const material = new BABYLON.StandardMaterial(`material${i}`, scene);
        material.diffuseColor = new BABYLON.Color3(1, 1, 1);
        sphere.material = material;
        
        const perihelionDistance = (a * (1 - e)) * 1000 ;  
        sphere.position.set(perihelionDistance, 0, 0);

        celestialObjects.push({ mesh: sphere, orbit: obj });
        scene.addMesh(sphere);

        const label = createLabel(obj.full_name, perihelionDistance, size + 10, 0);
        scene.addMesh(label);

        console.log(`Objeto ${i}:`, celestialObjects[i]); 
        i++;
    });

    createOrbits(data);
}


function createLabel(text, x, y, z) {
    const plane = BABYLON.MeshBuilder.CreatePlane("textPlane", { size: 50 }, scene);
    plane.position = new BABYLON.Vector3(x, y, z);

    const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane);
    const textBlock = new BABYLON.GUI.TextBlock();
    textBlock.text = text;
    textBlock.color = "white";
    textBlock.fontSize = 160;
    advancedTexture.addControl(textBlock);

    return plane;
}

function createOrbits(data) {
    data.forEach((obj, index) => {
        const a = parseFloat(obj.a); 
        const e = parseFloat(obj.e); 
        const diameter = parseFloat(obj.diameter);

        const orbitRadius = a * 100 + index * 50; 
        const orbitLine = createOrbit(orbitRadius, index);
        scene.addMesh(orbitLine);
    });
}

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
    orbit.color = new BABYLON.Color3(0.5, 0.5, 0.5); 
    return orbit;
}

function init() {
    canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.01, 0.01, 0.12, 1);

    camera = new BABYLON.ArcRotateCamera(
        "camera",
        BABYLON.Tools.ToRadians(45), 
        BABYLON.Tools.ToRadians(45), 
        500,                        
        new BABYLON.Vector3(0, 0, 0), 
        scene
    );

    camera.attachControl(canvas, true);

    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 5000;

    camera.panningSensibility = 0; 

    camera.zoomToMouseLocation = true;

    camera.wheelPrecision = 50;
    camera.pinchPrecision = 200;

    canvas.addEventListener('wheel', function (event) {
        event.preventDefault();

        if (event.ctrlKey) {
            const delta = event.deltaY;
            const zoomFactor = delta * 0.2;
            camera.radius += zoomFactor;
        } else {
            const deltaX = event.deltaX;
            const deltaY = event.deltaY;

            const panSpeed = 0.00007 * camera.radius; 
            camera.inertialPanningX += -deltaX * panSpeed;
            camera.inertialPanningY += -deltaY * panSpeed;
        }
    });
    
    addSunLight();
    addAmbientLight();

    createSun();

    loadData();

    engine.runRenderLoop(function () {
        animate();
        scene.render();
    });

    window.addEventListener('resize', function () {
        engine.resize();
    });
}

function animate() {
    celestialObjects.forEach(({ mesh, orbit }, index) => {
        const a = parseFloat(orbit.a); 
        const e = parseFloat(orbit.e); 
        const period = parseFloat(orbit.per_y) * 365; 

        const orbitRadius = (a * 100) + (index * 50); 
        const time = Date.now() * 0.500;  

        mesh.position.x = orbitRadius * Math.cos(time / period); 
        mesh.position.z = orbitRadius * Math.sin(time / period);
        mesh.rotation.y += 0.01;  
    });
}


function createSun() {
    const sun = BABYLON.MeshBuilder.CreateSphere("sun", { diameter: 150, segments: 32 }, scene);
    const sunMaterial = new BABYLON.StandardMaterial("sunMaterial", scene);
    sunMaterial.emissiveColor = new BABYLON.Color3(1, 0.8, 0); 
    sun.material = sunMaterial;
    sun.position.set(0, 0, 0);
}

function addSunLight() {
    const sunLight = new BABYLON.PointLight("sunLight", new BABYLON.Vector3(0, 0, 0), scene);
    sunLight.intensity = 1.5;
    sunLight.range = 1000;
}

function addAmbientLight() {
    const ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, 0), scene);
    ambientLight.intensity = 0.5;
}

init();
