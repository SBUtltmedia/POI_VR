import { AbstractMesh, BoundingBoxGizmo, Color3, Engine, FreeCamera, HemisphericLight, Mesh, PointerDragBehavior, PointerEventTypes, RotationGizmo, ScaleGizmo, Scene, SceneLoader, UniversalCamera, UtilityLayerRenderer, Vector2, Vector3 } from '@babylonjs/core'
import { AdvancedDynamicTexture, Control, Rectangle, TextBlock } from '@babylonjs/gui';
import "@babylonjs/loaders/glTF";
import { GUIElement } from './GUIElement';
import { PlaceOpacityBehavior } from './PlaceOpacityBheavior';

export const createSceneAsync = async(engine: Engine, canvas: HTMLCanvasElement) => {
    var scene = new Scene(engine);
    var camera = new UniversalCamera("camera1", new Vector3(0, 5, -10), scene);
    let POIs: AbstractMesh[] = [];
    let POInames = [];
    const name = "suzanne"
    const result = await SceneLoader.ImportMeshAsync("", "./models/", "suzanne.glb", scene).then(
        (mesh) => {
            const rootMesh = mesh.meshes.find(meshN => meshN.id === "__root__")!;  // Should be guaranteed
            rootMesh.id = name;
            rootMesh.name = name;            
            POIs = mesh.meshes.filter(childMesh => childMesh.name.includes("POI"))
            POInames = POIs.map(poi => poi.name);
            rootMesh.rotation = Vector3.Zero();

            var utilLayer = new UtilityLayerRenderer(scene);

            let boundingBoxGizmo = new BoundingBoxGizmo(new Color3(1, 1, 1), utilLayer)

            boundingBoxGizmo.attachedMesh = rootMesh;

            boundingBoxGizmo.updateGizmoRotationToMatchAttachedMesh = false;
            boundingBoxGizmo.updateGizmoPositionToMatchAttachedMesh = true;

            rootMesh.isPickable = true;

            let rotating = false;
            const rightDir = new Vector3();
            const upDir = new Vector3();
            const sensitivity = 0.005;
            scene.onPointerObservable.add((pointerInfo) => {
                if (pointerInfo.type === 1) {
                    if (rootMesh.getChildMeshes().includes(pointerInfo.pickInfo.pickedMesh)) {
                        rotating = true;
                        boundingBoxGizmo.attachedMesh = !boundingBoxGizmo.attachedMesh ? rootMesh : null
                        camera.detachControl();
                    }
                } else if (pointerInfo.type === 2 && rotating) {
                    rotating = false;
                    camera.attachControl();
                } else if (pointerInfo.type === 4 && rotating) {
                    const matrix = camera.getWorldMatrix();
                    rightDir.copyFromFloats(matrix.m[0], matrix.m[1], matrix.m[2]);
                    upDir.copyFromFloats(matrix.m[4], matrix.m[5], matrix.m[6]);
        
                    rootMesh.rotateAround(rootMesh.position, rightDir, pointerInfo.event.movementY * -1 * sensitivity);
                    rootMesh.rotateAround(rootMesh.position, upDir, pointerInfo.event.movementX * -1 * sensitivity);
                }
            });                   
        }
    );

    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);
    var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    let guiElements: GUIElement[] = [];

    for (let POI of POIs) {
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
                console.log("inspector hit")
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