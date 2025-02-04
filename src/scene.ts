import { AbstractMesh, BoundingBoxGizmo, Color3, Engine, FreeCamera, GizmoManager, HemisphericLight, Mesh, MultiPointerScaleBehavior, PointerDragBehavior, PointerEventTypes, RotationGizmo, ScaleGizmo, Scene, SceneLoader, SixDofDragBehavior, UniversalCamera, UtilityLayerRenderer, Vector2, Vector3 } from '@babylonjs/core'
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

        const utilLayer = new UtilityLayerRenderer(scene);

        utilLayer.utilityLayerScene.autoClearDepthAndStencil = true;

        let boundingBox = BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(rootMesh);

        const boundingBoxGizmo = new BoundingBoxGizmo(Color3.FromHexString("#0984e3"), utilLayer);
        // const rotateGizmo = new RotationGizmo(utilLayer);
        boundingBoxGizmo.attachedMesh = rootMesh;
        boundingBoxGizmo.setEnabledScaling(true, true);
        // rotateGizmo.attachedMesh = rootMesh;

        let hoverObserver = boundingBoxGizmo.onHoverStartObservable.add((evt) => {
            console.log(evt);
        })
        
        boundingBoxGizmo.updateGizmoRotationToMatchAttachedMesh = false;
        boundingBoxGizmo.updateGizmoPositionToMatchAttachedMesh = true;
        
        let sixDofDragBehavior = new SixDofDragBehavior()
        boundingBox.addBehavior(sixDofDragBehavior)
        let multiPointerScaleBehavior = new MultiPointerScaleBehavior()
        boundingBox.addBehavior(multiPointerScaleBehavior)    

        // rotateGizmo.updateGizmoPositionToMatchAttachedMesh = true;
        // rotateGizmo.updateGizmoRotationToMatchAttachedMesh = false;

        // let rotating = false;
        // const rightDir = new Vector3();
        // const upDir = new Vector3();
        // const sensitivity = 0.005;

        // rootMesh.isPickable = true;

        // scene.onPointerObservable.add((pointerInfo) => {
        //     if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
        //         if (rootMesh.getChildMeshes().includes(pointerInfo.pickInfo?.pickedMesh!)) {
        //             rotating = true;
        //             boundingBoxGizmo.attachedMesh = !boundingBoxGizmo.attachedMesh ? rootMesh : null;
        //             camera.detachControl();
        //         }
        //     } else if (pointerInfo.type === PointerEventTypes.POINTERUP && rotating) {
        //         rotating = false;
        //         camera.attachControl();
        //     } else if (pointerInfo.type === PointerEventTypes.POINTERMOVE && rotating) {
        //         const matrix = camera.getWorldMatrix();
        //         rightDir.copyFromFloats(matrix.m[0], matrix.m[1], matrix.m[2]);
        //         upDir.copyFromFloats(matrix.m[4], matrix.m[5], matrix.m[6]);

        //         rootMesh.rotateAround(rootMesh.position, rightDir, pointerInfo.event.movementY * -1 * sensitivity);
        //         rootMesh.rotateAround(rootMesh.position, upDir, pointerInfo.event.movementX * -1 * sensitivity);
        //     }
        // });

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