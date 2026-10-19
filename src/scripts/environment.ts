import * as THREE from 'three';

/** Decode the original Babylon RGBD environment without shipping Babylon.
 * The first six PNGs are +X, -X, +Y, -Y, +Z, -Z at full resolution.
 * RGBD stores gamma-encoded RGB divided by alpha (Babylon helperFunctions.fx).
 */
export async function loadOriginalEnvironment(renderer: THREE.WebGLRenderer) {
  const response = await fetch('/3d/sanGiuseppeBridge.env');
  if (!response.ok) throw new Error('Environment could not be loaded');
  const bytes = new Uint8Array(await response.arrayBuffer());
  const headerEnd = bytes.indexOf(0, 8);
  if (headerEnd < 0) throw new Error('Invalid environment header');
  const header = JSON.parse(new TextDecoder().decode(bytes.slice(8, headerEnd)));
  const faces: ImageBitmap[] = [];
  let cube: THREE.CubeTexture | undefined;
  let geometry: THREE.BoxGeometry | undefined;
  let material: THREE.ShaderMaterial | undefined;
  const pmrem = new THREE.PMREMGenerator(renderer);
  try {
    // Decode the six faces in parallel; allSettled so every decoded bitmap is still closed below if one fails.
    const decoded = await Promise.allSettled(header.specular.mipmaps.slice(0, 6).map((face: { position: number; length: number }) => {
      const start = headerEnd + 1 + face.position;
      return createImageBitmap(new Blob([bytes.slice(start, start + face.length)], {type:'image/png'}), {premultiplyAlpha:'none', colorSpaceConversion:'none'});
    }));
    for (const result of decoded) if (result.status === 'fulfilled') faces.push(result.value);
    const failed = decoded.find((result): result is PromiseRejectedResult => result.status === 'rejected');
    if (failed) throw failed.reason;
    cube = new THREE.CubeTexture(faces);
    cube.colorSpace = THREE.NoColorSpace;
    cube.needsUpdate = true;
    geometry = new THREE.BoxGeometry(20,20,20);
    material = new THREE.ShaderMaterial({
      uniforms: { environment: { value: cube } }, side:THREE.BackSide,
      depthWrite:false, toneMapped:false,
      vertexShader:'varying vec3 direction; void main(){ direction=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader:'uniform samplerCube environment; varying vec3 direction; void main(){ vec4 rgbd=textureCube(environment,normalize(direction)); gl_FragColor=vec4(pow(rgbd.rgb,vec3(2.2))/max(rgbd.a,1.0/255.0),1.0); }',
    });
    const environmentScene = new THREE.Scene();
    environmentScene.add(new THREE.Mesh(geometry, material));
    return pmrem.fromScene(environmentScene, 0, .1, 100);
  } finally {
    pmrem.dispose(); cube?.dispose(); geometry?.dispose(); material?.dispose(); faces.forEach(face=>face.close());
  }
}
