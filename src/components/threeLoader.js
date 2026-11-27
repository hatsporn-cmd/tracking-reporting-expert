let threeModules;

export function loadThree() {
  if (!threeModules) {
    threeModules = Promise.all([
      import(/* @vite-ignore */ 'https://esm.sh/three@0.180.0'),
      import(/* @vite-ignore */ 'https://esm.sh/three@0.180.0/examples/jsm/controls/OrbitControls.js'),
    ]).then(([THREE, controls]) => ({ THREE, OrbitControls: controls.OrbitControls })).catch(error => {
      threeModules = null;
      throw error;
    });
  }
  return threeModules;
}
