import {
    AbstractMesh,
    BoundingBoxGizmo,
    Color3,
    Engine,
    HemisphericLight,
    PointerDragBehavior,
    PointerEventTypes,
    Scene,
    SceneLoader,
    UniversalCamera,
    UtilityLayerRenderer,
    Vector3,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Control, Rectangle, TextBlock } from "@babylonjs/gui";
import "@babylonjs/loaders/glTF";
import { GUIElement } from "./GUIElement";
import { PlaceOpacityBehavior } from "./PlaceOpacityBheavior";
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

        const rootMesh = result.meshes.find((m) => m.id === "__root__");
        if (!rootMesh) {
            console.warn(`Root mesh not found in ${modelFile}`);
            return scene;
        }

        rootMesh.id = modelFile;
        rootMesh.name = modelFile;

        // Create a drag behavior.
        const pointerDragBehavior = new PointerDragBehavior({ dragAxis: new Vector3(1, 0, 0) });
        // The 'dragButton' property is not available, so we won't set it.
        pointerDragBehavior.useObjectOrientationForDragging = false;

        // Flags to keep track of drag and rotation states.
        let isDragging = false;
        let isRotating = false;

        pointerDragBehavior.onDragStartObservable.add(() => {
            console.log("dragStart");
            isDragging = true;
        });
        pointerDragBehavior.onDragEndObservable.add(() => {
            console.log("dragEnd");
            isDragging = false;
        });

        // Attach the drag behavior.
        rootMesh.addBehavior(pointerDragBehavior);

        // Create a bounding box gizmo for visual feedback.
        const utilLayer = new UtilityLayerRenderer(scene);
        const boundingBoxGizmo = new BoundingBoxGizmo(new Color3(1, 1, 1), utilLayer);
        boundingBoxGizmo.attachedMesh = rootMesh;
        boundingBoxGizmo.updateGizmoRotationToMatchAttachedMesh = false;
        boundingBoxGizmo.updateGizmoPositionToMatchAttachedMesh = true;

        // Prepare vectors and sensitivity for rotation.
        const rightDir = new Vector3();
        const upDir = new Vector3();
        const sensitivity = 0.005;

        // Make sure the mesh is pickable.
        rootMesh.isPickable = true;

        // Use onPrePointerObservable to disable the drag behavior for non-left clicks.
        scene.onPrePointerObservable.add(
            (pointerInfo) => {
                // Only allow the drag behavior to process left-click (button 0) events.
                if (pointerInfo.event.button !== 0) {
                    pointerDragBehavior.enabled = false;
                } else {
                    pointerDragBehavior.enabled = true;
                }
            },
            100 // high priority to run before the drag behavior
        );

        // Set up pointer events for rotation using the right mouse button.
        scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case PointerEventTypes.POINTERDOWN: {
                    const evt = pointerInfo.event;
                    const pickedMesh = pointerInfo.pickInfo?.pickedMesh;
                    // If right-click (button === 2) on the mesh (or its children) is detected:
                    if (evt.button === 2 && pickedMesh && rootMesh.getChildMeshes().includes(pickedMesh)) {
                        isRotating = true;
                        console.log("rotation start");
                        // Remove the drag behavior completely during rotation.
                        rootMesh.removeBehavior(pointerDragBehavior);
                        // Optionally hide the gizmo.
                        boundingBoxGizmo.attachedMesh = null;
                        // Detach camera controls to avoid interference.
                        camera.detachControl();
                    }
                    break;
                }
                case PointerEventTypes.POINTERMOVE: {
                    if (isRotating && !isDragging) {
                        // Extract the camera's right and up vectors from its world matrix.
                        const matrix = camera.getWorldMatrix();
                        rightDir.set(matrix.m[0], matrix.m[1], matrix.m[2]);
                        upDir.set(matrix.m[4], matrix.m[5], matrix.m[6]);

                        // Rotate the mesh according to the pointer movement.
                        rootMesh.rotateAround(
                            rootMesh.position,
                            rightDir,
                            pointerInfo.event.movementY * -sensitivity
                        );
                        rootMesh.rotateAround(
                            rootMesh.position,
                            upDir,
                            pointerInfo.event.movementX * -sensitivity
                        );
                    }
                    break;
                }
                case PointerEventTypes.POINTERUP: {
                    if (isRotating) {
                        isRotating = false;
                        console.log("rotation end");
                        // Re-attach the drag behavior after rotation.
                        rootMesh.addBehavior(pointerDragBehavior);
                        // Re-enable the gizmo.
                        boundingBoxGizmo.attachedMesh = rootMesh;
                        // Re-attach camera controls.
                        camera.attachControl();
                    }
                    break;
                }
            }
        });

        // Process POI elements.
        const POI_meshes = result.meshes.filter((mesh) => mesh.name.startsWith("POI"));
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
            sessionMode: "immersive-ar",
        },
    });
    console.log(xrExperience);

    return scene;
};
