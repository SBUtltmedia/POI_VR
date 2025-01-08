import { AbstractMesh, BoundingBoxGizmo, Color3, Engine, FreeCamera, HemisphericLight, Mesh, PointerDragBehavior, PointerEventTypes, RotationGizmo, ScaleGizmo, Scene, SceneLoader, UniversalCamera, UtilityLayerRenderer, Vector2, Vector3 } from '@babylonjs/core'
import { AdvancedDynamicTexture, Control, Rectangle, TextBlock } from '@babylonjs/gui';
import "@babylonjs/loaders/glTF";
import { GUIElement } from './GUIElement';
import { PlaceOpacityBehavior } from './PlaceOpacityBheavior';

export const createSceneAsync = async(engine: Engine, canvas: HTMLCanvasElement) => {
    const scene = new Scene(engine);
    const camera = new UniversalCamera("camera1", new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);

    const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Suppose you want to load multiple models. You can keep their names in an array:
    const modelNames = ["suzanne", "chair", "table"];

    let allPOIs: AbstractMesh[] = [];
    let guiElements: GUIElement[] = [];

    // Loop over each model name and import it
    for (const name of modelNames) {
        await SceneLoader.ImportMeshAsync(
            "",          // root URL
            "./models/", // folder
            `${name}.glb`, // file name formed via template string
            scene
        ).then((result) => {
            // "result.meshes" is an array of all loaded meshes for this import
            const rootMesh = result.meshes.find(m => m.id === "__root__");
            if (!rootMesh) { 
                console.warn(`Root mesh not found for ${name}.glb`); 
                return; 
            }

            rootMesh.id = name;
            rootMesh.name = name;

            // Find all child meshes that start with "POI"
            const POIs = result.meshes.filter(childMesh => childMesh.name.includes("POI"));
            allPOIs.push(...POIs);

            const utilLayer = new UtilityLayerRenderer(scene);
            const boundingBoxGizmo = new BoundingBoxGizmo(new Color3(1, 1, 1), utilLayer);
            boundingBoxGizmo.attachedMesh = rootMesh;

            boundingBoxGizmo.updateGizmoRotationToMatchAttachedMesh = false;
            boundingBoxGizmo.updateGizmoPositionToMatchAttachedMesh = true;

            let rotating = false;
            const rightDir = new Vector3();
            const upDir = new Vector3();
            const sensitivity = 0.005;

            rootMesh.isPickable = true;

            scene.onPointerObservable.add((pointerInfo) => {
                if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
                    if (rootMesh.getChildMeshes().includes(pointerInfo.pickInfo?.pickedMesh!)) {
                        rotating = true;
                        boundingBoxGizmo.attachedMesh = !boundingBoxGizmo.attachedMesh ? rootMesh : null;
                        camera.detachControl();
                    }
                } else if (pointerInfo.type === PointerEventTypes.POINTERUP && rotating) {
                    rotating = false;
                    camera.attachControl();
                } else if (pointerInfo.type === PointerEventTypes.POINTERMOVE && rotating) {
                    const matrix = camera.getWorldMatrix();
                    rightDir.copyFromFloats(matrix.m[0], matrix.m[1], matrix.m[2]);
                    upDir.copyFromFloats(matrix.m[4], matrix.m[5], matrix.m[6]);

                    rootMesh.rotateAround(rootMesh.position, rightDir, pointerInfo.event.movementY * -1 * sensitivity);
                    rootMesh.rotateAround(rootMesh.position, upDir, pointerInfo.event.movementX * -1 * sensitivity);
                }
            });
        });
    }

    // Now that all models have loaded, we can create GUI elements for all POIs
    for (let POI of allPOIs) {
        let guiElement = new GUIElement(scene, POI, POI.name.split("_")[1]);
        guiElements.push(guiElement);

        const placeOpacityBehavior = new PlaceOpacityBehavior();
        guiElement.addBehavior(placeOpacityBehavior);
    }

    GUIElement.setupMovement(scene, canvas);
    GUIElement.checkCompletion(scene, guiElements.length);

    import("@babylonjs/inspector").then(({ Inspector }) => {
        Inspector.Hide();
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt
            if (ev.shiftKey && ev.ctrlKey && ev.altKey) {
                if (Inspector.IsVisible) {
                    Inspector.Hide();
                } else {
                    Inspector.Show(scene, {});
                }
            }
        });
    });

    return scene;
};