<!doctype html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

        <title>Babylon.js sample code</title>

        <!-- Babylon.js -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.6.2/dat.gui.min.js"></script>
        <script src="https://assets.babylonjs.com/generated/Assets.js"></script>
        <script src="https://cdn.babylonjs.com/recast.js"></script>
        <script src="https://cdn.babylonjs.com/ammo.js"></script>
        <script src="https://cdn.babylonjs.com/havok/HavokPhysics_umd.js"></script>
        <script src="https://cdn.babylonjs.com/cannon.js"></script>
        <script src="https://cdn.babylonjs.com/Oimo.js"></script>
        <script src="https://cdn.babylonjs.com/earcut.min.js"></script>
        <script src="https://cdn.babylonjs.com/babylon.js"></script>
        <script src="https://cdn.babylonjs.com/materialsLibrary/babylonjs.materials.min.js"></script>
        <script src="https://cdn.babylonjs.com/proceduralTexturesLibrary/babylonjs.proceduralTextures.min.js"></script>
        <script src="https://cdn.babylonjs.com/postProcessesLibrary/babylonjs.postProcess.min.js"></script>
        <script src="https://cdn.babylonjs.com/loaders/babylonjs.loaders.js"></script>
        <script src="https://cdn.babylonjs.com/serializers/babylonjs.serializers.min.js"></script>
        <script src="https://cdn.babylonjs.com/gui/babylon.gui.min.js"></script>
        <script src="https://cdn.babylonjs.com/addons/babylonjs.addons.min.js"></script>
        <script src="https://cdn.babylonjs.com/inspector/babylon.inspector.bundle.js"></script>

        <style>
            html,
            body {
                overflow: hidden;
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
            }

            #renderCanvas {
                width: 100%;
                height: 100%;
                touch-action: none;
            }

            #canvasZone {
                width: 100%;
                height: 100%;
            }
        </style>
    </head>
    <body>
        <div id="canvasZone"><canvas id="renderCanvas"></canvas></div>
        <script>
                    var canvas = document.getElementById("renderCanvas");

                    var startRenderLoop = function (engine, canvas) {
                        engine.runRenderLoop(function () {
                            if (sceneToRender && sceneToRender.activeCamera) {
                                sceneToRender.render();
                            }
                        });
                    }

                    var engine = null;
        var scene = null;
        var sceneToRender = null;
        var createDefaultEngine = function() { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); };
        var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
    sphere.position.y = 1;
    var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);

    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    let dragged = null;
    let pointerStart = new BABYLON.Vector2.Zero();  // stores pointer position at drag start
    var createRectangle = function() {
        var rect = new BABYLON.GUI.Rectangle();
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
        if (eventData.type == BABYLON.PointerEventTypes.POINTERUP) {
            if (dragged) {
                dragged.isPointerBlocker = true;   // re-allow interaction with gui control
                dragged = null;
                camera.attachControl(canvas, true); // re-allow camera control via pointer
            }
        }
        else if (eventData.type == BABYLON.PointerEventTypes.POINTERMOVE && dragged) {
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

    createRectangle().horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    createRectangle().horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

    createRectangle().verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    createRectangle().verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    return scene;

};
                window.initFunction = async function() {
                    
                    
                    
                    var asyncEngineCreation = async function() {
                        try {
                        return createDefaultEngine();
                        } catch(e) {
                        console.log("the available createEngine function failed. Creating the default engine instead");
                        return createDefaultEngine();
                        }
                    }

                    window.engine = await asyncEngineCreation();
        if (!engine) throw 'engine should not be null.';
        startRenderLoop(engine, canvas);
        window.scene = createScene();};
        initFunction().then(() => {sceneToRender = scene
                    });

                    // Resize
                    window.addEventListener("resize", function () {
                        engine.resize();
                    });
        </script>
    </body>
</html>
