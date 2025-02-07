import { AbstractMesh, Color3, Material, StandardMaterial, Vector2 } from "@babylonjs/core";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture, Control, Rectangle, TextBlock } from "@babylonjs/gui";
import { IMeshDataOptions } from "@babylonjs/core";

export class GUIElement extends AbstractMesh {
    hintText: string;
    advancedTexture: AdvancedDynamicTexture;
    scene: Scene;
    rect: Rectangle;
    questRect!: Rectangle;
    POI_mesh: AbstractMesh;
    isOk: Boolean;
    idx!: number;
    mat!: StandardMaterial;

    static elementsSet: Set<string> = new Set<string>();

    static pointerStart: Vector2 = Vector2.Zero();
    static dragged: Rectangle | null;

    constructor(scene: Scene, POI_mesh: AbstractMesh, hintText: string, idx: number = 0) {
        super(hintText, scene);

        this.hintText = hintText;
        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.scene = scene;
        this.POI_mesh = POI_mesh;
        this.rect = new Rectangle("rect");
        this.isOk = false;
        this.idx = idx;

        this.createRectangle(hintText);

        this.mat = new StandardMaterial("poi-mat");
        this.mat.diffuseColor = new Color3(255, 255, 0);
        this.POI_mesh.material = this.mat;

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
        this.rect.height = "50px";
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
        this.rect.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        this.advancedTexture.addControl(this.rect);
        let camera = this.scene.activeCamera;

        this.questRect = new Rectangle("questRect");
        this.questRect.width = "50px";
        this.questRect.height = "50px"
        this.questRect.cornerRadius = 20;
        this.questRect.color = "yellow";
        this.questRect.thickness = 2;
        this.questRect.background = "blue";        

        var textBlock2 = new TextBlock();
        textBlock2.text = "?";
        textBlock2.color = "white";
        textBlock2.fontSize = "13px";
        textBlock2.resizeToFit = true;
        textBlock2.textWrapping = true;     
        this.questRect.addControl(textBlock2);
        this.questRect.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.questRect.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        const factor = 70;

        this.rect.topInPixels = this.idx * factor;
        this.questRect.topInPixels = this.idx * factor;

        this.rect.paddingTopInPixels = 2;
        this.questRect.paddingTopInPixels = 2;

        this.advancedTexture.addControl(this.questRect);   

        // Pointer Down - Start of dragging
        this.questRect.onPointerDownObservable.add(evt => {
            // Capture initial position when drag starts

            this.questRect.isPointerBlocker = false;
            GUIElement.pointerStart.x = this.scene.pointerX;
            GUIElement.pointerStart.y = this.scene.pointerY;
            GUIElement.dragged = this.questRect;
            // Optionally, disable camera controls to prevent interference during dragging
            camera?.detachControl();

            if (this.isOk) {
                if (this.rect.background === "blue") {
                    this.rect.background = "green";
                    this.questRect.background = "green";
                } else {
                    this.rect.background = "blue";
                    this.questRect.background = "blue";        
                }
            } else {
                this.rect.background = "blue";
                this.questRect.background = "blue" ;                
            }
        });

        this.questRect.onPointerUpObservable.add(evt => {
            camera?.attachControl();
            GUIElement.dragged = null;
        })
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