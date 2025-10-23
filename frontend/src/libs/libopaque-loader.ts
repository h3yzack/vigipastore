
let libopaqueModule: any = null;
let libopaqueReady = false;

export async function loadLibopaque(): Promise<any> {
    if (!libopaqueReady) {
        try {
            // Set up global context first
            (globalThis as any).libopaque_mod = {
                preRun: [],
                postRun: [],
                // print: console.log,
                // printErr: console.error,
                // setStatus: console.log,
                totalDependencies: 0,
                monitorRunDependencies: function(left: number) {
                    // console.log(`libopaque dependencies: ${left} remaining`);
                }
            };

            // Load the script dynamically
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = '/libopaque/libopaque.js';
                script.onload = () => {
                    // Give it a moment to initialize
                    setTimeout(() => {
                        libopaqueModule = (globalThis as any).libopaque_mod;
                        libopaqueReady = true;
                        resolve(libopaqueModule);
                    }, 100);
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });
        } catch (error) {
            console.error('Failed to load libopaque script:', error);
            throw error;
        }
    }
    return libopaqueModule;
}