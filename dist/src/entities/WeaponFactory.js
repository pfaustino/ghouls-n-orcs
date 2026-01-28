
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export const WeaponFactory = {
    createMesh(type) {
        const group = new THREE.Group();

        // Shared Materials
        const matSteel = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa, metalness: 0.8, roughness: 0.2
        });
        const matWood = new THREE.MeshStandardMaterial({
            color: 0x8b4513, roughness: 0.9
        });
        const matGold = new THREE.MeshStandardMaterial({
            color: 0xffd700, metalness: 0.6, roughness: 0.3
        });
        const matFire = new THREE.MeshBasicMaterial({
            color: 0xff5500
        });

        // ==========================================================
        // SPEAR (Oriented along X-axis for throwing)
        // ==========================================================
        if (type === 'spear') {
            // Shaft
            const shaft = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 1.4, 8),
                matWood
            );
            shaft.rotation.z = Math.PI / 2; // Lie flat along X
            shaft.castShadow = true;
            group.add(shaft);

            // Tip
            const tip = new THREE.Mesh(
                new THREE.ConeGeometry(0.08, 0.4, 8),
                matSteel
            );
            tip.rotation.z = -Math.PI / 2; // Point +X
            tip.position.x = 0.7 + 0.2; // End of shaft + half cone height
            tip.castShadow = true;
            group.add(tip);
        }

        // ==========================================================
        // KNIFE (Oriented along X-axis)
        // ==========================================================
        else if (type === 'knife') {
            // Blade
            const blade = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, 0.1, 0.02),
                matSteel
            );
            blade.position.x = 0.1;
            blade.castShadow = true;
            group.add(blade);

            // Handle
            const handle = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 0.12, 0.05),
                matWood
            );
            handle.position.x = -0.25;
            handle.castShadow = true;
            group.add(handle);
        }

        // ==========================================================
        // AXE (Oriented Upright for spin)
        // ==========================================================
        else if (type === 'axe') {
            // Center of mass at 0,0 for nice spinning

            // Handle
            const handle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8),
                matWood
            );
            handle.castShadow = true;
            group.add(handle);

            // Blade Head (Double bit or Single?)
            // Single bit for now
            const headGeo = new THREE.BoxGeometry(0.4, 0.25, 0.1);
            const head = new THREE.Mesh(headGeo, matSteel);
            head.position.set(0.15, 0.25, 0); // Offset to side and top
            head.castShadow = true;
            group.add(head);

            // Counterweight/Spike
            const spike = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 0.1, 0.1),
                matSteel
            );
            spike.position.set(-0.1, 0.25, 0);
            group.add(spike);
        }

        // ==========================================================
        // TORCH (Oriented Upright)
        // ==========================================================
        else if (type === 'torch') {
            // Handle
            const handle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.04, 0.6, 8),
                matWood
            );
            handle.position.y = -0.1;
            handle.castShadow = true;
            group.add(handle);

            // Cage/Head
            const head = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.08, 0.25, 6),
                matGold
            );
            head.position.y = 0.3;
            head.castShadow = true;
            group.add(head);

            // Flame Core (Basic visual)
            const flame = new THREE.Mesh(
                new THREE.ConeGeometry(0.1, 0.35, 5),
                matFire
            );
            flame.position.y = 0.5;
            group.add(flame);

            // Add a point light for the torch?
            // Expensive if many projectiles, but looks cool
            const light = new THREE.PointLight(0xffaa00, 0.5, 3);
            light.position.y = 0.4;
            group.add(light);
        }

        else if (type === 'gargoyle') {
            const geo = new THREE.SphereGeometry(0.5, 8, 8);
            const mat = new THREE.MeshStandardMaterial({ color: 0x555555 });
            const mesh = new THREE.Mesh(geo, mat);
            group.add(mesh);
        }

        return group;
    }
};
