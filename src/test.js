const init = async () => {
    const canvas = document.getElementById("renderCanvas");

    if (!canvas) {
        console.error("Canvas element not found. Ensure the canvas has the ID 'renderCanvas'.");
        return;
    }

    const engine = new BABYLON.Engine(canvas, true);
    // const scene = new BABYLON.Scene(engine);
    if (!engine) {
        console.error("Failed to create Babylon.js engine. Check if WebGL is supported.");
        return;
    }

    console.log("Babylon.js engine initialized successfully.");

    const createScene = () => {
        // const engine = new BABYLON.Engine(canvas, true);
        const localScene = new BABYLON.Scene(engine);


        // Add a camera
        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2, 10, BABYLON.Vector3.Zero(), localScene);
        camera.attachControl(canvas, true);

        // Add a light
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), localScene);
        light.intensity = 0.7;

        // Add a sphere
        const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 1 }, localScene);
        const material = new BABYLON.StandardMaterial("material", localScene);
        material.diffuseColor = new BABYLON.Color3(1, 0, 0); // Red color
        sphere.material = material;

        return localScene;
    };

    const scene = createScene();
    const xrExperience = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: 'immersive-ar'
        }
    });
    console.log(xrExperience);
    engine.runRenderLoop(() => {
        scene.render();
    });

    // Handle window resizing
    window.addEventListener("resize", () => {
        engine.resize();
    });
};

// Initialize the app
init();