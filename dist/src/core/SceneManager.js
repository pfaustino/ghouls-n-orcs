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
    constructor(game) {
        this.game = game;
        this.scene = game.scene;
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
        const ambientLight = new THREE.AmbientLight(0x404060, 0.6); // Boosted ambient
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

        // Flashlight (Camera fill)
        const camLight = new THREE.DirectionalLight(0xffffff, 0.5);
        camLight.position.set(0, 0, 10);
        this.scene.add(camLight);

        // Rim light (sharp, back light to separate silhouettes)
        const rimLight = new THREE.DirectionalLight(0xffaaee, 0.6);
        rimLight.position.set(0, 5, -5); // Behind entities
        this.scene.add(rimLight);
        this.lights.rim = rimLight;

        console.log("🔦 Lighting created");
    }

    createEnvironment() {
        // Environment details (tombstones, etc) could go here
        // But main level geometry is now in LevelManager
    }

    createParallaxBackgrounds() {
        // Create layers based on config
        GameConfig.world.parallaxLayers.forEach((layerConfig, index) => {
            const group = new THREE.Group();

            // Distribute items across the whole level length (approx 300)
            // Depth 0 (Far) -> Mountains
            // Depth 1 (Mid) -> Trees
            // Depth 2 (Near) -> Tombstones

            const count = 40;
            const rangeX = 400; // -50 to 350
            const startX = -50;

            const material = new THREE.MeshStandardMaterial({
                color: layerConfig.color,
                roughness: 1.0,
                metalness: 0
            });

            for (let i = 0; i < count; i++) {
                let mesh;
                if (index === 0) {
                    mesh = this.createMountain(material);
                    mesh.position.y = -5 + Math.random() * 5;
                    mesh.scale.setScalar(5 + Math.random() * 5);
                } else if (index === 1) {
                    mesh = this.createSpookyTree(material);
                    mesh.position.y = -2;
                    mesh.scale.setScalar(1 + Math.random() * 0.5);
                } else {
                    mesh = this.createTombstone(material);
                    mesh.position.y = 0;
                    mesh.scale.setScalar(0.8 + Math.random() * 0.4);
                }

                mesh.position.x = startX + Math.random() * rangeX;
                group.add(mesh);
            }

            // Set Z depth
            group.position.z = layerConfig.depth;
            group.userData = {
                speedMultiplier: layerConfig.speedMultiplier
            };

            this.scene.add(group);
            this.parallaxGroups.push(group);
        });
    }

    createMountain(material) {
        const h = 10 + Math.random() * 10;
        const r = 5 + Math.random() * 5;
        const geo = new THREE.ConeGeometry(r, h, 4);
        return new THREE.Mesh(geo, material);
    }

    createSpookyTree(material) {
        const group = new THREE.Group();
        const trunkH = 4 + Math.random() * 2;
        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, trunkH, 5);
        const trunk = new THREE.Mesh(trunkGeo, material);
        trunk.position.y = trunkH / 2;
        group.add(trunk);

        // Branches
        for (let i = 0; i < 3; i++) {
            const branchGeo = new THREE.CylinderGeometry(0.1, 0.15, 2, 4);
            const branch = new THREE.Mesh(branchGeo, material);
            const y = trunkH * (0.4 + Math.random() * 0.5);
            branch.position.set(0, y, 0);
            branch.rotation.z = (Math.random() - 0.5) * 2;
            branch.rotation.x = (Math.random() - 0.5) * 2;
            branch.position.x += Math.sin(branch.rotation.z);
            group.add(branch);
        }
        return group;
    }

    createTombstone(material) {
        const w = 0.5 + Math.random() * 0.5;
        const h = 0.8 + Math.random() * 0.4;
        const d = 0.2;
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, material);
        mesh.position.y = h / 2;
        mesh.rotation.z = (Math.random() - 0.5) * 0.2; // Tilted
        return mesh;
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
