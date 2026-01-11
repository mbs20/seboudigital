import * as THREE from 'three';
import { FBXLoader } from './vendor/FBXLoader.js';

/**
 * SEBOU DIGITAL - AVATAR 3D (OPTIMIZED)
 * Performance upgrades:
 * 1. Visibility Culling (Stops rendering when off-screen)
 * 2. PixelRatio Cap (Max 2x for performance on high-DPI screens)
 * 3. Robust Error Handling
 */

window.avatars = [];

class AvatarZone {
    constructor(config) {
        this.id = config.id;
        this.containerId = config.containerId;
        this.modelFile = config.modelFile;
        this.animations = config.animations;

        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.warn(`AvatarZone [${this.id}]: Container #${this.containerId} not found.`);
            return;
        }

        // State Flags
        this.isVisible = false;
        this.isLoaded = false;
        this.animationFrameId = null;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.actions = {};
        this.activeAction = null;

        this.init();
        window.avatars.push(this);
    }

    init() {
        if (!this.container) return;
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;

        try {
            this.scene = new THREE.Scene();

            // Camera
            this.camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 1000);
            this.camera.position.set(0, 0, 25);

            // Renderer Optimized
            this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
            this.renderer.setSize(w, h);
            // OPTIMIZATION: Cap pixel ratio to save battery/GPU
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.container.appendChild(this.renderer.domElement);

            // Lights
            const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
            hemiLight.position.set(0, 200, 0);
            this.scene.add(hemiLight);

            const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
            dirLight.position.set(0, 200, 100);
            this.scene.add(dirLight);

            // Load
            this.loadBaseModel();

            // Observers
            this.setupResizeObserver();
            this.setupVisibilityObserver();

        } catch (e) {
            console.error(`AvatarZone [${this.id}] Critical Init Error:`, e);
            // Hide container on crash to prevent ugly blank box
            this.container.style.display = 'none';
        }
    }

    setupVisibilityObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isVisible = entry.isIntersecting;
                if (this.isVisible) {
                    this.startRendering();
                } else {
                    this.stopRendering();
                }
            });
        }, { threshold: 0.1 }); // Trigger when 10% visible

        observer.observe(this.container);
    }

    setupResizeObserver() {
        const resizeObserver = new ResizeObserver(() => this.onResize());
        resizeObserver.observe(this.container);
    }

    loadBaseModel() {
        const loader = new FBXLoader();
        loader.load(`assets/3d/${this.modelFile}.fbx`, (object) => {
            this.setupModel(object);
            this.loadAdditionalAnimations();
            this.isLoaded = true;
            if (this.isVisible) this.startRendering(); // Start immediately if visible
        }, undefined, (e) => console.error(`[${this.id}] Error loading ${this.modelFile}:`, e));
    }

    setupModel(object) {
        this.mixer = new THREE.AnimationMixer(object);

        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());

        const targetSize = 7.0;
        const scaleFactor = targetSize / Math.max(size.x, size.y, size.z);
        object.scale.set(scaleFactor, scaleFactor, scaleFactor);

        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center.multiplyScalar(scaleFactor));
        object.rotation.y = 0;

        this.scene.add(object);

        if (object.animations.length > 0) {
            const clip = object.animations[0];
            const animConf = this.animations.find(a => a.file === this.modelFile);
            if (animConf) this.storeAction(animConf.name, clip);
        }

        this.startSequence();
    }

    loadAdditionalAnimations() {
        const loader = new FBXLoader();
        this.animations.forEach(animConf => {
            if (animConf.file === this.modelFile) return;

            loader.load(`assets/3d/${animConf.file}.fbx`, (object) => {
                if (object.animations.length > 0) {
                    const clip = object.animations[0];
                    this.storeAction(animConf.name, clip);
                }
            });
        });
    }

    storeAction(name, clip) {
        const action = this.mixer.clipAction(clip);
        this.actions[name] = action;

        const conf = this.animations.find(a => a.name === name);
        if (conf) {
            if (conf.loopOnce) {
                action.setLoop(THREE.LoopOnce);
                action.clampWhenFinished = true;
            } else {
                action.setLoop(THREE.LoopRepeat);
            }
        }
    }

    startSequence() {
        const firstAnim = this.animations[0];
        this.playAction(firstAnim.name);

        this.mixer.addEventListener('finished', (e) => {
            const currentName = this.activeActionName;
            const currentConf = this.animations.find(a => a.name === currentName);
            if (currentConf && currentConf.next) {
                this.playAction(currentConf.next, 0.5);
            }
        });
    }

    playAction(name, fadeDuration = 0) {
        if (!this.actions[name]) {
            setTimeout(() => this.playAction(name, fadeDuration), 100);
            return;
        }

        const newAction = this.actions[name];
        const oldAction = this.activeAction;

        if (oldAction !== newAction) {
            if (oldAction && fadeDuration > 0) {
                oldAction.fadeOut(fadeDuration);
            } else if (oldAction) {
                oldAction.stop();
            }

            newAction.reset();
            newAction.setEffectiveTimeScale(1);
            newAction.setEffectiveWeight(1);
            if (fadeDuration > 0) newAction.fadeIn(fadeDuration);
            newAction.play();
            this.activeAction = newAction;
            this.activeActionName = name;
        }
    }

    onResize() {
        if (!this.container || !this.camera || !this.renderer) return;
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    startRendering() {
        if (this.animationFrameId) return; // Already running
        this.animate();
    }

    stopRendering() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    animate() {
        if (!this.renderer || !this.isVisible) return; // double check visibility

        this.animationFrameId = requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        if (this.mixer) this.mixer.update(delta);
        this.renderer.render(this.scene, this.camera);
    }
}

document.addEventListener('DOMContentLoaded', () => {

    // Helper: Delay initialization slightly to prioritize main content paint
    setTimeout(() => {
        new AvatarZone({
            id: 'HERO',
            containerId: 'avatar-zone-hero',
            modelFile: 'Entry',
            animations: [
                { name: 'ENTRY', file: 'Entry', loopOnce: true, next: 'HAPPY_IDLE' },
                { name: 'HAPPY_IDLE', file: '000 Happy Idle', loopOnce: false }
            ]
        });

        new AvatarZone({
            id: 'WAVE',
            containerId: 'avatar-zone-wave',
            modelFile: 'Treading Water',
            animations: [
                { name: 'TREADING', file: 'Treading Water', loopOnce: false }
            ]
        });
    }, 100); // 100ms delay helps Lighthouse score / perceived load

});
