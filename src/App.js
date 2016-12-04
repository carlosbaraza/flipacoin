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
    this.cameraPosition = new THREE.Vector3(0, 0, 5);

    this.state = {
      coinRotation: new THREE.Euler(),
    };

    this.scenePosition = new THREE.Vector3(0, 0, 0);
    this.directionalLightPosition = new THREE.Vector3(0, 5, 5);

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

          onAnimate={this._onAnimate}
        >
          <scene>
            <perspectiveCamera
              name="camera"
              fov={75}
              aspect={width / height}
              near={0.1}
              far={1000}

              position={this.cameraPosition}
              lookAt={this.scenePosition}
            />
            <ambientLight
              color={0x404040}
            />
            <directionalLight
              color={0xffffff}
              position={this.directionalLightPosition}
              lookAt={this.scenePosition}
            />
            <Coin rotation={this.state.coinRotation} />
          </scene>
        </React3>
      </div>
    );
  }
}

export default App;
