import React, { Component } from 'react';
import Coin from './Coin';
import styles from './App.scss';
import THREE from 'three';
import React3 from 'react-three-renderer';

class App extends Component {
  constructor(props, context) {
    super(props, context);

    // construct the position vector here, because if we use 'new' within render,
    // React will think that things have changed when they have not.

    this.state = {
      cameraPosition: new THREE.Vector3(0, 10, 4),
      cameraLookAt: new THREE.Vector3(0, 10, 0),
      coinRotation: new THREE.Euler(),
      coinPosition: new THREE.Vector3(0, 10, 0),
    };

    this.scenePosition = new THREE.Vector3(0, 0, 0);
    this.directionalLightPosition = new THREE.Vector3(20, 20, 20);

    this.groundQuaternion = new THREE.Quaternion()
      .setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

    this._onAnimate = () => {
      // we will get this callback every frame

      // pretend coinRotation is immutable.
      // this helps with updates and pure rendering.
      // React will be sure that the rotation has now updated.
      this.setState({
        coinRotation: new THREE.Euler(
          this.state.coinRotation.x + 0.01,
          this.state.coinRotation.y + 0.01,
          0
        ),
        coinPosition: new THREE.Vector3(
          this.state.coinPosition.x,
          this.state.coinPosition.y - 0.015,
          this.state.coinPosition.z
        ),
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
              lookAt={this.state.coinPosition}
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
              position={this.state.coinPosition}
              rotation={this.state.coinRotation}
            />
          </scene>
        </React3>
      </div>
    );
  }
}

export default App;
