import * as T from 'three';

/** Player-centered haze is independent of camera orbit and scene-entry state. */
export function memoryAtmosphere() {
  const visitor = { value: new T.Vector2() };
  const color = { value: new T.Color() };
  const clear = { value: 4 };
  const far = { value: 11 };

  function layer(root: T.Object3D, initialReveal = 1, canFade = true) {
    const reveal = { value: initialReveal };
    const lights: { light: T.Light; intensity: number }[] = [];
    const materials = new Set<T.Material>();
    root.traverse(object => {
      if (object instanceof T.Light) lights.push({ light: object, intensity: object.intensity });
      if (object instanceof T.Mesh || object instanceof T.Line) {
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
      }
    });
    for (const material of materials) {
      material.transparent = canFade || material.transparent;
      material.onBeforeCompile = shader => {
        Object.assign(shader.uniforms, { memoryVisitor: visitor, memoryHaze: color, memoryClear: clear, memoryFar: far, memoryReveal: reveal, memoryHazeScale: {value:material.userData.memoryHazeScale ?? 1} });
        shader.vertexShader = 'varying vec3 vMemoryPosition;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `
          #include <project_vertex>
          vec4 memoryWorld = vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
            memoryWorld = instanceMatrix * memoryWorld;
          #endif
          vMemoryPosition = (modelMatrix * memoryWorld).xyz;
        `);
        shader.fragmentShader = `varying vec3 vMemoryPosition;
          uniform vec2 memoryVisitor;
          uniform vec3 memoryHaze;
          uniform float memoryClear, memoryFar, memoryReveal, memoryHazeScale;
        ` + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace('#include <fog_fragment>', `
          #include <fog_fragment>
          float memoryDistance = length(vMemoryPosition.xz - memoryVisitor);
          float memoryFog = smoothstep(memoryClear, memoryFar, memoryDistance) * memoryHazeScale;
          gl_FragColor.rgb = mix(gl_FragColor.rgb, memoryHaze, memoryFog);
          gl_FragColor.a *= memoryReveal;
        `);
      };
      material.customProgramCacheKey = () => 'unr-player-haze-v2';
      material.needsUpdate = true;
    }
    return {
      setReveal(value: number) {
        reveal.value = value;
        root.visible = value > .003;
        // Keep existing depth writes so fading multi-part avatars cannot disappear behind their props.
        for (const { light, intensity } of lights) light.intensity = intensity * value;
      },
      get reveal() { return reveal.value; },
    };
  }
  return {
    layer,
    update(position: T.Vector3, sky: T.Color, immersion: number) {
      visitor.value.set(position.x, position.z);
      color.value.copy(sky).convertLinearToSRGB();
      clear.value = T.MathUtils.lerp(2.5, 8.5, immersion);
      far.value = T.MathUtils.lerp(8.5, 15.5, immersion);
    },
  };
}
