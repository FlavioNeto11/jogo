// ============================================
// PARTICLE SYSTEM
// ============================================
class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.pools = {};
    }

    emit(x, y, z, type = 'block', color = 0xffffff, count = 8) {
        for (let i = 0; i < count; i++) {
            const size = Utils.randomRange(0.05, 0.15);
            const geo = new THREE.BoxGeometry(size, size, size);
            const mat = new THREE.MeshLambertMaterial({
                color: color,
                flatShading: true
            });
            const mesh = new THREE.Mesh(geo, mat);

            mesh.position.set(x, y, z);
            mesh.userData = {
                velocity: new THREE.Vector3(
                    Utils.randomRange(-3, 3),
                    Utils.randomRange(2, 6),
                    Utils.randomRange(-3, 3)
                ),
                life: Utils.randomRange(0.5, 1.5),
                maxLife: 1.5,
                gravity: -15,
                rotSpeed: new THREE.Vector3(
                    Utils.randomRange(-5, 5),
                    Utils.randomRange(-5, 5),
                    Utils.randomRange(-5, 5)
                )
            };

            this.scene.add(mesh);
            this.particles.push(mesh);
        }
    }

    emitCoinCollect(x, y, z) {
        // Golden sparkle particles
        for (let i = 0; i < 15; i++) {
            const size = Utils.randomRange(0.03, 0.1);
            const geo = new THREE.BoxGeometry(size, size, size);
            const mat = new THREE.MeshLambertMaterial({
                color: 0xFFD700,
                emissive: 0xFFAA00,
                emissiveIntensity: 0.8,
                flatShading: true
            });
            const mesh = new THREE.Mesh(geo, mat);

            const angle = (i / 15) * Math.PI * 2;
            const speed = Utils.randomRange(2, 5);

            mesh.position.set(x, y, z);
            mesh.userData = {
                velocity: new THREE.Vector3(
                    Math.cos(angle) * speed,
                    Utils.randomRange(3, 7),
                    Math.sin(angle) * speed
                ),
                life: Utils.randomRange(0.3, 0.8),
                maxLife: 0.8,
                gravity: -8,
                rotSpeed: new THREE.Vector3(
                    Utils.randomRange(-10, 10),
                    Utils.randomRange(-10, 10),
                    Utils.randomRange(-10, 10)
                )
            };

            this.scene.add(mesh);
            this.particles.push(mesh);
        }
    }

    emitJump(x, y, z) {
        for (let i = 0; i < 6; i++) {
            const size = Utils.randomRange(0.05, 0.12);
            const geo = new THREE.BoxGeometry(size, size, size);
            const mat = new THREE.MeshLambertMaterial({
                color: 0xBDBDBD,
                flatShading: true,
                transparent: true,
                opacity: 0.7
            });
            const mesh = new THREE.Mesh(geo, mat);

            const angle = (i / 6) * Math.PI * 2;
            mesh.position.set(x, y, z);
            mesh.userData = {
                velocity: new THREE.Vector3(
                    Math.cos(angle) * 2,
                    Utils.randomRange(0.5, 2),
                    Math.sin(angle) * 2
                ),
                life: Utils.randomRange(0.3, 0.6),
                maxLife: 0.6,
                gravity: -5,
                rotSpeed: new THREE.Vector3(
                    Utils.randomRange(-5, 5),
                    Utils.randomRange(-5, 5),
                    Utils.randomRange(-5, 5)
                )
            };

            this.scene.add(mesh);
            this.particles.push(mesh);
        }
    }

    emitLand(x, y, z) {
        for (let i = 0; i < 10; i++) {
            const size = Utils.randomRange(0.04, 0.1);
            const geo = new THREE.BoxGeometry(size, size, size);
            const mat = new THREE.MeshLambertMaterial({
                color: 0x8D6E63,
                flatShading: true,
                transparent: true,
                opacity: 0.6
            });
            const mesh = new THREE.Mesh(geo, mat);

            const angle = (i / 10) * Math.PI * 2;
            mesh.position.set(x, y, z);
            mesh.userData = {
                velocity: new THREE.Vector3(
                    Math.cos(angle) * Utils.randomRange(1, 3),
                    Utils.randomRange(1, 3),
                    Math.sin(angle) * Utils.randomRange(1, 3)
                ),
                life: Utils.randomRange(0.2, 0.5),
                maxLife: 0.5,
                gravity: -10,
                rotSpeed: new THREE.Vector3(
                    Utils.randomRange(-8, 8),
                    Utils.randomRange(-8, 8),
                    Utils.randomRange(-8, 8)
                )
            };

            this.scene.add(mesh);
            this.particles.push(mesh);
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            const data = p.userData;

            data.life -= dt;

            if (data.life <= 0) {
                this.scene.remove(p);
                p.geometry.dispose();
                p.material.dispose();
                this.particles.splice(i, 1);
                continue;
            }

            // Physics
            data.velocity.y += data.gravity * dt;
            p.position.add(data.velocity.clone().multiplyScalar(dt));

            // Rotation
            p.rotation.x += data.rotSpeed.x * dt;
            p.rotation.y += data.rotSpeed.y * dt;
            p.rotation.z += data.rotSpeed.z * dt;

            // Fade out
            const lifeRatio = data.life / data.maxLife;
            if (p.material.opacity !== undefined) {
                p.material.opacity = lifeRatio;
            }

            // Shrink
            const scale = lifeRatio;
            p.scale.set(scale, scale, scale);
        }
    }

    getCount() {
        return this.particles.length;
    }
}
