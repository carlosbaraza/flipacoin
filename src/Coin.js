import React, { Component } from 'react';
import THREE from 'three';
import CANNON from 'cannon/src/Cannon';

class Coin extends Component {
  static propTypes = {
      rotation: React.PropTypes.object,
      position: React.PropTypes.object,
      quaternion: React.PropTypes.object,
      world: React.PropTypes.object,
      addToWorld: React.PropTypes.func,
  }

  constructor(props, context) {
    super(props, context);

    this.geometries = {};

    this.radius = 1.0;
    this.height = 0.2;
    this.radialSegments = 40;
    this.sideTextureRepeat = new THREE.Vector2(16, 1);

    const { position, quaternion } = this.constructPhysicBody();

    this.state = {
      position: new THREE.Vector3().copy(position),
      quaternion: new THREE.Quaternion().copy(quaternion),
    }

    this.constructCaps();
  }

  constructPhysicBody() {
    // Create cylinder shape
    const coinShape = new CANNON.Cylinder(
      this.radius,
      this.radius,
      this.height,
      this.radialSegments
    );

    // Rotate all points of cylinder to match the THREE cylinder
    const coinShapeQuaternion = new CANNON.Quaternion();
    coinShapeQuaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), - Math.PI / 2);
    const coinShapeTranslation = new CANNON.Vec3(0, 0, 0);
    coinShape.transformAllPoints(coinShapeTranslation, coinShapeQuaternion);

    // Give mass to shape
    this.mass = 5;
    this.body = new CANNON.Body({
      mass: this.mass,
    });
    this.body.addShape(coinShape);

    // Add body to world
    this.props.world.addBody(this.body);

    this.body.position.set(0, 10, 0);
    this.body.angularVelocity.set(-20 * Math.random(), 0, 0);
    this.body.velocity.set(0, 10, 0);

    return this.body;
  }

  updatePhysics() {
    const { position, quaternion } = this.body;
    this.setState({
      position: new THREE.Vector3().copy(position),
      quaternion: new THREE.Quaternion().copy(quaternion),
    });
  }

  constructCaps() {
    this.caps = {
      tails: {
        vertices: [],
        faceVertexUvs: [[]],
        faces: [],
      },
      heads: {
        vertices: [],
        faceVertexUvs: [[]],
        faces: [],
      },
    };

    for (var i = 0; i < this.radialSegments; i++) {
      var a = i * 1 / this.radialSegments * Math.PI * 2;
      var z = Math.sin(a);
      var x = Math.cos(a);
      var a1 = (i + 1) * 1 / this.radialSegments * Math.PI * 2;
      var z1 = Math.sin(a1);
      var x1 = Math.cos(a1);

      // Tails
      this.caps.tails.vertices.push(
        new THREE.Vector3(0, -this.height / 2, 0),
        new THREE.Vector3(x * this.radius, -this.height / 2, z * this.radius),
        new THREE.Vector3(x1 * this.radius, -this.height / 2, z1 * this.radius)
      );
      this.caps.tails.faceVertexUvs[0].push([
        new THREE.Vector2(0.5, 0.5),
        new THREE.Vector2(x / 2 + 0.5, z / 2 + 0.5),
        new THREE.Vector2(x1 / 2 + 0.5, z1 / 2 + 0.5)
      ]);
      this.caps.tails.faces.push(new THREE.Face3(i * 3, i * 3 + 1, i * 3 + 2));

      // Heads
      this.caps.heads.vertices.push(
        new THREE.Vector3(0, this.height / 2, 0),
        new THREE.Vector3(x * this.radius, this.height / 2, z * this.radius),
        new THREE.Vector3(x1 * this.radius, this.height / 2, z1 * this.radius)
      );
      this.caps.heads.faceVertexUvs[0].push([
        new THREE.Vector2(0.5, 0.5),
        new THREE.Vector2(x1 / 2 + 0.5, z1 / 2 + 0.5),
        new THREE.Vector2(x / 2 + 0.5, z / 2 + 0.5)
      ]);
      this.caps.heads.faces.push(new THREE.Face3(i * 3, i * 3 + 2, i * 3 + 1));
    }
  }

  componentDidMount() {
    this.geometries.heads.computeFaceNormals();
    this.geometries.tails.computeFaceNormals();
  }

  render() {
    return (
      <group
        position={this.state.position}
        quaternion={this.state.quaternion}
      >
        <resources>
          <meshPhongMaterial
            resourceId="coinSideMaterial"
            color={0xf9d38a}
            side={THREE.DoubleSide}
            bumpScale={0.2}
          >
            <texture
              url="textures/coin-side-hd.jpg"
              wrapS={THREE.RepeatWrapping}
              wrapT={THREE.RepeatWrapping}
              repeat={this.sideTextureRepeat}
            />
            <texture
              url="textures/coin-side-bump-hd.jpg"
              slot={'bumpMap'}
              wrapS={THREE.RepeatWrapping}
              wrapT={THREE.RepeatWrapping}
              repeat={this.sideTextureRepeat}
            />
          </meshPhongMaterial>
          <meshPhongMaterial
            resourceId="coinTailsMaterial"
            color={0xf9d38a}
            side={THREE.DoubleSide}
            bumpScale={0.1}
          >
            <texture
              url="textures/coin-tails-hd.jpg"
              wrapS={THREE.RepeatWrapping}
              wrapT={THREE.RepeatWrapping}
              repeat={this.textureRepeat}
            />
            <texture
              url="textures/coin-tails-hd.jpg"
              slot={'bumpMap'}
              wrapS={THREE.RepeatWrapping}
              wrapT={THREE.RepeatWrapping}
              repeat={this.textureRepeat}
            />
          </meshPhongMaterial>
          <meshPhongMaterial
            resourceId="coinHeadsMaterial"
            color={0xf9d38a}
            side={THREE.DoubleSide}
            bumpScale={0.1}
          >
            <texture
              url="textures/coin-heads-hd.jpg"
              wrapS={THREE.RepeatWrapping}
              wrapT={THREE.RepeatWrapping}
              repeat={this.textureRepeat}
            />
            <texture
              url="textures/coin-heads-hd.jpg"
              slot={'bumpMap'}
              wrapS={THREE.RepeatWrapping}
              wrapT={THREE.RepeatWrapping}
              repeat={this.textureRepeat}
            />
          </meshPhongMaterial>
        </resources>

        <mesh
          rotation={this.props.rotation}
          castShadow
        >
          <cylinderGeometry
            ref={geo => this.geometries.side = geo}
            radiusTop={this.radius}
            radiusBottom={this.radius}
            height={this.height}
            radialSegments={this.radialSegments}
            openEnded={1}
          />
          <materialResource
            resourceId={'coinSideMaterial'}
          />
        </mesh>
        <mesh
          rotation={this.props.rotation}
          castShadow
        >
          <geometry
            ref={geo => this.geometries.tails = geo}
            faces={this.caps.tails.faces}
            vertices={this.caps.tails.vertices}
            faceVertexUvs={this.caps.tails.faceVertexUvs}
          />
          <materialResource
            resourceId={'coinTailsMaterial'}
          />
        </mesh>
        <mesh
          rotation={this.props.rotation}
          castShadow
        >
          <geometry
            ref={geo => this.geometries.heads = geo}
            faces={this.caps.heads.faces}
            vertices={this.caps.heads.vertices}
            faceVertexUvs={this.caps.heads.faceVertexUvs}
          />
          <materialResource
            resourceId={'coinHeadsMaterial'}
          />
        </mesh>
      </group>
    );
  }
}

export default Coin;
