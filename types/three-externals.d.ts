declare module "three" {
  export class Color {
    constructor(color?: number | string);
    set(color: number | string): this;
  }

  export class Fog {
    constructor(color: number | string, near?: number, far?: number);
  }

  export class Vector2 {
    constructor(x?: number, y?: number);
    x: number;
    y: number;
    set(x: number, y: number): this;
  }

  export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): this;
    setScalar(value: number): this;
    add(v: Vector3): this;
    sub(v: Vector3): this;
    copy(v: Vector3): this;
    clone(): Vector3;
    length(): number;
    lengthSq(): number;
    normalize(): this;
    multiplyScalar(value: number): this;
  }

  export class Object3D {
    readonly position: Vector3;
    visible: boolean;
    readonly children: Object3D[];
    add(...objects: Object3D[]): this;
    remove(...objects: Object3D[]): this;
    removeFromParent(): this;
  }

  export class Group extends Object3D {
    clear(): this;
  }

  export class Camera extends Object3D {}

  export class PerspectiveCamera extends Camera {
    constructor(fov?: number, aspect?: number, near?: number, far?: number);
    aspect: number;
    updateProjectionMatrix(): void;
    lookAt(x: number | Vector3, y?: number, z?: number): void;
  }

  export interface WebGLRendererParameters {
    antialias?: boolean;
    alpha?: boolean;
  }

  export class WebGLRenderer {
    constructor(parameters?: WebGLRendererParameters);
    domElement: HTMLCanvasElement;
    outputColorSpace: string;
    setPixelRatio(value: number): void;
    setSize(width: number, height: number, updateStyle?: boolean): void;
    render(scene: Scene, camera: Camera): void;
    dispose(): void;
    setAnimationLoop(callback: ((time: number) => void) | null): void;
  }

  export class Scene extends Object3D {
    background: Color | null;
    fog: Fog | null;
  }

  export class Clock {
    constructor(autoStart?: boolean);
    getDelta(): number;
  }

  export class Texture {
    magFilter: number;
    minFilter: number;
    needsUpdate: boolean;
    colorSpace: string;
    dispose(): void;
  }

  export class CanvasTexture extends Texture {
    constructor(canvas: HTMLCanvasElement);
  }

  export class BufferGeometry {
    dispose(): void;
  }

  export class BoxGeometry extends BufferGeometry {
    constructor(width?: number, height?: number, depth?: number);
  }

  export class Material {
    transparent?: boolean;
    opacity?: number;
    dispose(): void;
  }

  export interface MeshBasicMaterialParameters {
    color?: number | string;
    wireframe?: boolean;
    transparent?: boolean;
    opacity?: number;
    depthTest?: boolean;
    depthWrite?: boolean;
  }

  export class MeshBasicMaterial extends Material {
    constructor(parameters?: MeshBasicMaterialParameters);
    color: Color;
    wireframe: boolean;
    depthWrite: boolean;
  }

  export interface MeshLambertMaterialParameters {
    map?: Texture;
    transparent?: boolean;
    opacity?: number;
  }

  export class MeshLambertMaterial extends Material {
    constructor(parameters?: MeshLambertMaterialParameters);
    map?: Texture;
  }

  export interface MeshPhongMaterialParameters {
    color?: number | string;
    transparent?: boolean;
    opacity?: number;
    shininess?: number;
    specular?: number | string;
    side?: number;
    depthWrite?: boolean;
  }

  export class MeshPhongMaterial extends Material {
    constructor(parameters?: MeshPhongMaterialParameters);
  }

  export class Mesh<TGeometry extends BufferGeometry = BufferGeometry, TMaterial extends Material | Material[] = Material | Material[]> extends Object3D {
    constructor(geometry?: TGeometry, material?: TMaterial);
    geometry: TGeometry;
    material: TMaterial;
  }

  export class Light extends Object3D {
    intensity: number;
    color: Color;
  }

  export class AmbientLight extends Light {
    constructor(color?: number | string, intensity?: number);
  }

  export class DirectionalLight extends Light {
    constructor(color?: number | string, intensity?: number);
  }

  export class HemisphereLight extends Light {
    constructor(skyColor?: number | string, groundColor?: number | string, intensity?: number);
  }

  export interface Intersection {
    distance: number;
    point: Vector3;
    object: Object3D;
    face?: { normal: Vector3 };
  }

  export class Raycaster {
    constructor(origin?: Vector3, direction?: Vector3, near?: number, far?: number);
    setFromCamera(coords: Vector2, camera: Camera): void;
    intersectObjects(objects: Object3D[], recursive?: boolean): Intersection[];
  }

  export const NearestFilter: number;
  export const NearestMipMapNearestFilter: number;
  export const DoubleSide: number;
  export const SRGBColorSpace: string;
}

declare module "three/examples/jsm/controls/PointerLockControls" {
  import type { Camera, Object3D } from "three";

  export class EventDispatcher<TEvents extends string = string> {
    addEventListener(type: TEvents, listener: (...args: unknown[]) => void): void;
    removeEventListener(type: TEvents, listener: (...args: unknown[]) => void): void;
  }

  export class PointerLockControls extends EventDispatcher<"lock" | "unlock"> {
    constructor(camera: Camera, domElement?: HTMLElement);
    readonly isLocked: boolean;
    domElement: HTMLElement;
    connect(): void;
    disconnect(): void;
    lock(): void;
    unlock(): void;
    getObject(): Object3D;
    moveForward(distance: number): void;
    moveRight(distance: number): void;
  }
}
