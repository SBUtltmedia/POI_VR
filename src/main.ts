import { Engine } from "@babylonjs/core/Engines/engine";
import { createSceneAsync } from "./scene";

function setUpEngine(engine: Engine): void {
    window.addEventListener("resize", function () {
        engine.resize();
    });
}

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const engine = new Engine(canvas, true, { stencil: true });

setUpEngine(engine);
createSceneAsync(engine, canvas).then(scene => {
    engine.runRenderLoop(() => scene.render());
});