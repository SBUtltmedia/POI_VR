import { AbstractMesh, Engine, FreeCamera, HemisphericLight, Mesh, PointerEventTypes, Scene, SceneLoader, Vector2, Vector3 } from '@babylonjs/core'
import { AdvancedDynamicTexture, Control, Rectangle, TextBlock } from '@babylonjs/gui';
import "@babylonjs/loaders/glTF";
import { UniversalCamera } from 'babylonjs';
import { GUIElement } from './GUIElement';

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
    }

    GUIElement.setupMovement(scene, canvas);

    import("@babylonjs/inspector").then(({ Inspector }) => {
        Inspector.Hide();
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
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