<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { initCanvas } from './main';

(window as any).CESIUM_BASE_URL = '/Cesium';

const canvasRef = ref(null);
onMounted(() => {
    initCanvas(canvasRef.value)
})

</script>

<template>
  <main class="absolute flex items-center left-0 top-0 w-full h-screen" >
    <div class="absolute left-0 top-0 w-full h-screen"  id="cesiumContainer"></div>
    <canvas ref="canvasRef" class="absolute left-0 top-0 w-full h-screen pointer-events-none"  id="canvas"></canvas>
  </main>
</template>
