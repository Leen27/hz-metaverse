<script setup lang="ts">
import { onMounted } from 'vue';
import * as Cesium from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
(window as any).CESIUM_BASE_URL = '/Cesium';

onMounted(() => {
  const viewer = new Cesium.Viewer('cesiumContainer', {})
})
</script>

<template>
  <main class="absolute flex items-center left-0 top-0 w-full h-screen" >
    <div class="absolute left-0 top-0 w-full h-screen"  id="cesiumContainer"></div>
  </main>
</template>
