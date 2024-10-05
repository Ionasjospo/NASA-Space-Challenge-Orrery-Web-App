import * as THREE from './three.module.js';
import { OrbitControls } from './orbitcontrols.js';

export class OrreryApp {
    constructor(containerId) {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.celestialObjects = [];
        this.containerId = containerId;  

        this.init();
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    async loadData() {
        try {
            const response = await fetch('../public/data/b67r-rgxc.json');  // Rute to json archive
            const data = await response.json();
            this.processData(data);
        } catch (error) {
            console.error("Error al cargar el JSON:", error);
        }
    }

    processData(data) {
        let i = 0;
        data.forEach(obj => {
            const q_au_1 = parseFloat(obj.q_au_1);
            const q_au_2 = parseFloat(obj.q_au_2);
            const size = q_au_1 * 10;
            const geometry = new THREE.SphereGeometry(size, 32, 32);
            const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const mesh = new THREE.Mesh(geometry, material);

            const perihelionDistance = q_au_1 * 100;
            mesh.position.set(perihelionDistance, 0, 0);

            this.celestialObjects.push({ mesh, orbit: obj });
            this.scene.add(mesh);

            const label = this.createLabel(obj.object_name);
            label.position.set(perihelionDistance, size + 10, 0);
            this.scene.add(label);

            console.log(`Objeto ${i}:`, this.celestialObjects[i]);
            i++;
        });

        this.createOrbits(data);
    }

    createLabel(text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = '20px Arial';
        context.fillStyle = 'white';
        context.fillText(text, 0, 20);

        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(100, 90, 1);

        return sprite;
    }

    createOrbits(data) {
        data.forEach(obj => {
            const q_au_1 = parseFloat(obj.q_au_1);
            const q_au_2 = parseFloat(obj.q_au_2);
            const radius = (q_au_1 + q_au_2) / 2 * 100;
            const orbitLine = this.createOrbit(radius);
            this.scene.add(orbitLine);
        });
    }

    createOrbit(radius) {
        const orbitPoints = new THREE.BufferGeometry(); 
        const segments = 64;

        const vertices = [];
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const x = radius * Math.cos(theta);
            const z = radius * Math.sin(theta);
            vertices.push(x, 0, z);
        }

        orbitPoints.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        const orbitLine = new THREE.LineLoop(orbitPoints, material);

        return orbitLine;
    }

    createSun() {
        const sunGeometry = new THREE.SphereGeometry(8, 32, 32);
        const sunMaterial = new THREE.MeshPhongMaterial({
            color: 0xffff00,
            emissive: 0xffcc00,
            emissiveIntensity: 1,
            shininess: 100
        });

        const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
        sunMesh.position.set(0, 0, 0);
        this.scene.add(sunMesh);
    }

    addSunLight() {
        const sunLight = new THREE.PointLight(0xffffff, 1.5, 300);
        sunLight.position.set(0, 0, 0);
        this.scene.add(sunLight);
    }

    addAmbientLight() {
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
    }

    init() {
        const container = document.getElementById(this.containerId);
        
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 9000);
        this.camera.position.set(0, 100, 300);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.enableZoom = true;

        this.loadData();
        this.createSun();
        this.addSunLight();
        this.addAmbientLight();
        this.animate();
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        this.celestialObjects.forEach(({ mesh, orbit }) => {
            const period = parseFloat(orbit.p_yr) * 365;
            const q_au_1 = parseFloat(orbit.q_au_1);
            const q_au_2 = parseFloat(orbit.q_au_2);

            const distance = (q_au_1 + q_au_2) / 2 * 100;
            const time = Date.now() * 2.002;

            mesh.position.x = distance * Math.cos(time / period);
            mesh.position.z = distance * Math.sin(time / period);
            mesh.rotation.y += 0.01;
        });

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
}
