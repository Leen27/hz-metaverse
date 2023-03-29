import * as Cesium from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, Vector3, HemisphericLight, MeshBuilder, Color4, FreeCamera, TransformNode, StandardMaterial, Color3, Matrix, SceneLoader } from "@babylonjs/core";

export type TRenderEngine = {
    viewer: Cesium.Viewer | null;
    engine: Engine | null;
    [k: string]: any;
}

export const initCanvas = (canvas: HTMLCanvasElement): TRenderEngine => {
    const _this: Record<string, any> = {};

    const LNG = 120.24318610821572, LAT = 29.7218163632983;
    
    function initCesium() {
        // const viewer = new Cesium.Viewer('cesiumContainer', {
        //     // terrainProvider: Cesium.createWorldTerrain(),
        //     useDefaultRenderLoop: false
        // });


        const viewer: any = new Cesium.Viewer('cesiumContainer', {
            baseLayerPicker: true, // 如果设置为false，将不会创建右上角图层按钮。
            geocoder: true, // 如果设置为false，将不会创建右上角查询(放大镜)按钮。
            navigationHelpButton: false, // 如果设置为false，则不会创建右上角帮助(问号)按钮。
            homeButton: false, // 如果设置为false，将不会创建右上角主页(房子)按钮。
            sceneModePicker: false, // 如果设置为false，将不会创建右上角投影方式控件(显示二三维切换按钮)。
            animation: false, // 如果设置为false，将不会创建左下角动画小部件。
            timeline: false, // 如果设置为false，则不会创建正下方时间轴小部件。
            fullscreenButton: false, // 如果设置为false，将不会创建右下角全屏按钮。
            scene3DOnly: true, // 为 true 时，每个几何实例将仅以3D渲染以节省GPU内存。
            shouldAnimate: false, // 默认true ，否则为 false 。此选项优先于设置 Viewer＃clockViewModel 。
            // ps. Viewer＃clockViewModel 是用于控制当前时间的时钟视图模型。我们这里用不到时钟，就把shouldAnimate设为false
            infoBox: false, // 是否显示点击要素之后显示的信息
            sceneMode: 3, // 初始场景模式 1 2D模式 2 2D循环模式 3 3D模式  Cesium.SceneMode
            requestRenderMode: false, // 启用请求渲染模式，不需要渲染，节约资源吧
            fullscreenElement: document.body, // 全屏时渲染的HTML元素 暂时没发现用处，虽然我关闭了全屏按钮，但是键盘按F11 浏览器也还是会进入全屏
            // imageryProvider: creaetNonMapProvider(),
            useDefaultRenderLoop: false
        });

        //默认的Cesium会加载一个bingMap底图，网络不太好，一般要先去掉这个默认的
        viewer.imageryLayers.remove(viewer.imageryLayers.get(0));
        // 隐藏cesium ion
        (viewer as any)._cesiumWidget._creditContainer.style.display = 'none';
        //地形遮挡效果开关，打开后地形会遮挡看不到的区域
        viewer.scene.globe.depthTestAgainstTerrain = true;
        // 显示底图
        viewer.scene.globe.show = true;
        //关闭天空盒，否则会显示天空颜色
        viewer.scene.skyBox.show = false;
        //背景透明
        viewer.scene.backgroundColor = new Cesium.Color(0.0, 0.0, 0.0, 0.0);
        //关闭大气
        viewer.scene.skyAtmosphere.show = false;
        //抗锯齿
        (viewer.scene as any).fxaa = true;
        viewer.scene.postProcessStages.fxaa.enabled = true;
    
        viewer.camera.flyTo({
            destination : Cesium.Cartesian3.fromDegrees(LNG, LAT, 300),
            orientation : {
                heading : Cesium.Math.toRadians(0.0),
                pitch : Cesium.Math.toRadians(-90.0),
            }
        });
    
        _this.viewer = viewer;
        _this.base_point = cart2vec(Cesium.Cartesian3.fromDegrees(LNG, LAT, 50));
        _this.base_point_up = cart2vec(Cesium.Cartesian3.fromDegrees(LNG, LAT, 300));

        const layer = new Cesium.UrlTemplateImageryProvider({
            url: "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
            minimumLevel: 4,
            maximumLevel: 18
        })
        viewer.imageryLayers.addImageryProvider(layer);
    }
    
    function initBabylon() {
        const engine = new Engine(canvas);
        const scene = new Scene(engine);
        scene.clearColor = new Color4(0, 0, 0, 0);
    
        const camera = new FreeCamera("camera", new Vector3(0, 0, -10), scene);
    
        _this.root_node = new TransformNode("BaseNode", scene);
        _this.root_node.lookAt(_this.base_point_up.subtract(_this.base_point));
        _this.root_node.addRotation(Math.PI / 2, 0, 0);

        const box = MeshBuilder.CreateBox("box", {size: 10}, scene);
        const material = new StandardMaterial("Material", scene);
        material.emissiveColor = new Color3(1, 0, 0);
        material.alpha = 0.5;
        box.material = material;
        box.parent = _this.root_node;
    
        const ground = MeshBuilder.CreateGround("ground", {
            width: 100,
            height: 100
        }, scene);
        ground.material = material;
        ground.parent = _this.root_node;

        _this.engine = engine;
        _this.scene = scene;
        _this.camera = camera;

        _this.scene.autoClear = false;
        _this.scene.detachControl();
        _this.scene.beforeRender = function(){
        _this.engine.wipeCaches(true);
        }
        const light = new HemisphericLight("light", new Vector3(1, 1, 0));

    }
    
    function moveBabylonCamera() {
        if (!_this.viewer) return;

        const fov = Cesium.Math.toDegrees(_this.viewer.camera.frustum.fovy)
        _this.camera.fov = fov / 180 * Math.PI;
    
        const civm = _this.viewer.camera.inverseViewMatrix;
        const camera_matrix = Matrix.FromValues(
            civm[0 ], civm[1 ], civm[2 ], civm[3 ],
            civm[4 ], civm[5 ], civm[6 ], civm[7 ],
            civm[8 ], civm[9 ], civm[10], civm[11],
            civm[12], civm[13], civm[14], civm[15]
        );
    
        const scaling = Vector3.Zero(), rotation = Vector3.Zero(), transform = Vector3.Zero();
        camera_matrix.decompose(scaling, rotation as any, transform);
        const camera_pos = cart2vec(transform as any),
            camera_direction = cart2vec(_this.viewer.camera.direction),
            camera_up = cart2vec(_this.viewer.camera.up);
    
        let rotation_y = Math.atan(camera_direction.z / camera_direction.x);
        if (camera_direction.x < 0) rotation_y += Math.PI;
        rotation_y = Math.PI / 2 - rotation_y;
        const rotation_x = Math.asin(-camera_direction.y);
        const camera_up_before_rotatez = new Vector3(-Math.cos(rotation_y), 0, Math.sin(rotation_y));
        let rotation_z = Math.acos(camera_up.x * camera_up_before_rotatez.x + camera_up.y * camera_up_before_rotatez.y + camera_up.z * camera_up_before_rotatez.z);
        rotation_z = Math.PI / 2 - rotation_z;
        if (camera_up.y < 0) rotation_z = Math.PI - rotation_z;
    
        _this.camera.position.x = camera_pos.x - _this.base_point.x;
        _this.camera.position.y = camera_pos.y - _this.base_point.y;
        _this.camera.position.z = camera_pos.z - _this.base_point.z;
        _this.camera.rotation.x = rotation_x;
        _this.camera.rotation.y = rotation_y;
        _this.camera.rotation.z = rotation_z;
    }
    
    function cart2vec(cart: Cesium.Cartesian3) {
        return new Vector3(cart.x, cart.z, cart.y);
    }
    
    initCesium();
    initBabylon();
    _this.engine.runRenderLoop(() => {
        _this.viewer.render();
        moveBabylonCamera();
        _this.scene.render();
    });

    return _this as TRenderEngine;
}
