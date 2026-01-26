/**
 * SceneManager.js
 * 
 * Manages the Three.js scene environment, including:
 * - Parallax background layers
 * - Lighting setup (rim lighting for gothic aesthetic)
 * - Ground plane and simple level geometry
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GameConfig } from '../config/GameConfig.js';

export class SceneManager {
    constructor(scene) {
        this.scene = scene;
        this.parallaxGroups = [];
        this.groundPlane = null;
        this.lights = {};
    }

    async init() {
        this.createLighting();
        this.createEnvironment();
        this.createParallaxBackgrounds();

        // Basic debug grid
        // const gridHelper = new THREE.GridHelper(100, 100, 0x444444, 0x222222);
        // this.scene.add(gridHelper);
    }

    createLighting() {
        // Dramatic rim lighting focus
        const ambientLight = new THREE.AmbientLight(0x404060, 0.4); // Cool purple-ish ambient
        this.scene.add(ambientLight);

        // Key light (warm, from moon/fire)
        const moonLight = new THREE.DirectionalLight(0xaaccff, 0.8);
        moonLight.position.set(-10, 20, 10);
        moonLight.castShadow = true;

        // Optimize shadow map
        moonLight.shadow.mapSize.width = 2048;
        moonLight.shadow.mapSize.height = 2048;
        moonLight.shadow.camera.near = 0.5;
        moonLight.shadow.camera.far = 50;
        moonLight.shadow.camera.left = -20;
        moonLight.shadow.camera.right = 20;
        moonLight.shadow.camera.top = 20;
        moonLight.shadow.camera.bottom = -20;

        this.scene.add(moonLight);
        this.lights.moon = moonLight;

        // Rim light (sharp, back light to separate silhouettes)
        const rimLight = new THREE.DirectionalLight(0xffaaee, 0.6);
        rimLight.position.set(0, 5, -5); // Behind entities
        this.scene.add(rimLight);
        this.lights.rim = rimLight;
    }

    createEnvironment() {
        // Environment details (tombstones, etc) could go here
        // But main level geometry is now in LevelManager
    }

    createParallaxBackgrounds() {
        // Create layers based on config
        GameConfig.world.parallaxLayers.forEach((layerConfig, index) => {
            const group = new THREE.Group();

            // Create some random shapes for this layer
            const count = 20;
            const geometry = new THREE.ConeGeometry(1, 4, 4);
            const material = new THREE.MeshBasicMaterial({
                color: layerConfig.color,
                fog: true
            });

            for (let i = 0; i < count; i++) {
                const mesh = new THREE.Mesh(geometry, material);
                // Distribute widely on X
                mesh.position.x = (Math.random() - 0.5) * 100;
                // Vary height slightly
                mesh.position.y = Math.random() * 5 + index * 2;
                mesh.scale.setScalar(2 + Math.random() * 2);
                group.add(mesh);
            }

            // Set Z depth
            group.position.z = layerConfig.depth;
            group.userData = {
                speedMultiplier: layerConfig.speedMultiplier,
                initialX: 0
            };

            this.scene.add(group);
            this.parallaxGroups.push(group);
        });
    }

    update(dt, cameraX) {
        // Update parallax positions relative to camera
        // Because camera moves, we move backgrounds with it but at a fraction of the speed
        // This creates the depth illusion

        this.parallaxGroups.forEach(group => {
            const parallaxX = cameraX * (1 - group.userData.speedMultiplier);
            group.position.x = parallaxX;
        });

        // Loop ground texture or physics boundaries would go here
    }
}
