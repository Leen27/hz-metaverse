import * as Cesium from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";
import { Engine, Scene, Vector3, MeshBuilder, Color4, FreeCamera, TransformNode, StandardMaterial, Color3, Matrix } from "@babylonjs/core";

export const initCanvas = (canvas) => {
    const _this: Record<string, any> = {};

    const LNG = -122.4175, LAT = 37.655;
    
    function initCesium() {
        const viewer = new Cesium.Viewer('cesiumContainer', {
            terrainProvider: Cesium.createWorldTerrain(),
            useDefaultRenderLoop: false
        });
    
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
    }
    
    function moveBabylonCamera() {
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
        const camera_pos = cart2vec(transform),
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
    
    function cart2vec(cart) {
        return new Vector3(cart.x, cart.z, cart.y);
    }
    
    initCesium();
    initBabylon();
    _this.engine.runRenderLoop(() => {
        _this.viewer.render();
        moveBabylonCamera();
        _this.scene.render();
    });
}
