import {Mesh, MeshStandardMaterial, Line3, Vector3, Box3, Matrix4} from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

class Player extends Mesh {
  speed = 10;
  vector = new Vector3();
  upVector = new Vector3(0, 1, 0);
  velocity = new Vector3();
  fwdPressed = false;
  bkdPressed = false;
  lftPressed = false;
  rgtPressed = false;
  isOnGround = true;

  constructor() {
    super(
      new RoundedBoxGeometry(1.0, 2.0, 1.0, 10, 0.5),
      new MeshStandardMaterial()
    );
    // initialize the player
    this.geometry.translate(0, -0.5, 0);
    this.capsuleInfo = {
      radius: 0.5,
      segment: new Line3(new Vector3(), new Vector3(0, -1.0, 0.0)),
    };
    this.castShadow = true;
    this.receiveShadow = true;
    this.material.shadowSide = 2;

    // this.registerEvents();
  }

  getPosition = () => {
    return {
      x: Math.floor(this.position.x),
      y: Math.floor(this.position.y),
      z: Math.floor(this.position.z),
    };
  };

  /**
   * move the player
   * @param string direction
   * @param {*} delta
   * @param {*} angle
   */
  movePlayer = (delta, angle, collider, gravity) => {
    // console.log(this.getPosition());
    if (this.fwdPressed) {
      this.vector.set(0, 0, -1).applyAxisAngle(this.upVector, angle);
      this.position.addScaledVector(this.vector, this.speed * delta);
    }

    if (this.bkdPressed) {
      this.vector.set(0, 0, 1).applyAxisAngle(this.upVector, angle);
      this.position.addScaledVector(this.vector, this.speed * delta);
    }

    if (this.lftPressed) {
      this.vector.set(-1, 0, 0).applyAxisAngle(this.upVector, angle);
      this.position.addScaledVector(this.vector, this.speed * delta);
    }

    if (this.rgtPressed) {
      this.vector.set(1, 0, 0).applyAxisAngle(this.upVector, angle);
      this.position.addScaledVector(this.vector, this.speed * delta);
    }

    this.velocity.y += this.isOnGround ? 0 : delta * gravity;
    this.position.addScaledVector(this.velocity, delta);

    this.updateMatrixWorld();

    let tempVector = new Vector3();
    let tempVector2 = new Vector3();
    let tempBox = new Box3();
    let tempMat = new Matrix4();
    let tempSegment = new Line3();

    // adjust player position based on collisions
    const capsuleInfo = this.capsuleInfo;
    tempBox.makeEmpty();
    tempMat.copy(collider.matrixWorld).invert();
    tempSegment.copy(capsuleInfo.segment);

    // get the position of the capsule in the local space of the collider
    tempSegment.start.applyMatrix4(this.matrixWorld).applyMatrix4(tempMat);
    tempSegment.end.applyMatrix4(this.matrixWorld).applyMatrix4(tempMat);

    // get the axis aligned bounding box of the capsule
    tempBox.expandByPoint(tempSegment.start);
    tempBox.expandByPoint(tempSegment.end);

    tempBox.min.addScalar(-capsuleInfo.radius);
    tempBox.max.addScalar(capsuleInfo.radius);

    collider.geometry.boundsTree.shapecast({
      intersectsBounds: (box) => box.intersectsBox(tempBox),

      intersectsTriangle: (tri) => {
        // check if the triangle is intersecting the capsule and adjust the
        // capsule position if it is.
        const triPoint = tempVector;
        const capsulePoint = tempVector2;

        const distance = tri.closestPointToSegment(
          tempSegment,
          triPoint,
          capsulePoint
        );
        if (distance < capsuleInfo.radius) {
          const depth = capsuleInfo.radius - distance;
          const direction = capsulePoint.sub(triPoint).normalize();

          tempSegment.start.addScaledVector(direction, depth);
          tempSegment.end.addScaledVector(direction, depth);
        }
      },
    });

    // get the adjusted position of the capsule collider in world space after checking
    // triangle collisions and moving it. capsuleInfo.segment.start is assumed to be
    // the origin of the player model.
    const newPosition = tempVector;
    newPosition.copy(tempSegment.start).applyMatrix4(collider.matrixWorld);

    // check how much the collider was moved
    const deltaVector = tempVector2;
    deltaVector.subVectors(newPosition, this.position);

    // if the player was primarily adjusted vertically we assume it's on something we should consider ground
    this.isOnGround = deltaVector.y > Math.abs(delta * this.velocity.y * 0.25);

    const offset = Math.max(0.0, deltaVector.length() - 1e-5);
    deltaVector.normalize().multiplyScalar(offset);

    // adjust the player model
    this.position.add(deltaVector);

    if (!this.isOnGround) {
      deltaVector.normalize();
      this.velocity.addScaledVector(
        deltaVector,
        -deltaVector.dot(this.velocity)
      );
    } else {
      this.velocity.set(0, 0, 0);
    }
  };

  registerEvents = () => {
    window.addEventListener(
      'keydown',
      (e) => {
        console.log('keydown', this.getPosition());
        switch (e.code) {
          case 'ArrowUp':
            this.fwdPressed = true;
            break;
          case 'ArrowDown':
            this.bkdPressed = true;
            break;
          case 'ArrowRight':
            this.rgtPressed = true;
            break;
          case 'ArrowLeft':
            this.lftPressed = true;
            break;
          case 'Space':
            if (this.isOnGround) {
              this.velocity.y = 10.0;
            }

            break;
        }
      },
      {passive: true}
    );

    window.addEventListener(
      'keyup',
      (e) => {
        // console.log("keyup", e.code);
        switch (e.code) {
          case 'ArrowUp':
            this.fwdPressed = false;
            break;
          case 'ArrowDown':
            this.bkdPressed = false;
            break;
          case 'ArrowRight':
            this.rgtPressed = false;
            break;
          case 'ArrowLeft':
            this.lftPressed = false;
            break;
        }
      },
      {passive: true}
    );
  };
}

export default Player;
