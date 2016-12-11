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
      meshStates: {},
      result: null,
      results: [],
    };

    this.scenePosition = new THREE.Vector3(0, 0, 0);
    this.directionalLightPosition = new THREE.Vector3(20, 20, 20);

    this.groundQuaternion = new THREE.Quaternion()
      .setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

    this.world = new CANNON.World();

    const initCannon = () => {
      this.world.quatNormalizeSkip = 0;
      this.world.quatNormalizeFast = false;

      this.world.gravity.set(0, -10, 0);
      this.world.broadphase = new CANNON.NaiveBroadphase();

      const groundShape = new CANNON.Plane();
      const groundBody = new CANNON.Body({ mass: 0 });

      groundBody.addShape(groundShape);
      groundBody.quaternion
        .setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);

      this.world.addBody(groundBody);
    };

    initCannon();

    const timeStep = 1 / 60;
    const updatePhysics = () => {
      // Step the physics this.world
      this.world.step(timeStep);
    };

    this._onAnimate = () => {
      if (this.state.result) {
        return;
      }
      else if (this.meshRefs['coin'].result()) {
        const result = this.meshRefs['coin'].result();
        this.state.results.push(result);
        this.setState({
          result: result,
          results: this.state.results
        });
      }
      else {
        updatePhysics();

        this.setState({
          meshStates: Object.keys(this.meshRefs)
            .reduce((meshStates, key) => {
              const component = this.meshRefs[key];
              const { position, quaternion } = component.body;
              meshStates[key] = {
                position: new THREE.Vector3().copy(position),
                quaternion: new THREE.Quaternion().copy(quaternion),
              };
              component.updatePhysics();
              return meshStates;
            }, {}),
        });
      }
    };

    this.meshRefs = {};
  }

  flipCoin() {
    if (window.analytics) window.analytics.track('Clicked Flip Coin');
    this.meshRefs['coin'].reset();
    setTimeout(() => this.setState({
      result: null,
    }), 0);
  }

  render() {
    const width = window.innerWidth; // canvas width
    const height = window.innerHeight; // canvas height

    const cameraLookAt = (this.state.meshStates['coin'] || {}).position ||
      new THREE.Vector3(0, 10, 0);

    return (
      <div className={styles.app}>
        <div className={styles.ui}>
          <ol className={styles.results}>
            {(() => {
              return this.state.results.map((result, i) => (
                <li key={i}>{result}</li>
              ));
            })()}
          </ol>
          <button className={styles.button} onClick={this.flipCoin.bind(this)}>
            Flip
            <span>the</span>
            coin
          </button>
        </div>
        <React3
          mainCamera="camera" // this points to the perspectiveCamera which has the name set to "camera" below
          width={width}
          height={height}
          alpha
          antialias
          pixelRatio={window.devicePixelRatio}
          forceManualRender={this.state.result ? true : false}
          onManualRenderTriggerCreated={() => { /* just to stop the warning */ }}

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
              lookAt={cameraLookAt}
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
                color={0xffde25}
              />
            </mesh>
            <Coin
              // position={this.state.bodies['coin'].position}
              // quaternion={this.state.bodies['coin'].quaternion}
              world={this.world}
              ref={component => this.meshRefs['coin'] = component}
            />
          </scene>
        </React3>
      </div>
    );
  }
}

export default App;
