<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { initCanvas } from './main';
import "@babylonjs/loaders/glTF";
import { HemisphericLight, SceneLoader, Vector3 } from "@babylonjs/core";

(window as any).CESIUM_BASE_URL = '/Cesium';

const canvasRef = ref(null);
onMounted(() => {
  if(!canvasRef.value) return;
  const render = initCanvas(canvasRef.value)

  // const light = new HemisphericLight("light", new Vector3(1, 1, 0));

  // SceneLoader.ImportMesh("", "http://localhost:5173/public/3d/", "cube.glb", render.scene, function (meshes) {
  // });

  // SceneLoader.ImportMeshAsync("semi_house", "https://assets.babylonjs.com/meshes/", "both_houses_scene.babylon");


})

</script>

<template>
  <main class="absolute flex items-center left-0 top-0 w-full h-screen" >
    <div class="absolute left-0 top-0 w-full h-screen"  id="cesiumContainer"></div>
    <canvas ref="canvasRef" class="absolute left-0 top-0 w-full h-screen pointer-events-none"  id="canvas"></canvas>
  </main>
</template>
