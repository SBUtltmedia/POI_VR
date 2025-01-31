import { AbstractMesh, BoundingBoxGizmo, Color3, Engine, FreeCamera, HemisphericLight, Mesh, PointerDragBehavior, PointerEventTypes, RotationGizmo, ScaleGizmo, Scene, SceneLoader, UniversalCamera, UtilityLayerRenderer, Vector2, Vector3 } from '@babylonjs/core';
import { AdvancedDynamicTexture, Control, Rectangle, TextBlock } from '@babylonjs/gui';
import "@babylonjs/loaders/glTF";
import { GUIElement } from './GUIElement';
import { PlaceOpacityBehavior } from './PlaceOpacityBheavior';
import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience";

export const createSceneAsync = async (engine: Engine, canvas: HTMLCanvasElement) => {
    const scene = new Scene(engine);
    const camera = new UniversalCamera("camera1", new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);

    const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const searchParams = new URLSearchParams(window.location.search);
    let modelFile = searchParams.get("file") || "suzanne.glb";

    if (!modelFile) {
        console.warn("No file specified in the URL. Example: ?file=suzanne.glb");
        return scene;
    }

    if (!modelFile.endsWith(".glb")) {
        modelFile += ".glb";
    }

    try {
        const result = await SceneLoader.ImportMeshAsync("", "./models/", modelFile, scene);

        const rootMesh = result.meshes.find(m => m.id === "__root__");
        if (!rootMesh) {
            console.warn(`Root mesh not found in ${modelFile}`);
            return scene;
        }

        rootMesh.id = modelFile;
        rootMesh.name = modelFile;

        // Create and attach PointerDragBehavior to the root mesh
        const pointerDragBehavior = new PointerDragBehavior({ dragAxis: new Vector3(1, 0, 0) });
        pointerDragBehavior.useObjectOrientationForDragging = false;

        // Listen to drag events
        pointerDragBehavior.onDragStartObservable.add(() => {
            console.log("dragStart");
            isDragging = true;
        });

        pointerDragBehavior.onDragEndObservable.add(() => {
            console.log("dragEnd");
            isDragging = false;
        });

        rootMesh.addBehavior(pointerDragBehavior);

        const utilLayer = new UtilityLayerRenderer(scene);
        const boundingBoxGizmo = new BoundingBoxGizmo(new Color3(1, 1, 1), utilLayer);
        boundingBoxGizmo.attachedMesh = rootMesh;

        boundingBoxGizmo.updateGizmoRotationToMatchAttachedMesh = false;
        boundingBoxGizmo.updateGizmoPositionToMatchAttachedMesh = true;

        let isRotating = false;
        let isDragging = false;
        const rightDir = new Vector3();
        const upDir = new Vector3();
        const sensitivity = 0.005;

        rootMesh.isPickable = true;

        scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
                if (rootMesh.getChildMeshes().includes(pointerInfo.pickInfo?.pickedMesh!)) {
                    // Check if the right mouse button is pressed for rotation
                    if (pointerInfo.event.button === 2) { // Right mouse button
                        isRotating = true;
                        pointerDragBehavior.detach(); // Disable dragging while rotating
                        boundingBoxGizmo.attachedMesh = !boundingBoxGizmo.attachedMesh ? rootMesh : null;
                        camera.detachControl();
                    }
                }
            } else if (pointerInfo.type === PointerEventTypes.POINTERUP) {
                if (isRotating) {
                    isRotating = false;
                    pointerDragBehavior.attach(); // Re-enable dragging
                    camera.attachControl();
                }
            } else if (pointerInfo.type === PointerEventTypes.POINTERMOVE && isRotating && !isDragging) {
                const matrix = camera.getWorldMatrix();
                rightDir.copyFromFloats(matrix.m[0], matrix.m[1], matrix.m[2]);
                upDir.copyFromFloats(matrix.m[4], matrix.m[5], matrix.m[6]);

                rootMesh.rotateAround(rootMesh.position, rightDir, pointerInfo.event.movementY * -1 * sensitivity);
                rootMesh.rotateAround(rootMesh.position, upDir, pointerInfo.event.movementX * -1 * sensitivity);
            }
        });

        const POI_meshes = result.meshes.filter(mesh => mesh.name.startsWith("POI"));
        console.log(POI_meshes);

        const guiElements = [];
        let idx = 0;
        for (let POI_mesh of POI_meshes) {
            let guiElement = new GUIElement(scene, POI_mesh, POI_mesh.name, idx);
            let placeOpacityBehav = new PlaceOpacityBehavior(scene);
            guiElement.addBehavior(placeOpacityBehav);
            guiElements.push(guiElement);
            idx++;
        }

        GUIElement.setupMovement(scene, canvas);

    } catch (error) {
        console.error(`Failed to load model ${modelFile}:`, error);
    }

    const xrExperience = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: 'immersive-ar'
        }
    });
    console.log(xrExperience);

    return scene;
};