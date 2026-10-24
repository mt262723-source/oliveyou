/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { 
  WaterQualityDataPoint, 
  SimulationParameters, 
  RiskLevel 
} from '../types/waterQuality';
import { 
  CloudRain, 
  Sprout, 
  Layers, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle,
  Info,
  Maximize2
} from 'lucide-react';

interface River3DTelemetryViewerProps {
  data: WaterQualityDataPoint;
  simParams: SimulationParameters;
  overallLevel: RiskLevel;
  selectedZone: 'upstream' | 'midstream' | 'downstream';
  onSelectZone: (zone: 'upstream' | 'midstream' | 'downstream') => void;
  onUpdateSimParams: (params: Partial<SimulationParameters>) => void;
}

export const River3DTelemetryViewer: React.FC<River3DTelemetryViewerProps> = ({
  data,
  simParams,
  overallLevel,
  selectedZone,
  onSelectZone,
  onUpdateSimParams,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGlFailed, setWebGlFailed] = useState(false);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const rainSystemRef = useRef<THREE.Points | null>(null);
  const runoffParticlesRef = useRef<THREE.Points | null>(null);
  const bufferTreesRef = useRef<THREE.Group | null>(null);
  const fishGroupRef = useRef<THREE.Group | null>(null);
  const zoneMeshesRef = useRef<{ [key: string]: THREE.Object3D }>({});

  // Target camera positions for smooth interpolation
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(26, 22, 28));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.5, 0));

  // Dynamic parameters state ref for 60fps render loop
  const dynamicStateRef = useRef({
    rainfall: simParams.rainfallMmPerHour,
    turbidity: data.turbidityNTU,
    nitrate: data.nitrateMgL,
    phosphate: data.phosphateMgL,
    doVal: data.dissolvedOxygenMgL,
    hasBuffer: simParams.vegetatedBufferActive,
    fertilizerIntensity: simParams.fertilizerIntensity,
    selectedZone,
  });

  useEffect(() => {
    dynamicStateRef.current = {
      rainfall: simParams.rainfallMmPerHour,
      turbidity: data.turbidityNTU,
      nitrate: data.nitrateMgL,
      phosphate: data.phosphateMgL,
      doVal: data.dissolvedOxygenMgL,
      hasBuffer: simParams.vegetatedBufferActive,
      fertilizerIntensity: simParams.fertilizerIntensity,
      selectedZone,
    };
  }, [data, simParams, selectedZone]);

  // Set camera target coordinates based on zone
  const updateCameraTarget = useCallback((zone: 'upstream' | 'midstream' | 'downstream') => {
    switch (zone) {
      case 'upstream':
        targetCamPosRef.current.set(-16, 17, 24);
        targetLookAtRef.current.set(-15, 2.5, 0);
        break;
      case 'midstream':
        targetCamPosRef.current.set(0, 15, 22);
        targetLookAtRef.current.set(-1, 1.5, 0);
        break;
      case 'downstream':
        targetCamPosRef.current.set(18, 12, 20);
        targetLookAtRef.current.set(13, 0.2, 0);
        break;
    }
  }, []);

  useEffect(() => {
    updateCameraTarget(selectedZone);
  }, [selectedZone, updateCameraTarget]);

  // Reset to bird-eye overview
  const handleResetCamera = () => {
    targetCamPosRef.current.set(26, 22, 28);
    targetLookAtRef.current.set(0, 1.5, 0);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL or failure
    let isSoftwareGl = false;
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
      if (!gl) {
        setWebGlFailed(true);
        return;
      }
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const rendererStr = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
      isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);
    } catch {
      setWebGlFailed(true);
      return;
    }

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf1f5f9); // Clean slate-100 tone
    scene.fog = new THREE.Fog(0xf1f5f9, 45, 120);

    // 2. Camera Setup (Isometric 2.5D perspective)
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 460;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 300);
    camera.position.set(26, 22, 28);
    cameraRef.current = camera;

    // 3. Renderer Setup
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setWebGlFailed(true);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls with restrained angles for stable 2.5D viewing
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minPolarAngle = Math.PI / 6; // 30 deg - don't go too vertical
    controls.maxPolarAngle = Math.PI / 2.15; // 83 deg - stay above ground
    controls.minDistance = 12;
    controls.maxDistance = 80;
    controls.target.set(0, 1.5, 0);
    controlsRef.current = controls;

    // 5. Directional & Environmental Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x475569, 0.65);
    hemiLight.position.set(0, 35, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    sunLight.position.set(24, 38, 18);
    sunLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 10;
      sunLight.shadow.camera.far = 80;
      sunLight.shadow.camera.left = -26;
      sunLight.shadow.camera.right = 26;
      sunLight.shadow.camera.top = 26;
      sunLight.shadow.camera.bottom = -26;
      sunLight.shadow.bias = -0.001;
    }
    scene.add(sunLight);

    // 6. Master Terrain Root
    const terrainRoot = new THREE.Group();
    scene.add(terrainRoot);

    // ==========================================
    // (A) STRATIFIED BASE CAISSON (Subsurface bedrock & soil strata)
    // ==========================================
    const caissonGeo = new THREE.BoxGeometry(48, 4, 32);
    const caissonMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // slate-700 bedrock
      roughness: 0.95,
    });
    const caissonMesh = new THREE.Mesh(caissonGeo, caissonMat);
    caissonMesh.position.set(0, -2, 0);
    caissonMesh.receiveShadow = !isSoftwareGl;
    terrainRoot.add(caissonMesh);

    // Subsoil layer stripe (Clay/Loam horizon)
    const subsoilGeo = new THREE.BoxGeometry(48.1, 1.2, 32.1);
    const subsoilMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // amber-900 clay
      roughness: 0.9,
    });
    const subsoilMesh = new THREE.Mesh(subsoilGeo, subsoilMat);
    subsoilMesh.position.set(0, -0.6, 0);
    terrainRoot.add(subsoilMesh);

    // ==========================================
    // (B) SECTION 1: UPSTREAM FARMLAND (X: -24 to -6)
    // ==========================================
    const farmGroup = new THREE.Group();
    farmGroup.name = 'zone_upstream';
    terrainRoot.add(farmGroup);
    zoneMeshesRef.current.upstream = farmGroup;

    // Elevated Farmland Plateau
    const farmSoilGeo = new THREE.BoxGeometry(18, 3.2, 31.8);
    const farmSoilMat = new THREE.MeshStandardMaterial({
      color: 0x452b14, // rich fertile dark loam
      roughness: 0.88,
    });
    const farmSoilMesh = new THREE.Mesh(farmSoilGeo, farmSoilMat);
    farmSoilMesh.position.set(-15, 1.6, 0);
    farmSoilMesh.receiveShadow = !isSoftwareGl;
    farmSoilMesh.castShadow = !isSoftwareGl;
    farmGroup.add(farmSoilMesh);

    // Furrow Ridges (Agricultural cultivation lines)
    const furrowGeo = new THREE.CylinderGeometry(0.25, 0.25, 30, 8);
    furrowGeo.rotateX(Math.PI / 2);
    const furrowMat = new THREE.MeshStandardMaterial({ color: 0x38230f, roughness: 0.9 });
    for (let x = -22; x <= -8; x += 1.8) {
      const ridge = new THREE.Mesh(furrowGeo, furrowMat);
      ridge.position.set(x, 3.25, 0);
      farmGroup.add(ridge);
    }

    // Crop Rows (Paddy/Corn stalks)
    const stalkGeo = new THREE.ConeGeometry(0.18, 1.1, 5);
    const stalkMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.6 });
    for (let x = -21.5; x <= -8.5; x += 1.8) {
      for (let z = -13; z <= 13; z += 1.6) {
        const stalk = new THREE.Mesh(stalkGeo, stalkMat);
        stalk.position.set(x, 3.75, z + (Math.random() - 0.5) * 0.3);
        stalk.rotation.y = Math.random() * Math.PI;
        farmGroup.add(stalk);
      }
    }

    // Farmland Farmhouse & Silo landmark
    const barnGeo = new THREE.BoxGeometry(2.4, 2, 3.2);
    const barnMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.7 });
    const barn = new THREE.Mesh(barnGeo, barnMat);
    barn.position.set(-21, 4.2, -10);
    farmGroup.add(barn);

    const roofGeo = new THREE.ConeGeometry(2.2, 1.4, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(-21, 5.8, -10);
    farmGroup.add(roof);

    // ==========================================
    // (C) SECTION 2: MIDSTREAM BUFFER ZONE (X: -6 to 2)
    // ==========================================
    const bufferGroup = new THREE.Group();
    bufferGroup.name = 'zone_midstream';
    terrainRoot.add(bufferGroup);
    zoneMeshesRef.current.midstream = bufferGroup;

    // Sloped terrace connecting farmland to river
    const bufferSoilGeo = new THREE.BoxGeometry(8, 2.2, 31.8);
    const bufferSoilMat = new THREE.MeshStandardMaterial({
      color: 0x2d6a4f, // Lush vegetative green
      roughness: 0.9,
    });
    const bufferSoilMesh = new THREE.Mesh(bufferSoilGeo, bufferSoilMat);
    bufferSoilMesh.position.set(-2, 1.1, 0);
    bufferSoilMesh.receiveShadow = !isSoftwareGl;
    bufferGroup.add(bufferSoilMesh);

    // Multi-tier Riparian Buffer Plants
    const bufferPlants = new THREE.Group();
    bufferGroup.add(bufferPlants);
    bufferTreesRef.current = bufferPlants;

    // Zone 1: Riparian Trees (Willows / Alders) along stream bank
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.32, 2.8, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3f2e18, roughness: 0.9 });
    const canopyGeo = new THREE.SphereGeometry(1.4, 7, 7);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.75 });

    for (let z = -13; z <= 13; z += 3.6) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 3.4;
      trunk.castShadow = !isSoftwareGl;
      tree.add(trunk);

      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.y = 4.8;
      canopy.scale.set(1, 1.2, 1);
      canopy.castShadow = !isSoftwareGl;
      tree.add(canopy);

      tree.position.set(0.5 + (Math.random() - 0.5) * 1.2, 0, z);
      bufferPlants.add(tree);
    }

    // Zone 2: Shrub / Reed vegetation along mid-slope
    const reedGeo = new THREE.CylinderGeometry(0.04, 0.08, 1.6, 5);
    const reedMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });
    for (let z = -14; z <= 14; z += 1.2) {
      for (let x = -4.5; x <= -1.5; x += 1.4) {
        const reed = new THREE.Mesh(reedGeo, reedMat);
        reed.position.set(x + (Math.random() - 0.5) * 0.4, 2.8, z + (Math.random() - 0.5) * 0.4);
        reed.rotation.z = (Math.random() - 0.5) * 0.25;
        bufferPlants.add(reed);
      }
    }

    // ==========================================
    // (D) SECTION 3: DOWNSTREAM RIVER CHANNEL & BASIN (X: 2 to 24)
    // ==========================================
    const downstreamGroup = new THREE.Group();
    downstreamGroup.name = 'zone_downstream';
    terrainRoot.add(downstreamGroup);
    zoneMeshesRef.current.downstream = downstreamGroup;

    // Sunken Riverbed Terrain (Gravel / Sand / Silt)
    const riverbedGeo = new THREE.BoxGeometry(22, 1.4, 31.8);
    const riverbedMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // slate-800 silt
      roughness: 0.95,
    });
    const riverbedMesh = new THREE.Mesh(riverbedGeo, riverbedMat);
    riverbedMesh.position.set(13, 0.2, 0);
    riverbedMesh.receiveShadow = !isSoftwareGl;
    downstreamGroup.add(riverbedMesh);

    // River embankment slope
    const bankGeo = new THREE.BoxGeometry(2, 1.8, 31.8);
    const bankMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
    const bankMesh = new THREE.Mesh(bankGeo, bankMat);
    bankMesh.position.set(2, 0.6, 0);
    downstreamGroup.add(bankMesh);

    // 7. Dynamic River Water Mesh (Surface with wave animation)
    const waterGeo = new THREE.PlaneGeometry(20, 31.8, 36, 48);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7, // sky-cyan
      roughness: 0.12,
      metalness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.85,
      transparent: true,
      opacity: isSoftwareGl ? 0.78 : 0.9,
      ior: 1.333,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(13, 1.25, 0);
    downstreamGroup.add(waterMesh);
    waterMeshRef.current = waterMesh;

    // River Monitoring Buoy / Station beacon
    const buoyGroup = new THREE.Group();
    const buoyBodyGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.8, 8);
    const buoyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
    const buoyBody = new THREE.Mesh(buoyBodyGeo, buoyMat);
    buoyBody.position.y = 1.6;
    buoyGroup.add(buoyBody);

    const mastGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 4);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.y = 2.4;
    buoyGroup.add(mast);

    const beaconLight = new THREE.PointLight(0x06b6d4, 1.5, 6);
    beaconLight.position.y = 3.1;
    buoyGroup.add(beaconLight);

    buoyGroup.position.set(15, 0, 4);
    downstreamGroup.add(buoyGroup);

    // Swimming fish group
    const fishGroup = new THREE.Group();
    const fishGeo = new THREE.ConeGeometry(0.3, 1.2, 5);
    fishGeo.rotateZ(Math.PI / 2);
    const fishMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const fish = new THREE.Mesh(fishGeo, fishMat);
    fishGroup.add(fish);
    fishGroup.position.set(12, 0.6, 0);
    downstreamGroup.add(fishGroup);
    fishGroupRef.current = fishGroup;

    // ==========================================
    // (E) PARTICLE SYSTEMS: RAIN & NUTRIENT RUNOFF
    // ==========================================
    // 1. Vertical Rain Streaks
    const rainCount = 700;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = -24 + Math.random() * 46;
      rainPositions[i * 3 + 1] = Math.random() * 26;
      rainPositions[i * 3 + 2] = -16 + Math.random() * 32;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.22,
      transparent: true,
      opacity: 0.65,
    });
    const rainPoints = new THREE.Points(rainGeo, rainMat);
    scene.add(rainPoints);
    rainSystemRef.current = rainPoints;

    // 2. Agricultural Runoff Particles (Nutrient flow cascades)
    const runoffCount = 180;
    const runoffGeo = new THREE.BufferGeometry();
    const runoffPos = new Float32Array(runoffCount * 3);
    for (let i = 0; i < runoffCount; i++) {
      runoffPos[i * 3] = -18 + Math.random() * 12; // Start on farmland
      runoffPos[i * 3 + 1] = 3.3;
      runoffPos[i * 3 + 2] = -14 + Math.random() * 28;
    }
    runoffGeo.setAttribute('position', new THREE.BufferAttribute(runoffPos, 3));
    const runoffMat = new THREE.PointsMaterial({
      color: 0xfacc15, // Golden yellow fertilizer ions
      size: 0.38,
      transparent: true,
      opacity: 0.85,
    });
    const runoffPoints = new THREE.Points(runoffGeo, runoffMat);
    scene.add(runoffPoints);
    runoffParticlesRef.current = runoffPoints;

    // ==========================================
    // (F) RAYCASTING FOR DIRECT 3D CLICKING
    // ==========================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        [farmSoilMesh, bufferSoilMesh, waterMesh, riverbedMesh],
        true
      );

      if (intersects.length > 0) {
        const hitX = intersects[0].point.x;
        if (hitX < -6) {
          onSelectZone('upstream');
        } else if (hitX < 2) {
          onSelectZone('midstream');
        } else {
          onSelectZone('downstream');
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // ==========================================
    // (G) ANIMATION LOOP
    // ==========================================
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const current = dynamicStateRef.current;

      // 1. Smooth Camera Lerping towards target coordinates
      if (cameraRef.current && controlsRef.current) {
        camera.position.lerp(targetCamPosRef.current, 0.04);
        controls.target.lerp(targetLookAtRef.current, 0.04);
        controls.update();
      }

      // 2. Dynamic River Water Wave & Coloration
      if (waterMeshRef.current) {
        const mat = waterMeshRef.current.material as THREE.MeshPhysicalMaterial;

        // Shift water color based on realistic water chemistry
        if (current.turbidity >= 15) {
          // Turbid silt runoff
          mat.color.setHex(0x92400e);
        } else if (current.nitrate >= 4.5 || current.phosphate >= 0.15) {
          // Eutrophic algal blooms
          mat.color.setHex(0x4d7c0f);
        } else if (current.doVal <= 5.0) {
          // Hypoxic oxygen depletion
          mat.color.setHex(0x334155);
        } else {
          // Healthy clean clear water
          mat.color.setHex(0x0284c7);
        }

        // Animate wave displacement
        const posAttr = waterGeo.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
          const u = posAttr.getX(i);
          const v = posAttr.getZ(i);
          const waveHeight =
            Math.sin(u * 0.6 + elapsed * 2.8) * 0.07 +
            Math.cos(v * 0.4 + elapsed * 2.2) * 0.05;
          posAttr.setY(i, waveHeight);
        }
        posAttr.needsUpdate = true;
      }

      // 3. Rain particles
      if (rainSystemRef.current) {
        const isRaining = current.rainfall > 0.5;
        rainSystemRef.current.visible = isRaining;
        if (isRaining) {
          const rainPos = rainGeo.attributes.position;
          const fallSpeed = (current.rainfall / 20) * 0.35 + 0.35;
          for (let i = 0; i < rainCount; i++) {
            let y = rainPos.getY(i) - fallSpeed;
            if (y < 0) y = 25 + Math.random() * 4;
            rainPos.setY(i, y);
          }
          rainPos.needsUpdate = true;
        }
      }

      // 4. Fertilizer Runoff cascading flow
      if (runoffParticlesRef.current) {
        const isFlowing = current.rainfall > 2.0 && current.fertilizerIntensity !== 'low';
        runoffParticlesRef.current.visible = isFlowing;

        if (isFlowing) {
          const pos = runoffGeo.attributes.position;
          const speed = (current.rainfall / 15) * 0.08 + 0.04;

          for (let i = 0; i < runoffCount; i++) {
            let x = pos.getX(i) + speed;
            let y = pos.getY(i);

            // Slope trajectory
            if (x < -6) {
              y = 3.3; // Farmland
            } else if (x < 2) {
              // Passing through Buffer Zone
              if (current.hasBuffer) {
                // Buffer zone absorbs nutrients! Fade out / reset
                x = -20 + Math.random() * 4;
                y = 3.3;
              } else {
                // No buffer: washes down slope
                y = 3.3 - ((x + 6) / 8) * 2.1;
              }
            } else if (x < 18) {
              // River channel
              y = 1.25;
            } else {
              // End of stream, recycle
              x = -18 - Math.random() * 4;
              y = 3.3;
            }

            pos.setX(i, x);
            pos.setY(i, y);
          }
          pos.needsUpdate = true;
        }
      }

      // 5. Buffer vegetation visibility & scale
      if (bufferTreesRef.current) {
        bufferTreesRef.current.visible = current.hasBuffer;
      }

      // 6. Fish movement (swims slowly if hypoxic)
      if (fishGroupRef.current) {
        const fishSpeed = current.doVal <= 4.0 ? 0.3 : 1.4;
        const fishZ = Math.sin(elapsed * fishSpeed * 0.6) * 11;
        const fishY = current.doVal <= 4.0 ? 0.9 : 0.5 + Math.sin(elapsed * 2) * 0.2;
        fishGroupRef.current.position.set(13 + Math.cos(elapsed * 0.7) * 2, fishY, fishZ);
        fishGroupRef.current.rotation.y = Math.sin(elapsed * fishSpeed * 0.6) > 0 ? 0 : Math.PI;
      }

      // 7. Buoy Bobbing
      buoyGroup.position.y = Math.sin(elapsed * 2.5) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.dispose();
      scene.clear();
    };
  }, [onSelectZone]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs relative">
      {/* 🌟 3D HUD TOP OVERLAY: Section Tabs & Legend */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-slate-900/90 text-white px-3 py-1.5 rounded-lg border border-slate-700 backdrop-blur-xs flex items-center gap-2 pointer-events-auto shadow-md">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-bold">하천 유역 3대 구간 2.5D 시뮬레이션 모델</span>
        </div>

        {/* 🌟 3 DIRECT SECTION SWITCH BUTTONS */}
        <div className="bg-slate-900/90 p-1 rounded-lg border border-slate-700 backdrop-blur-xs flex items-center gap-1 pointer-events-auto shadow-md text-xs font-semibold">
          <button
            onClick={() => {
              onSelectZone('upstream');
              updateCameraTarget('upstream');
            }}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedZone === 'upstream'
                ? 'bg-amber-600 text-white shadow-xs font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            ① 상류 (농경지)
          </button>

          <button
            onClick={() => {
              onSelectZone('midstream');
              updateCameraTarget('midstream');
            }}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedZone === 'midstream'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            ② 가운데 (완충지대)
          </button>

          <button
            onClick={() => {
              onSelectZone('downstream');
              updateCameraTarget('downstream');
            }}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedZone === 'downstream'
                ? 'bg-cyan-600 text-white shadow-xs font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
            ③ 하류 (수생태계)
          </button>

          <button
            onClick={handleResetCamera}
            title="전체 조망으로 카메라 리셋"
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer ml-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas or SVG Fallback */}
      {!webGlFailed ? (
        <div
          ref={mountRef}
          className="w-full h-[380px] sm:h-[440px] bg-slate-100 cursor-grab active:cursor-grabbing relative"
        />
      ) : (
        /* Zero-Crash SVG 2.5D Fallback for Low-spec/No-WebGL Environments */
        <div className="w-full h-[380px] sm:h-[440px] bg-slate-900 p-6 flex flex-col justify-between text-white relative">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              WebGL 가속 미지원 환경 - 2.5D 고정밀 등각 모형 렌더링 모드
            </span>
            <span className="text-xs text-slate-400">안정적 시각화 작동 중</span>
          </div>

          <div className="grid grid-cols-3 gap-3 my-auto text-center">
            <div
              onClick={() => onSelectZone('upstream')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedZone === 'upstream'
                  ? 'border-amber-500 bg-amber-950/40'
                  : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-bold text-amber-400 block mb-1">구역 ① 상류 농경지</span>
              <p className="text-[11px] text-slate-300">비료 시비 및 표토 침식 발생지</p>
            </div>

            <div
              onClick={() => onSelectZone('midstream')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedZone === 'midstream'
                  ? 'border-emerald-500 bg-emerald-950/40'
                  : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-bold text-emerald-400 block mb-1">구역 ② 가운데 완충대</span>
              <p className="text-[11px] text-slate-300">수변 수목·초본 여과 및 탈질대</p>
            </div>

            <div
              onClick={() => onSelectZone('downstream')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedZone === 'downstream'
                  ? 'border-cyan-500 bg-cyan-950/40'
                  : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-bold text-cyan-400 block mb-1">구역 ③ 하류 본류</span>
              <p className="text-[11px] text-slate-300">용존산소 및 조류 모니터링 지점</p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            * 상단 버튼이나 구역 카드를 클릭하면 해당 구간의 7개 세부 수질 측정치가 즉시 하단에 표시됩니다.
          </div>
        </div>
      )}

      {/* 🌟 3D HUD BOTTOM STATUS STRIP */}
      <div className="absolute bottom-16 left-3 right-3 z-10 pointer-events-none flex items-center justify-between">
        <div className="bg-slate-900/85 text-white px-2.5 py-1 rounded-md text-[11px] backdrop-blur-xs border border-slate-700 pointer-events-auto">
          마우스 드래그: 회전 · 휠: 확대/축소 · 3D 지형을 직접 클릭하면 해당 구역으로 초점이 이동합니다.
        </div>
      </div>

      {/* 🌟 TWO DIRECT CONTROLLERS: RAINFALL GENERATOR & FERTILIZER INTENSITY */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Controller 1: 모의 강우 발생기 (내가 선택 가능) */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-cyan-700" />
              모의 강우 발생기 (강우량 조절)
            </span>
            <span className="font-mono font-bold text-cyan-800 text-sm tabular-nums">
              {simParams.rainfallMmPerHour} mm/h
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={80}
            step={1}
            value={simParams.rainfallMmPerHour}
            onChange={(e) => onUpdateSimParams({ rainfallMmPerHour: Number(e.target.value) })}
            className="w-full accent-cyan-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>맑음(0)</span>
            <span>보통 비(25)</span>
            <span>집중호우(50)</span>
            <span>극한폭우(80)</span>
          </div>
        </div>

        {/* Controller 2: 상류 시비 강도 (내가 선택 가능) */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-700" />
              상류 농경지 시비 강도 (비료 투입량)
            </span>
            <span className="font-bold text-slate-700">
              {simParams.fertilizerIntensity === 'high'
                ? '과다 투입 (+80%)'
                : simParams.fertilizerIntensity === 'low'
                ? '소량 투입 (-40%)'
                : '표준 적정량'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-0.5">
            {(['low', 'normal', 'high'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => onUpdateSimParams({ fertilizerIntensity: lvl })}
                className={`py-1.5 rounded-lg text-center font-bold transition-colors cursor-pointer ${
                  simParams.fertilizerIntensity === lvl
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lvl === 'low' ? '소량 시비' : lvl === 'normal' ? '적정 시비' : '과다 시비'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
