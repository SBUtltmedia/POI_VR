import { AbstractMesh, Axis, BoundingBoxGizmo, Color3, Engine, FreeCamera, GizmoManager, HemisphericLight, Mesh, MultiPointerScaleBehavior, PointerDragBehavior, PointerEventTypes, RotationGizmo, ScaleGizmo, Scene, SceneLoader, SixDofDragBehavior, Space, UniversalCamera, UtilityLayerRenderer, Vector2, Vector3, WebXRFeatureName, WebXRImageTracking } from '@babylonjs/core'
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

    let boundingBoxGizmo: BoundingBoxGizmo;

    try {
        const result = await SceneLoader.ImportMeshAsync("", "./models/", modelFile, scene);

        const rootMesh = result.meshes.find(m => m.id === "__root__");
        if (!rootMesh) {
            console.warn(`Root mesh not found in ${modelFile}`);
            return scene;
        }

        rootMesh.id = modelFile;
        rootMesh.name = modelFile;

        console.log(rootMesh)

        const utilLayer = new UtilityLayerRenderer(scene);

        utilLayer.utilityLayerScene.autoClearDepthAndStencil = true;

        // let boundingBox = BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(rootMesh as Mesh);
        


        boundingBoxGizmo = new BoundingBoxGizmo(Color3.FromHexString("#0984e3"), utilLayer);
        // const rotateGizmo = new RotationGizmo(utilLayer);
        boundingBoxGizmo.attachedMesh = rootMesh;
        boundingBoxGizmo.setEnabledScaling(true, true);
        // rotateGizmo.attachedMesh = rootMesh;

        let hoverObserver = boundingBoxGizmo.onHoverStartObservable.add((evt) => {
            console.log(evt);
        })
        
        boundingBoxGizmo.updateGizmoRotationToMatchAttachedMesh = true;
        boundingBoxGizmo.updateGizmoPositionToMatchAttachedMesh = true;

        
        let sixDofDragBehavior = new SixDofDragBehavior()
        rootMesh.addBehavior(sixDofDragBehavior)
        let multiPointerScaleBehavior = new MultiPointerScaleBehavior()
        rootMesh.addBehavior(multiPointerScaleBehavior)    

        const POI_meshes = result.meshes.filter(mesh => mesh.name.startsWith("POI"));
        console.log(POI_meshes);

        const guiElements = [];
        let idx = 0;
        for (let POI_mesh of POI_meshes) {
            let guiElement = new GUIElement(scene, rootMesh, POI_mesh, POI_mesh.name, idx);
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

    const featuresManager = xrExperience.baseExperience.featuresManager;
    const imageTracking = featuresManager.enableFeature(WebXRFeatureName.IMAGE_TRACKING, "latest", {
        images: [
            {
                src: "https://cdn.babylonjs.com/imageTracking.png",
                estimatedRealWorldWidth: 0.2
            },
        ]
    }) as WebXRImageTracking;

    

    imageTracking.onTrackedImageUpdatedObservable.add((image) => {
        // root.setPreTransformMatrix(image.transformationMatrix);
        const rootMesh: AbstractMesh = scene!.getMeshByName("suzanne.glb") as AbstractMesh;
        image.transformationMatrix.decompose(rootMesh!.scaling, rootMesh.rotationQuaternion, rootMesh!.position);
        rootMesh!.setEnabled(true);
        rootMesh!.translate(Axis.Y, 0.1, Space.LOCAL);
        rootMesh!.scaling = new Vector3(0.05, 0.05, 0.05);
        boundingBoxGizmo.attachedMesh = null;
    });



    return scene;

};