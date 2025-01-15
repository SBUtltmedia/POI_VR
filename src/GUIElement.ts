import { AbstractMesh, Vector2 } from "@babylonjs/core";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture, Control, Rectangle, TextBlock } from "@babylonjs/gui";
import { IMeshDataOptions } from "@babylonjs/core";

export class GUIElement extends AbstractMesh {
    hintText: string;
    advancedTexture: AdvancedDynamicTexture;
    scene: Scene;
    rect: Rectangle;
    POI_mesh: AbstractMesh;

    static elementsSet: Set<string> = new Set<string>();

    static pointerStart: Vector2 = Vector2.Zero();
    static dragged: Rectangle | null;

    constructor(scene: Scene, POI_mesh: AbstractMesh, hintText: string) {
        super(hintText, scene);

        this.hintText = hintText;
        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.scene = scene;
        this.POI_mesh = POI_mesh;
        this.rect = new Rectangle("rect");

        this.createRectangle(hintText);

    }
    get _positions() {
        return null;
    }

    copyVerticesData(kind: string, vertexData: {
        [kind: string]: Float32Array;
    }) {

    }

    refreshBoundingInfo(options: IMeshDataOptions) {
        return this;
    }

    createRectangle(text: string) {
        this.rect = new Rectangle("rect");
        this.rect.width = "200px";
        this.rect.height = "40px";
        this.rect.cornerRadius = 20;
        this.rect.color = "yellow";
        this.rect.thickness = 2;
        this.rect.background = "blue";

        var textBlock = new TextBlock();
        textBlock.text = text;
        textBlock.color = "white";
        textBlock.fontSize = "13px";
        textBlock.resizeToFit = true;
        textBlock.textWrapping = true;

        this.rect.addControl(textBlock);
        this.rect.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;

        this.advancedTexture.addControl(this.rect);
        let camera = this.scene.activeCamera;

        // Pointer Down - Start of dragging
        this.rect.onPointerDownObservable.add(evt => {
            // Capture initial position when drag starts

            this.rect.isPointerBlocker = false;
            GUIElement.pointerStart.x = this.scene.pointerX;
            GUIElement.pointerStart.y = this.scene.pointerY;
            GUIElement.dragged = this.rect;
            // Optionally, disable camera controls to prevent interference during dragging
            camera?.detachControl();
        });
    }

    static setupMovement(scene: Scene, canvas: HTMLCanvasElement) {
        const camera = scene.activeCamera;
        scene.onPointerObservable.add(eventData => {
            ;
            if (eventData.type == PointerEventTypes.POINTERUP) {
                if (GUIElement.dragged) {
                    GUIElement.dragged.isPointerBlocker = true;   // re-allow interaction with gui control
                    GUIElement.dragged = null;
                    camera?.attachControl(canvas, true); // re-allow camera control via pointer
                }
            }
            else if (eventData.type == PointerEventTypes.POINTERMOVE && GUIElement.dragged) {
                // calc drag position change since last triggered pointer move
                const deltaX = scene.pointerX - GUIElement.pointerStart.x;
                const deltaY = scene.pointerY - GUIElement.pointerStart.y;

                // move gui control according to user drag
                GUIElement.dragged.topInPixels += deltaY;
                GUIElement.dragged.leftInPixels += deltaX;

                // update drag start position since last triggered pointer move
                GUIElement.pointerStart.x = scene.pointerX;
                GUIElement.pointerStart.y = scene.pointerY;
            }
        })
    }

    static checkCompletion(scene: Scene, totalElements: number) {
        let win = true;
        let winObserver = scene.onBeforeRenderObservable.add(() => {
            if (GUIElement.elementsSet.size === totalElements) {
                console.log("Finished Objective");
                alert("Finished objective");
                winObserver.remove();
            }
        })
    }
}