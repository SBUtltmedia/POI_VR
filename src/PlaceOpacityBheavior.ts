import { Behavior } from "@babylonjs/core/Behaviors/behavior";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { GUIElement } from "./GUIElement";
import { Scene } from "@babylonjs/core/scene";
import { Observer } from "@babylonjs/core/Misc/observable";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Ray } from "@babylonjs/core/Culling/ray";
import { Color3, Engine, RayHelper } from "@babylonjs/core";
import { Nullable } from "@babylonjs/core";

export class PlaceOpacityBehavior implements Behavior<GUIElement> {
    guiElement: GUIElement;
    scene: Scene;
    raycasterObserver: Observer<Scene>;

    constructor(scene: Scene, mesh: AbstractMesh) {
        this.raycasterObserver = new Observer<Scene>(() => console.log(), 4);
        this.scene = scene;
        this.guiElement = new GUIElement(this.scene, mesh, "test");
    }

    init(): void {
        //this.scene = new BABYLON.Scene(engine);

        //this.guiElement = new GUIElement(this.scene, , "String");
    }

    get name() {
        return "PlaceOpacityBehavior";
    }

    attach(target: GUIElement): void {
        this.guiElement = target;
        this.scene = target.getScene();

        // If the target GUIElement is initialized with a POI_mesh, we use that
        if (!this.guiElement.POI_mesh) {
            console.error("POI_mesh is not defined for this GUIElement.");
            return;
        }

        // Create the observer to check the relative position every frame
        this.raycasterObserver = this.scene.onBeforeRenderObservable.add(() => {
            this.checkIfRectangleAbovePOI();
        });
    }

    // Method to check if the rectangle is above the POI_Mesh
    private checkIfRectangleAbovePOI(): void {
        if (!this.guiElement.rect || !this.guiElement.POI_mesh) return;

        const adm = this.guiElement.advancedTexture;
        const control = adm.getControlByName("rect");
        if (control) {
            // Get the world position of the rectangle (GUI element)
            let ray = this.scene.createPickingRay(control.centerX, control.centerY, Matrix.Identity(), null);
            let hit = this.scene.pickWithRay(ray);

            if (hit?.pickedMesh === this.guiElement.POI_mesh) {
                // console.log("Mesh found!", this.guiElement.name);
                let rayHelper = new RayHelper(ray);
                rayHelper.show(this.scene, new Color3(0, 0, 0));
                GUIElement.elementsSet.add(this.guiElement.name);
                this.guiElement.rect.background = "green";
            } else {
                GUIElement.elementsSet.delete(this.guiElement.name);
                this.guiElement.rect.background = "blue";
            }
        }
    }

    detach(): void {
        // Remove the observer when detaching
        if (this.raycasterObserver) {
            this.scene.onBeforeRenderObservable.remove(this.raycasterObserver);
        }
    }
}