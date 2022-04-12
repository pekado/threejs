import {
  Mesh,
  PerspectiveCamera,
  MeshStandardMaterial,
  Line3,
  Vector3,
} from 'three';

class Camera extends PerspectiveCamera {
  camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    50
  );

  constructor() {
    // initialize the camera
    super(75, window.innerWidth / window.innerHeight, 0.1, 50);
    this.position.set(10, 50, 50);
    this.far = 20;
    // this.updateProjectionMatrix();
  }
}

export default Camera;
