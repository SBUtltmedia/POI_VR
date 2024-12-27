import {Engine,FreeCamera,HemisphericLight,Mesh,PointerEventTypes,Scene, SceneLoader, Vector2, Vector3} from '@babylonjs/core'
import { AdvancedDynamicTexture, Control, Rectangle } from '@babylonjs/gui';
import "@babylonjs/loaders/glTF";
export class AppOne {
    engine: Engine;
    scene: Scene;

    constructor(readonly canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas)
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
       createScene(this.engine, this.canvas).then((scene)=>{
        this.scene=scene;
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
       })

    }

    debug(debugOn: boolean = true) {
        // if (debugOn) {
        //     this.scene.debugLayer.show({ overlay: true });
        // } else {
        //     this.scene.debugLayer.hide();
        // }
    }

    run() {
       // this.debug(true);
  
    }



}


// var createScene = function (engine: Engine, canvas: HTMLCanvasElement) {
//     // this is the default code from the playground:

//     // This creates a basic Babylon Scene object (non-mesh)
//     var scene = new Scene(engine);

//     // This creates and positions a free camera (non-mesh)
//     var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);

//     // This targets the camera to scene origin
//     camera.setTarget(Vector3.Zero());

//     // This attaches the camera to the canvas
//     camera.attachControl(canvas, true);

//     // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
//     var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

//     // Default intensity is 1. Let's dim the light a small amount
//     light.intensity = 0.7;

//     // Our built-in 'sphere' shape.
//     var sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2, segments: 32 }, scene);
//     // Move the sphere upward 1/2 its height
//     let startPos = 2;
//     sphere.position.y = startPos;

//     // Our built-in 'ground' shape.
//     var ground = MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
//     var groundMaterial = new StandardMaterial("groundMaterial", scene);
//     groundMaterial.diffuseColor = new Color3(0.5, 0.8, 0.5); // RGB for a greenish color
//     ground.material = groundMaterial;
//     groundMaterial.bumpTexture = new Texture("./normal.jpg", scene);
//     //groundMaterial.bumpTexture.level = 0.125;    


//     var redMaterial = new StandardMaterial("redMaterial", scene);
//     redMaterial.diffuseColor = new Color3(1, 0, 0); // RGB for red
//     sphere.material = redMaterial;

//     var sphereVelocity = 0;
//     var gravity = 0.009;
//     var reboundLoss = 0.1;

//     scene.registerBeforeRender(() => {
//         sphereVelocity += gravity;
//         let newY = sphere.position.y - sphereVelocity;
//         sphere.position.y -= sphereVelocity
//         if (newY < 1) {
//             sphereVelocity = (reboundLoss - 1) * sphereVelocity;
//             newY = 1;
//         }
//         sphere.position.y = newY;
//         if (Math.abs(sphereVelocity) <= gravity && newY < 1 + gravity) {
//             sphere.position.y = startPos++;
//         }
//     });

//     return scene;
// };


var createScene = async function (engine: Engine, canvas: HTMLCanvasElement) {
    var scene = new Scene(engine);
    var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
    const result = await SceneLoader.ImportMeshAsync("", "./models/", "suzanne.glb", scene).then(
(mesh)=>{
let POIs=mesh.meshes.filter(childMesh=>childMesh.name.includes("POI"))
let POInames=POIs.map(poi=>poi.name)



}
    );


    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);
    var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;



    var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

    let dragged = null;
    let pointerStart =  Vector2.Zero();  // stores pointer position at drag start
    var createRectangle = function () {
        var rect = new Rectangle();
        rect.width = "200px";
        rect.height = "40px";
        rect.cornerRadius = 20;
        rect.color = "yellow";
        rect.thickness = 2;
        rect.background = "blue";
        //rect.isPointerBlocker = true;
        advancedTexture.addControl(rect);
        rect.onPointerDownObservable.add(eventData => {
            dragged = rect;   // set dragged gui control
            pointerStart.x = scene.pointerX;
            pointerStart.y = scene.pointerY;
            camera.detachControl(); // prevents pointer to influence camera, while dragging
            rect.isPointerBlocker = false; // required so scene receives pointer x/y changes
        });
        return rect;
    }
    scene.onPointerObservable.add(eventData => {
        if (eventData.type == PointerEventTypes.POINTERUP) {
            if (dragged) {
                dragged.isPointerBlocker = true;   // re-allow interaction with gui control
                dragged = null;
                camera.attachControl(canvas, true); // re-allow camera control via pointer
            }
        }
        else if (eventData.type == PointerEventTypes.POINTERMOVE && dragged) {
            // calc drag position change since last triggered pointer move
            const deltaX = scene.pointerX - pointerStart.x;
            const deltaY = scene.pointerY - pointerStart.y;

            // move gui control according to user drag
            dragged.topInPixels += deltaY;
            dragged.leftInPixels += deltaX;

            // update drag start position since last triggered pointer move
            pointerStart.x = scene.pointerX;
            pointerStart.y = scene.pointerY;
        }
    })

    createRectangle().horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    createRectangle().horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;

    createRectangle().horizontalAlignment  = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    createRectangle().horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    return scene;

};