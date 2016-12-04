import React, { Component } from 'react';
import Coin from './Coin';
import styles from './App.scss';
import THREE from 'three';
import CANNON from 'cannon/src/Cannon';
import React3 from 'react-three-renderer';

class App extends Component {
  constructor(props, context) {
    super(props, context);

    // construct the position vector here, because if we use 'new' within render,
    // React will think that things have changed when they have not.

    this.state = {
      cameraPosition: new THREE.Vector3(0, 10, 4),
      cameraLookAt: new THREE.Vector3(0, 10, 0),
      // coinRotation: new THREE.Euler(),
      // coinPosition: new THREE.Vector3(0, 10, 0),
      meshStates: [{}],
    };

    this.scenePosition = new THREE.Vector3(0, 0, 0);
    this.directionalLightPosition = new THREE.Vector3(20, 20, 20);

    this.groundQuaternion = new THREE.Quaternion()
      .setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

    const world = new CANNON.World();

    const bodies = [];

    const initCannon = () => {
      world.quatNormalizeSkip = 0;
      world.quatNormalizeFast = false;

      world.gravity.set(0, -10, 0);
      world.broadphase = new CANNON.NaiveBroadphase();

      const mass = 5;

      const coinShape = new CANNON.Cylinder(
        1.0,
        1.0,
        0.2,
        40
      );
      const coinShapeQuaternion = new CANNON.Quaternion();
      coinShapeQuaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), - Math.PI / 2);
      const coinShapeTranslation = new CANNON.Vec3(0, 0, 0);
      coinShape.transformAllPoints(coinShapeTranslation, coinShapeQuaternion);
      const coinBody = new CANNON.Body({
        mass,
      });
      coinBody.addShape(coinShape);

      coinBody.position.set(0, 10, 0);
      coinBody.angularVelocity.set(-20 * Math.random(), 0, 0);
      coinBody.velocity.set(0, 10, 0);
      world.addBody(coinBody);
      bodies.push(coinBody);

      const groundShape = new CANNON.Plane();
      const groundBody = new CANNON.Body({ mass: 0 });

      groundBody.addShape(groundShape);
      groundBody.quaternion
        .setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);

      world.addBody(groundBody);

      const shape = new CANNON.Sphere(0.1);
      const jointBody = new CANNON.Body({ mass: 0 });
      jointBody.addShape(shape);
      jointBody.collisionFilterGroup = 0;
      jointBody.collisionFilterMask = 0;

      world.addBody(jointBody);

      this.jointBody = jointBody;
    };

    initCannon();

    const timeStep = 1 / 60;
    const updatePhysics = () => {
      // Step the physics world
      world.step(timeStep);
    };

    const _getMeshStates = () => bodies
      .map(({ position, quaternion }, bodyIndex) => ({
        position: new THREE.Vector3().copy(position),
        quaternion: new THREE.Quaternion().copy(quaternion),
      }));

    this._onAnimate = () => {
      updatePhysics();

      this.setState({
        meshStates: _getMeshStates(),
      });
    };
  }

  render() {
    const width = window.innerWidth; // canvas width
    const height = window.innerHeight; // canvas height

    return (
      <div className={styles.app}>
        <React3
          mainCamera="camera" // this points to the perspectiveCamera which has the name set to "camera" below
          width={width}
          height={height}
          alpha
          antialias
          pixelRatio={window.devicePixelRatio}

          shadowMapEnabled
          gammaInput
          gammaOutput

          onAnimate={this._onAnimate}
        >
          <scene>
            <perspectiveCamera
              name="camera"
              fov={75}
              aspect={width / height}
              near={0.1}
              far={100}

              position={this.state.cameraPosition}
              lookAt={this.state.meshStates[0].position}
            />
            <ambientLight
              color={0x404040}
            />
            <directionalLight
              color={0xffffff}
              position={this.directionalLightPosition}
              lookAt={this.scenePosition}

              castShadow
              shadowMapWidth={1024}
              shadowMapHeight={1024}

              shadowCameraLeft={-20}
              shadowCameraRight={20}
              shadowCameraTop={20}
              shadowCameraBottom={-20}

              shadowCameraFar={3 * 20}
              shadowCameraNear={20}
            />
            <mesh
              castShadow
              receiveShadow

              quaternion={this.groundQuaternion}
            >
              <planeBufferGeometry
                width={200}
                height={100}
                widthSegments={1}
                heightSegments={1}
              />
              <meshLambertMaterial
                color={0xFEFEFE}
              />
            </mesh>
            <Coin
              position={this.state.meshStates[0].position}
              quaternion={this.state.meshStates[0].quaternion}
            />
          </scene>
        </React3>
      </div>
    );
  }
}

export default App;
