"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  BufferGeometry,
  Intersection,
  Material,
  Mesh,
  Object3D,
  Texture,
} from "three";
import styles from "./page.module.css";
import type { PointerLockControls as PointerLockControlsType } from "three/examples/jsm/controls/PointerLockControls";

type ThreeModule = typeof import("three");
type PointerLockControlsModule = typeof import("three/examples/jsm/controls/PointerLockControls");

type BlockType =
  | "grass"
  | "dirt"
  | "stone"
  | "sand"
  | "water"
  | "log"
  | "leaves";

const BLOCK_LABELS: Record<BlockType, string> = {
  grass: "Grass",
  dirt: "Dirt",
  stone: "Stone",
  sand: "Sand",
  water: "Water",
  log: "Wood",
  leaves: "Leaves",
};

const BLOCK_SWATCHES: Record<BlockType, string> = {
  grass: "linear-gradient(180deg, #4caf50 0%, #3e872f 60%, #3a5f26 100%)",
  dirt: "linear-gradient(180deg, #7a5030 0%, #5c3a20 100%)",
  stone: "linear-gradient(180deg, #9ea4a8 0%, #72787c 100%)",
  sand: "linear-gradient(180deg, #f1db95 0%, #d7c179 100%)",
  water: "linear-gradient(180deg, rgba(64, 142, 255, 0.9) 0%, rgba(32, 82, 190, 0.9) 100%)",
  log: "linear-gradient(180deg, #a0703c 0%, #6d4a24 100%)",
  leaves: "linear-gradient(180deg, rgba(90, 156, 60, 0.95) 0%, rgba(54, 116, 38, 0.95) 100%)",
};

const SELECTABLE_BLOCKS: BlockType[] = [
  "grass",
  "dirt",
  "stone",
  "sand",
  "log",
  "leaves",
  "water",
];

const THREE_MODULE_URL =
  "https://unpkg.com/three@0.160.0/build/three.module.js?module";
const POINTER_LOCK_URL =
  "https://unpkg.com/three@0.160.0/examples/jsm/controls/PointerLockControls.js?module";

let cachedThreePromise: Promise<ThreeModule> | null = null;
let cachedPointerLockPromise: Promise<PointerLockControlsModule> | null = null;

const loadThree = async (): Promise<ThreeModule> => {
  if (!cachedThreePromise) {
    cachedThreePromise = import(
      /* webpackIgnore: true */ THREE_MODULE_URL
    ) as Promise<ThreeModule>;
  }
  return cachedThreePromise;
};

const loadPointerLockControls = async (): Promise<PointerLockControlsModule> => {
  if (!cachedPointerLockPromise) {
    cachedPointerLockPromise = import(
      /* webpackIgnore: true */ POINTER_LOCK_URL
    ) as Promise<PointerLockControlsModule>;
  }
  return cachedPointerLockPromise;
};

const solidBlocks: ReadonlySet<BlockType> = new Set<BlockType>([
  "grass",
  "dirt",
  "stone",
  "sand",
  "log",
  "leaves",
]);

const SEA_LEVEL = 2;
const BASE_DEPTH = -2;
const WORLD_RADIUS = 28;
const PLAYER_EYE_HEIGHT = 1.7;
const MOVE_SPEED = 28;
const DECELERATION = 12;
const MAX_BUILD_HEIGHT = 48;

const getBlockKey = (x: number, y: number, z: number): string => `${x}|${y}|${z}`;

