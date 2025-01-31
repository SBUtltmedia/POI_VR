import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import mkcert from 'vite-plugin-mkcert';



export default defineConfig(({ command, mode }) => {
    return {
        resolve: {
            alias: {
                'babylonjs': mode === 'development' ? 'babylonjs/babylon.max' : 'babylonjs'
            }
        },
        plugins: [mkcert()],
        // server: {
        //     https: {
        //         key: fs.readFileSync(path.resolve(__dirname, 'localhost+2-key.pem')),
        //         cert: fs.readFileSync(path.resolve(__dirname, 'localhost+2.pem'))
        //     },
        //     open: true, // Automatically open the app in the browser
        // }

    };
});