const MinecraftPage = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const selectedBlockRef = useRef<BlockType>(SELECTABLE_BLOCKS[0]);
  const [selectedBlock, setSelectedBlock] = useState<BlockType>(
    SELECTABLE_BLOCKS[0]
  );
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setBlockType = useCallback((type: BlockType) => {
    selectedBlockRef.current = type;
    setSelectedBlock(type);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }

    let active = true;
    let cleanup: (() => void) | undefined;

    const setup = async () => {
      try {
        setError(null);
        const [THREE, pointerLockModule] = await Promise.all([
          loadThree(),
          loadPointerLockControls(),
        ]);

        if (!active || !mountRef.current) {
          return;
        }

        if (typeof document === "undefined" || !("pointerLockElement" in document)) {
          setError("Pointer lock is not supported in this environment.");
          return;
        }

        const mountElement = mountRef.current;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87ceeb);
        scene.fog = new THREE.Fog(0x87ceeb, 60, 220);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(mountElement.clientWidth, mountElement.clientHeight, false);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        renderer.domElement.style.display = "block";
        renderer.domElement.style.cursor = "crosshair";
        renderer.domElement.style.touchAction = "none";
        renderer.domElement.tabIndex = 0;
        mountElement.appendChild(renderer.domElement);

        const camera = new THREE.PerspectiveCamera(
          70,
          mountElement.clientWidth / mountElement.clientHeight,
          0.1,
          600
        );

        const controls: PointerLockControlsType = new pointerLockModule.PointerLockControls(
          camera,
          renderer.domElement
        );
        controls.connect();
        scene.add(controls.getObject());

        const clock = new THREE.Clock();
        const pointer = new THREE.Vector2(0, 0);
        const raycaster = new THREE.Raycaster();
        const velocity = new THREE.Vector3();
        const direction = new THREE.Vector3();
        const previousPosition = new THREE.Vector3();
        let maxWorldHeight = 16;

        const texturesToDispose: Texture[] = [];
        const materialsToDispose: Material[] = [];
        const geometriesToDispose: BufferGeometry[] = [];

        const registerTexture = (texture: Texture): Texture => {
          texturesToDispose.push(texture);
          return texture;
        };

        const registerMaterial = <T extends Material>(material: T): T => {
          materialsToDispose.push(material);
          return material;
        };

        const registerGeometry = <T extends BufferGeometry>(geometry: T): T => {
          geometriesToDispose.push(geometry);
          return geometry;
        };

        const createCanvasTexture = (
          draw: (ctx: CanvasRenderingContext2D, size: number) => void
        ): Texture => {
          const size = 64;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            throw new Error("Unable to acquire 2D context for textures");
          }
          ctx.imageSmoothingEnabled = false;
          draw(ctx, size);
          const texture = registerTexture(new THREE.CanvasTexture(canvas));
          texture.magFilter = THREE.NearestFilter;
          texture.minFilter = THREE.NearestMipMapNearestFilter;
          texture.needsUpdate = true;
          texture.colorSpace = THREE.SRGBColorSpace;
          return texture;
        };

        const createNoise = (
          ctx: CanvasRenderingContext2D,
          size: number,
          colors: string[],
          density: number
        ) => {
          const cell = size / 8;
          for (let i = 0; i < density; i += 1) {
            const color = colors[i % colors.length];
            ctx.fillStyle = color;
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            const w = cell * (Math.random() * 0.6 + 0.4);
            const h = cell * (Math.random() * 0.6 + 0.4);
            ctx.fillRect(x, y, w, h);
          }
        };

        const createBlockMaterials = (): Record<BlockType, Material[]> => {
          const grassTopTexture = createCanvasTexture((ctx, size) => {
            ctx.fillStyle = "#45a142";
            ctx.fillRect(0, 0, size, size);
            createNoise(ctx, size, ["#3a8c36", "#2e6d28", "#51b64c"], 180);
          });

          const grassSideTexture = createCanvasTexture((ctx, size) => {
            ctx.fillStyle = "#5a3c1e";
            ctx.fillRect(0, 0, size, size);
            ctx.fillStyle = "#3a8c36";
            ctx.fillRect(0, 0, size, size * 0.32);
            ctx.fillStyle = "#326e2d";
            ctx.fillRect(0, size * 0.28, size, size * 0.05);
            createNoise(ctx, size, ["rgba(53, 82, 31, 0.75)", "rgba(94, 61, 32, 0.6)"], 120);
          });

          const dirtTexture = createCanvasTexture((ctx, size) => {
            ctx.fillStyle = "#6f4a2a";
            ctx.fillRect(0, 0, size, size);
            createNoise(ctx, size, ["#8c5c36", "#5b3b21", "#7a4f2d"], 160);
          });

          const stoneTexture = createCanvasTexture((ctx, size) => {
            ctx.fillStyle = "#9da3a8";
            ctx.fillRect(0, 0, size, size);
            ctx.fillStyle = "#707579";
            for (let i = 0; i < 40; i += 1) {
              const w = size * (Math.random() * 0.25 + 0.05);
              const h = size * (Math.random() * 0.25 + 0.05);
              const x = Math.random() * (size - w);
              const y = Math.random() * (size - h);
              ctx.fillRect(x, y, w, h);
            }
          });

          const sandTexture = createCanvasTexture((ctx, size) => {
            ctx.fillStyle = "#e6d39a";
            ctx.fillRect(0, 0, size, size);
            createNoise(ctx, size, ["rgba(204, 176, 105, 0.7)", "rgba(232, 210, 155, 0.6)"], 140);
          });

          const logSideTexture = createCanvasTexture((ctx, size) => {
            ctx.fillStyle = "#80562c";
            ctx.fillRect(0, 0, size, size);
            ctx.strokeStyle = "rgba(56, 33, 16, 0.6)";
            ctx.lineWidth = size * 0.08;
            for (let x = size * 0.15; x < size; x += size * 0.22) {
              ctx.beginPath();
              ctx.moveTo(x, 0);
              ctx.lineTo(x, size);
              ctx.stroke();
            }
          });

          const logTopTexture = createCanvasTexture((ctx, size) => {
            ctx.fillStyle = "#9b6b36";
            ctx.fillRect(0, 0, size, size);
            ctx.strokeStyle = "#5f3b1c";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size * 0.28, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size * 0.16, 0, Math.PI * 2);
            ctx.stroke();
          });

          const leavesTexture = createCanvasTexture((ctx, size) => {
            ctx.fillStyle = "rgba(74, 134, 46, 0.9)";
            ctx.fillRect(0, 0, size, size);
            createNoise(
              ctx,
              size,
              ["rgba(99, 168, 62, 0.85)", "rgba(52, 102, 38, 0.8)", "rgba(123, 184, 79, 0.75)"],
              200
            );
          });

          const makeLambert = (texture: Texture) =>
            registerMaterial(
              new THREE.MeshLambertMaterial({
                map: texture,
              })
            );

          const fillWith = (material: Material): Material[] => [
            material,
            material,
            material,
            material,
            material,
            material,
          ];

          const grassTopMaterial = makeLambert(grassTopTexture);
          const grassSideMaterial = makeLambert(grassSideTexture);
          const grassBottomMaterial = makeLambert(dirtTexture);

          const dirtMaterial = makeLambert(dirtTexture);
          const stoneMaterial = makeLambert(stoneTexture);
          const sandMaterial = makeLambert(sandTexture);

          const logSideMaterial = makeLambert(logSideTexture);
          const logTopMaterial = makeLambert(logTopTexture);

          const leavesMaterial = registerMaterial(
            new THREE.MeshLambertMaterial({
              map: leavesTexture,
              transparent: true,
              opacity: 0.9,
            })
          );

          const waterMaterial = registerMaterial(
            new THREE.MeshPhongMaterial({
              color: 0x2f7bff,
              transparent: true,
              opacity: 0.65,
              shininess: 90,
              specular: 0x9fc2ff,
              side: THREE.DoubleSide,
              depthWrite: false,
            })
          );

          return {
            grass: [
              grassSideMaterial,
              grassSideMaterial,
              grassTopMaterial,
              grassBottomMaterial,
              grassSideMaterial,
              grassSideMaterial,
            ],
            dirt: fillWith(dirtMaterial),
            stone: fillWith(stoneMaterial),
            sand: fillWith(sandMaterial),
            water: fillWith(waterMaterial),
            log: [
              logSideMaterial,
              logSideMaterial,
              logTopMaterial,
              logTopMaterial,
              logSideMaterial,
              logSideMaterial,
            ],
            leaves: fillWith(leavesMaterial),
          } satisfies Record<BlockType, Material[]>;
        };

        const blockMaterials = createBlockMaterials();
        const blockGeometry = registerGeometry(new THREE.BoxGeometry(1, 1, 1));
        const highlightGeometry = registerGeometry(
          new THREE.BoxGeometry(1.02, 1.02, 1.02)
        );
        const highlightMaterial = registerMaterial(
          new THREE.MeshBasicMaterial({
            color: 0xfff2a8,
            wireframe: true,
            transparent: true,
            opacity: 0.85,
            depthTest: false,
          })
        );
        highlightMaterial.depthWrite = false;
        const highlightMesh = new THREE.Mesh(highlightGeometry, highlightMaterial);
        highlightMesh.visible = false;
        scene.add(highlightMesh);

        scene.add(new THREE.AmbientLight(0xffffff, 0.38));
        scene.add(new THREE.HemisphereLight(0xd1ecff, 0x3c2f1a, 0.45));
        const sun = new THREE.DirectionalLight(0xffffff, 0.78);
        sun.position.set(60, 120, 40);
        scene.add(sun);

        const worldGroup = new THREE.Group();
        scene.add(worldGroup);

        const blocks = new Map<string, { mesh: Mesh; type: BlockType }>();

        const addBlock = (x: number, y: number, z: number, type: BlockType) => {
          const key = getBlockKey(x, y, z);
          if (blocks.has(key)) {
            return;
          }
          const mesh = new THREE.Mesh(blockGeometry, blockMaterials[type]);
          mesh.position.set(x + 0.5, y + 0.5, z + 0.5);
          worldGroup.add(mesh);
          blocks.set(key, { mesh, type });
          maxWorldHeight = Math.max(maxWorldHeight, y + 3);
        };

        const removeBlock = (x: number, y: number, z: number) => {
          const key = getBlockKey(x, y, z);
          const entry = blocks.get(key);
          if (!entry) {
            return;
          }
          worldGroup.remove(entry.mesh);
          blocks.delete(key);
        };

        const getSurfaceHeight = (x: number, z: number): number => {
          for (let y = Math.min(maxWorldHeight, MAX_BUILD_HEIGHT); y >= BASE_DEPTH - 1; y -= 1) {
            const block = blocks.get(getBlockKey(x, y, z));
            if (block && solidBlocks.has(block.type)) {
              return y + 1;
            }
          }
          return SEA_LEVEL + 1;
        };

        const pseudoRandom = (x: number, z: number): number => {
          const seed = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453123;
          return seed - Math.floor(seed);
        };

        const sampleHeight = (x: number, z: number): number => {
          const ridge = Math.sin(x / 5.8) * 2.2 + Math.cos(z / 6.4) * 1.8;
          const swell = Math.sin((x + z) / 12.2) * 1.5;
          const detail = Math.sin(Math.hypot(x, z) / 7.3) * 0.8;
          const value = 2.2 + ridge + swell + detail;
          return Math.max(1, Math.floor(value));
        };

        const plantTree = (x: number, surfaceY: number, z: number, variance: number) => {
          const trunkHeight = 4 + Math.floor(variance * 3);
          for (let i = 0; i < trunkHeight; i += 1) {
            addBlock(x, surfaceY + i, z, "log");
          }
          const leafBase = surfaceY + trunkHeight - 2;
          for (let lx = -2; lx <= 2; lx += 1) {
            for (let lz = -2; lz <= 2; lz += 1) {
              for (let ly = 0; ly <= 3; ly += 1) {
                const distance = Math.abs(lx) + Math.abs(lz) + ly;
                if (distance <= 4) {
                  addBlock(x + lx, leafBase + ly, z + lz, "leaves");
                }
              }
            }
          }
        };

        for (let x = -WORLD_RADIUS; x <= WORLD_RADIUS; x += 1) {
          for (let z = -WORLD_RADIUS; z <= WORLD_RADIUS; z += 1) {
            addBlock(x, BASE_DEPTH, z, "stone");
            addBlock(x, BASE_DEPTH - 1, z, "stone");
            const height = sampleHeight(x, z);
            const radial = Math.sqrt(x * x + z * z);
            const coastLine = radial > WORLD_RADIUS - 5;
            let surfaceType: BlockType = "grass";
            for (let y = 0; y <= height; y += 1) {
              let blockType: BlockType;
              if (y === height) {
                if (height <= SEA_LEVEL + (coastLine ? 1 : 0)) {
                  blockType = "sand";
                } else if (height >= SEA_LEVEL + 5) {
                  blockType = "stone";
                } else {
                  blockType = coastLine ? "sand" : "grass";
                }
                surfaceType = blockType;
              } else if (y >= height - 2) {
                blockType = "dirt";
              } else {
                blockType = "stone";
              }
              addBlock(x, y, z, blockType);
            }

            if (height < SEA_LEVEL) {
              for (let waterY = height + 1; waterY <= SEA_LEVEL; waterY += 1) {
                addBlock(x, waterY, z, "water");
              }
              surfaceType = "water";
            }

            const treeChance = pseudoRandom(x, z);
            if (
              surfaceType === "grass" &&
              height > SEA_LEVEL + 1 &&
              radial < WORLD_RADIUS - 6 &&
              treeChance > 0.86
            ) {
              plantTree(x, height + 1, z, pseudoRandom(x + 13.7, z + 91.3));
            }
          }
        }

        const spawnColumn = { x: 2, z: -(WORLD_RADIUS - 6) };
        const spawnHeight = getSurfaceHeight(spawnColumn.x, spawnColumn.z);
        controls.getObject().position.set(
          spawnColumn.x + 0.5,
          spawnHeight + PLAYER_EYE_HEIGHT,
          spawnColumn.z + 0.5
        );
        camera.lookAt(new THREE.Vector3(0, SEA_LEVEL + 4, 0));

        const moveState = {
          forward: false,
          backward: false,
          left: false,
          right: false,
        };

        const pickBlock = (): Intersection | undefined => {
          raycaster.setFromCamera(pointer, camera);
          const intersections = raycaster.intersectObjects(
            worldGroup.children as Object3D[],
            false
          );
          return intersections[0];
        };

        const updateHighlight = () => {
          const hit = pickBlock();
          if (hit) {
            highlightMesh.visible = true;
            highlightMesh.position.copy((hit.object as Mesh).position);
          } else {
            highlightMesh.visible = false;
          }
        };

        const animate = () => {
          const delta = clock.getDelta();
          velocity.x -= velocity.x * DECELERATION * delta;
          velocity.z -= velocity.z * DECELERATION * delta;

          direction.set(0, 0, 0);
          if (moveState.forward) direction.z -= 1;
          if (moveState.backward) direction.z += 1;
          if (moveState.left) direction.x -= 1;
          if (moveState.right) direction.x += 1;
          if (direction.lengthSq() > 0) {
            direction.normalize();
            velocity.x -= direction.x * MOVE_SPEED * delta;
            velocity.z -= direction.z * MOVE_SPEED * delta;
          }

          const playerObject = controls.getObject();
          previousPosition.copy(playerObject.position);

          controls.moveRight(velocity.x * delta);
          controls.moveForward(velocity.z * delta);

          const currentX = Math.floor(playerObject.position.x);
          const currentZ = Math.floor(playerObject.position.z);
          const previousX = Math.floor(previousPosition.x);
          const previousZ = Math.floor(previousPosition.z);

          const nextSurface = getSurfaceHeight(currentX, currentZ);
          const previousSurface = getSurfaceHeight(previousX, previousZ);

          if (nextSurface - previousSurface > 1.25) {
            playerObject.position.set(previousPosition.x, previousPosition.y, previousPosition.z);
          }

          const settledSurface = getSurfaceHeight(
            Math.floor(playerObject.position.x),
            Math.floor(playerObject.position.z)
          );
          playerObject.position.y = settledSurface + PLAYER_EYE_HEIGHT;

          updateHighlight();
          renderer.render(scene, camera);
        };

        renderer.setAnimationLoop(animate);

        const onResize = () => {
          if (!mountRef.current) {
            return;
          }
          const { clientWidth, clientHeight } = mountRef.current;
          camera.aspect = clientWidth / clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(clientWidth, clientHeight, false);
        };

        const cycleSelection = (direction: number) => {
          const currentIndex = SELECTABLE_BLOCKS.indexOf(selectedBlockRef.current);
          const nextIndex =
            (currentIndex + direction + SELECTABLE_BLOCKS.length) %
            SELECTABLE_BLOCKS.length;
          setBlockType(SELECTABLE_BLOCKS[nextIndex]);
        };

        const onKeyDown = (event: KeyboardEvent) => {
          switch (event.code) {
            case "KeyW":
            case "ArrowUp":
              moveState.forward = true;
              break;
            case "KeyS":
            case "ArrowDown":
              moveState.backward = true;
              break;
            case "KeyA":
            case "ArrowLeft":
              moveState.left = true;
              break;
            case "KeyD":
            case "ArrowRight":
              moveState.right = true;
              break;
            case "Digit1":
            case "Digit2":
            case "Digit3":
            case "Digit4":
            case "Digit5":
            case "Digit6":
            case "Digit7": {
              const index = Number(event.code.replace("Digit", "")) - 1;
              if (SELECTABLE_BLOCKS[index]) {
                setBlockType(SELECTABLE_BLOCKS[index]);
              }
              break;
            }
            case "BracketLeft":
              cycleSelection(-1);
              break;
            case "BracketRight":
              cycleSelection(1);
              break;
            default:
              break;
          }
        };

        const onKeyUp = (event: KeyboardEvent) => {
          switch (event.code) {
            case "KeyW":
            case "ArrowUp":
              moveState.forward = false;
              break;
            case "KeyS":
            case "ArrowDown":
              moveState.backward = false;
              break;
            case "KeyA":
            case "ArrowLeft":
              moveState.left = false;
              break;
            case "KeyD":
            case "ArrowRight":
              moveState.right = false;
              break;
            default:
              break;
          }
        };

        const preventContextMenu = (event: MouseEvent) => {
          event.preventDefault();
        };

        const addBlockFromHit = (hit: Intersection) => {
          if (!hit.face) {
            return;
          }
          const mesh = hit.object as Mesh;
          const baseX = Math.floor(mesh.position.x);
          const baseY = Math.floor(mesh.position.y);
          const baseZ = Math.floor(mesh.position.z);
          const normal = hit.face.normal;
          const offsetX = normal.x > 0.5 ? 1 : normal.x < -0.5 ? -1 : 0;
          const offsetY = normal.y > 0.5 ? 1 : normal.y < -0.5 ? -1 : 0;
          const offsetZ = normal.z > 0.5 ? 1 : normal.z < -0.5 ? -1 : 0;
          const targetX = baseX + offsetX;
          const targetY = baseY + offsetY;
          const targetZ = baseZ + offsetZ;
          if (targetY > MAX_BUILD_HEIGHT) {
            return;
          }
          const playerPosition = controls.getObject().position;
          const distance = Math.sqrt(
            (targetX + 0.5 - playerPosition.x) ** 2 +
              (targetY + 0.5 - playerPosition.y) ** 2 +
              (targetZ + 0.5 - playerPosition.z) ** 2
          );
          if (distance < 1.8) {
            return;
          }
          addBlock(targetX, targetY, targetZ, selectedBlockRef.current);
        };

        const removeBlockFromHit = (hit: Intersection) => {
          const mesh = hit.object as Mesh;
          const x = Math.floor(mesh.position.x);
          const y = Math.floor(mesh.position.y);
          const z = Math.floor(mesh.position.z);
          if (y <= BASE_DEPTH) {
            return;
          }
          removeBlock(x, y, z);
        };

        const onMouseDown = (event: MouseEvent) => {
          if (!controls.isLocked) {
            controls.lock();
            return;
          }

          if (event.button === 0) {
            const hit = pickBlock();
            if (hit) {
              removeBlockFromHit(hit);
            }
          } else if (event.button === 2) {
            event.preventDefault();
            const hit = pickBlock();
            if (hit) {
              addBlockFromHit(hit);
            }
          } else if (event.button === 1) {
            event.preventDefault();
            cycleSelection(1);
          }
        };

        const onWheel = (event: WheelEvent) => {
          if (event.deltaY === 0) {
            return;
          }
          event.preventDefault();
          cycleSelection(event.deltaY > 0 ? 1 : -1);
        };

        const handleLock = () => {
          if (!active) {
            return;
          }
          setIsLocked(true);
        };

        const handleUnlock = () => {
          if (!active) {
            return;
          }
          setIsLocked(false);
          updateHighlight();
        };

        controls.addEventListener("lock", handleLock);
        controls.addEventListener("unlock", handleUnlock);

        window.addEventListener("resize", onResize);
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        renderer.domElement.addEventListener("mousedown", onMouseDown);
        renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
        renderer.domElement.addEventListener("contextmenu", preventContextMenu);

        updateHighlight();

        cleanup = () => {
          controls.removeEventListener("lock", handleLock);
          controls.removeEventListener("unlock", handleUnlock);
          window.removeEventListener("resize", onResize);
          window.removeEventListener("keydown", onKeyDown);
          window.removeEventListener("keyup", onKeyUp);
          renderer.domElement.removeEventListener("mousedown", onMouseDown);
          renderer.domElement.removeEventListener("wheel", onWheel);
          renderer.domElement.removeEventListener("contextmenu", preventContextMenu);
          renderer.setAnimationLoop(null);
          renderer.dispose();
          controls.disconnect();
          controls.unlock();
          if (renderer.domElement.parentElement === mountElement) {
            mountElement.removeChild(renderer.domElement);
          }
          worldGroup.clear();
          highlightMesh.removeFromParent();
          geometriesToDispose.forEach((geometry) => geometry.dispose());
          materialsToDispose.forEach((material) => material.dispose());
          texturesToDispose.forEach((texture) => texture.dispose());
        };
      } catch (err) {
        if (!active) {
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load the 3D engine. Please check your connection.";
        setError(message);
      }
    };

    setup();

    return () => {
      active = false;
      if (cleanup) {
        cleanup();
      }
    };
  }, [setBlockType]);

  const instructionsClassName = `${styles.instructions} ${
    isLocked ? styles.instructionsHidden : ""
  }`;

  return (
    <div className={styles.page}>
      <div ref={mountRef} className={styles.canvasRoot} />
      <div className={styles.hud}>
        <div className={styles.crosshair} aria-hidden="true">
          +
        </div>
      </div>
      <div className={styles.inventory}>
        {SELECTABLE_BLOCKS.map((type, index) => {
          const isSelected = selectedBlock === type;
          return (
            <button
              key={type}
              type="button"
              className={`${styles.slotButton} ${
                isSelected ? styles.slotSelected : ""
              }`}
              aria-pressed={isSelected}
              onClick={() => setBlockType(type)}
            >
              <span
                className={styles.blockSwatch}
                style={{ background: BLOCK_SWATCHES[type] }}
                aria-hidden="true"
              />
              <span>{`${index + 1}. ${BLOCK_LABELS[type]}`}</span>
            </button>
          );
        })}
      </div>
      <div className={instructionsClassName}>
        <h1>BlazeCraft Prototype</h1>
        <p>Click the world to capture your cursor and explore.</p>
        <ul>
          <li>WASD / Arrow keys &mdash; Move</li>
          <li>Mouse &mdash; Look around</li>
          <li>Left click &mdash; Mine block</li>
          <li>Right click &mdash; Place selected block</li>
          <li>Scroll wheel or keys 1-7 &mdash; Change block type</li>
          <li>Middle click &mdash; Cycle palette</li>
          <li>Esc &mdash; Release cursor</li>
        </ul>
      </div>
      {error ? <div className={styles.errorBanner}>{error}</div> : null}
    </div>
  );
};

export default MinecraftPage;
