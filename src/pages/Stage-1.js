'use strict';
import React, {useEffect, useState, useRef, useContext} from 'react';
import {AppDispatchContext, AppStateContext} from '../contexts/AppContext';
import {useNavigate} from 'react-router-dom';
import '../App.css';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {PositionalAudioHelper} from '../utils/PositionalAudioHelper';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {Howl, Howler} from 'howler';
import Stats from 'stats.js';
import equal from 'fast-deep-equal';
import {MeshBVH, MeshBVHVisualizer} from 'three-mesh-bvh';
import Modal from '../components/Modal';
import {Actions} from '../reducers/AppReducer';

const Stage1 = ({isSoundOn}) => {
  const mountRef = useRef(null);
  const [isModal, setIsModal] = useState(false);
  const [openCheckpoint, setOpenCheckpoint] = useState({});
  const [music, setMusic] = useState('./Nature.mp3');
  const {state: appState} = useContext(AppStateContext);
  const {dispatch: appDispatch} = useContext(AppDispatchContext);

  let checkpoints = [
    {
      url: 'https://uselessfacts.jsph.pl/random.json',
      item: 'Magic pencil',
      img_url: 'https://cdn.custom-cursor.com/packs/1758/pack2387.png',
      number: 0,
    },
    {
      url: 'https://uselessfacts.jsph.pl/random.json',
      item: 'Wifi password',
      img_url:
        'https://w7.pngwing.com/pngs/635/274/png-transparent-computer-icons-wi-fi-wifi-password-angle-logo-internet.png',
      number: 1,
    },
  ];

  const params = {
    firstPerson: false,
    displayCollider: false,
    displayBVH: false,
    visualizeDepth: 10,
    gravity: -30,
    playerSpeed: 10,
    physicsSteps: 5,
    reset: reset,
  };

  let renderer,
    camera,
    scene,
    clock,
    gui,
    stats,
    playerPositionClone,
    cubeA,
    cubeB,
    cubeC;
  let isMuted = false;
  let environment, collider, visualizer, player, controls, stairs;
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
  // create an AudioListener and add it to the camera
  const listener = new THREE.AudioListener();
  const sound = new THREE.Audio(listener);
  // load a sound and set it as the Audio object's buffer
  const audioLoader = new THREE.AudioLoader();
  const sound1 = new THREE.PositionalAudio(listener);
  let songElement;
  const navigate = useNavigate();

  function init() {
    const bgColor = 0x263238;

    // renderer setup
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(bgColor, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    mountRef.current.appendChild(renderer.domElement);

    // scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(bgColor, 20, 40);

    // lights
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1.5, 1).multiplyScalar(50);
    light.shadow.mapSize.setScalar(2048);
    light.shadow.bias = -1e-4;
    light.shadow.normalBias = 0.05;
    light.castShadow = true;

    const shadowCam = light.shadow.camera;
    shadowCam.bottom = shadowCam.left = -80;
    shadowCam.top = 80;
    shadowCam.right = 75;

    scene.add(light);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 0.4));

    clock = new THREE.Clock();

    controls = new OrbitControls(appState.camera, renderer.domElement);
    controls.enabled = false;

    // stats setup
    stats = new Stats();
    document.body.appendChild(stats.dom);

    loadColliderEnvironment();

    //cubes
    cubeA = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({color: 'blue'})
    );
    // cubeB = new THREE.Mesh(geometry, material);
    // cubeC = new THREE.Mesh(geometry, material);
    cubeA.position.set(-46, 2, -19);
    // cubeB.position.set(15, 6, -3);
    // cubeC.position.set(20, 6, -3);
    // cusad
    //create a group and add the two cubes
    //These cubes can now be rotated / scaled etc as a group
    const group = new THREE.Group();
    group.add(cubeA);

    scene.add(group);
    //audio
    appState.camera.add(listener);
    // audioLoader.load('./Nature.mp3', function (buffer) {
    //   sound.setBuffer(buffer);
    //   sound.setLoop(true);
    //   sound.setVolume(0.5);
    //   sound.play();
    // });
    // Setup the new Howl.
    const envSound = new Howl({
      src: ['./Nature.mp3'],
    });
    envSound.loop(true);
    envSound.play();

    // Play the sound.
    sound.play();
    const helper = new PositionalAudioHelper(sound1, 15);
    songElement = document.getElementById('e-room');
    sound1.setMediaElementSource(songElement);
    sound1.setRefDistance(10);
    sound1.setMaxDistance(35);
    sound1.setDistanceModel('linear');
    sound1.setDirectionalCone(230, 230, 0.1);
    sound1.add(helper);
    if (isSoundOn) {
      songElement.play();
      cubeA.add(sound1);
    }

    scene.add(appState.player);
    reset();

    // dat.gui
    appState.gui.add(params, 'firstPerson').onChange((v) => {
      if (!v) {
        appState.camera.position
          // .sub(controls.target)
          .normalize()
          .multiplyScalar(10)
          .add(controls.target);
        appDispatch(Actions.UPDATE_CAMERA, appState.camera);
      }
    });

    const visFolder = appState.gui.addFolder('Visualization');
    visFolder.add(params, 'displayCollider');
    visFolder.add(params, 'displayBVH');
    visFolder.add(params, 'visualizeDepth', 1, 20, 1).onChange((v) => {
      visualizer.depth = v;
      visualizer.update();
    });
    visFolder.open();

    const physicsFolder = appState.gui.addFolder('Player');
    physicsFolder.add(params, 'physicsSteps', 0, 30, 1);
    physicsFolder.add(params, 'gravity', -100, 100, 0.01).onChange((v) => {
      params.gravity = parseFloat(v);
    });
    physicsFolder.add(appState.player, 'speed', 1, 20);
    physicsFolder.open();

    appState.gui.add(params, 'reset');
    appState.gui.open();
    appDispatch(Actions.UPDATE_GUI, appState.gui);

    window.addEventListener(
      'resize',
      function () {
        appState.camera.aspect = window.innerWidth / window.innerHeight;
        appState.camera.updateProjectionMatrix();
        appDispatch(Actions.UPDATE_CAMERA, appState.camera);

        renderer.setSize(window.innerWidth, window.innerHeight);
      },
      false
    );

    appState.player.registerEvents();
  }

  function loadColliderEnvironment() {
    new GLTFLoader().load('./stages/EA_AllLetters_v6.glb', (res) => {
      environment = res.scene;
      environment.scale.setScalar(1.5);

      const pointLight = new THREE.PointLight(0xffffff);
      pointLight.distance = 8;
      pointLight.position.set(0, 50, 0);
      environment.add(pointLight);

      const porchLight = new THREE.PointLight(0xffffff);
      porchLight.distance = 15;
      porchLight.intensity = 5;
      porchLight.position.set(0, 100, 135);
      porchLight.shadow.normalBias = 1e-2;
      porchLight.shadow.bias = -1e-3;
      porchLight.shadow.mapSize.setScalar(1024);
      porchLight.castShadow = true;

      environment.add(porchLight);

      // collect all geometries to merge
      const geometries = [];
      environment.updateMatrixWorld(true);
      environment.traverse((c) => {
        if (c.geometry) {
          const cloned = c.geometry.clone();
          cloned.applyMatrix4(c.matrixWorld);
          for (const key in cloned.attributes) {
            if (key !== 'position') {
              cloned.deleteAttribute(key);
            }
          }

          geometries.push(cloned);
        }
      });

      // create the merged geometry
      const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
        geometries,
        false
      );
      mergedGeometry.boundsTree = new MeshBVH(mergedGeometry);

      collider = new THREE.Mesh(mergedGeometry);
      collider.material.wireframe = true;
      collider.material.opacity = 0.5;
      collider.material.transparent = true;

      visualizer = new MeshBVHVisualizer(collider, params.visualizeDepth);
      scene.add(visualizer);
      scene.add(collider);
      scene.add(environment);

      environment.traverse((c) => {
        // console.log(c.userData);
        if (c.material) {
          c.castShadow = true;
          c.receiveShadow = true;
          c.material.shadowSide = 2;
        }
        if (c.userData.name === 'LP_Stairs') {
          stairs = c;
          stairs.visible = true;
        }
      });
    });
  }

  function reset() {
    appState.player.velocity.set(0, 0, 0);
    appState.player.position.set(-38, 15, -10);
    appState.camera.position.sub(controls.target);
    controls.target.copy(appState.player.position);
    appState.camera.position.add(appState.player.position);
    appDispatch(Actions.UPDATE_CAMERA, appState.camera);
    appDispatch(Actions.UPDATE_PLAYER, appState.player);
    controls.update();
  }

  //modal logic
  async function showModal(checkpoint) {
    if (isModal) return;
    if (!checkpoint) return;
    setIsModal(true);
    setOpenCheckpoint(checkpoint);
  }

  function hideModal() {
    setOpenCheckpoint({});
    setIsModal(false);
  }

  function updatePlayer(delta, isSoundOn) {
    playerPositionClone = appState.player.getPosition();

    if (playerPositionClone.y <= 3.5) {
      console.log(isSoundOn);
      Howler.volume(0.0);
    } else if (isSoundOn) {
      Howler.volume(1.0);
    }

    if (equal(playerPositionClone, {x: -46, y: 2, z: -19})) {
      const currentCheckpoint = checkpoints.find(
        (checkpoint) => checkpoint.number === 1
      );
      if (currentCheckpoint) {
        showModal(currentCheckpoint);
        checkpoints = checkpoints.filter(
          (checkpoint) => checkpoint.number !== 1
        );
        cubeA.material = new THREE.MeshBasicMaterial({color: 'red'});
        stairs.visible = true;
      }
    }

    // if (equal(playerPositionClone, { x: 20, y: 7, z: -4 })) {
    //   const currentCheckpoint = checkpoints.find(
    //     (checkpoint) => checkpoint.number === 1
    //   );
    //   showModal(currentCheckpoint);
    //   checkpoints = checkpoints.filter((checkpoint) => checkpoint.number !== 1);
    //   cubeC.material = new THREE.MeshBasicMaterial({ color: 'red' });
    // }

    // move the player
    const angle = controls.getAzimuthalAngle();

    appState.player.movePlayer(delta, angle, collider, params.gravity);

    // adjust the camera
    appState.camera.position.sub(controls.target);
    controls.target.copy(appState.player.position);
    appState.camera.position.add(appState.player.position);
    appDispatch(Actions.UPDATE_CAMERA, appState.camera);
    appDispatch(Actions.UPDATE_PLAYER, appState.player);

    // if the player has fallen too far below the level reset their position to the start
    if (appState.player.position.y < -25) {
      reset();
    }
  }

  function navigateTo(url) {
    appState.gui.close();
    navigate(url);
  }

  function render(isSound) {
    stats.update();
    requestAnimationFrame(() => render(isSound));

    const delta = Math.min(clock.getDelta(), 0.1);
    if (params.firstPerson) {
      controls.maxPolarAngle = Math.PI;
      controls.minDistance = 1e-4;
      controls.maxDistance = 1e-4;
    } else {
      controls.maxPolarAngle = Math.PI / 2;
      controls.minDistance = 1;
      controls.maxDistance = 20;
    }

    if (collider) {
      collider.visible = params.displayCollider;
      visualizer.visible = params.displayBVH;

      const physicsSteps = params.physicsSteps;
      for (let i = 0; i < physicsSteps; i++) {
        updatePlayer(delta / physicsSteps, isSoundOn);
      }
    }

    controls.update();

    renderer.render(scene, appState.camera);
  }

  // const startAudio = (musicFile) => {
  //   isSoundOn = true;
  //   console.log(isSoundOn);

  // };
  useEffect(() => {
    // if the state has not loaded yet, then suspend
    if (!appState) return;
    console.log(appState.player.position);
    init();
    render(isSoundOn);
  }, []);

  useEffect(() => {
    if (!isSoundOn) {
      isMuted = true;
      Array.from(document.querySelectorAll('audio, video')).forEach(
        (el) => (el.muted = true)
      );
      // sound.pause();
      Howler.volume(0.0);
    } else {
      isMuted = true;
      Howler.volume(1.0);
      Array.from(document.querySelectorAll('audio, video')).forEach(
        (el) => (el.muted = false)
      );
    }
  }, [isSoundOn]);

  return (
    <React.Fragment>
      <Modal checkpoint={openCheckpoint} isModal={isModal}>
        <button
          className='bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded m-6'
          onClick={hideModal}
        >
          Close
        </button>
      </Modal>
      <div className='App h-full overflow-hidden'>
        <div ref={mountRef}></div>
      </div>
      <audio id='ambient' preload='auto' className='hidden'>
        <source src='./Nature.mp3' type='audio/mpeg' />
      </audio>
      <audio loop id='e-room' preload='auto' className='hidden'>
        <source src='./beat-loop.mp3' type='audio/mpeg' />
      </audio>
      <audio id='utopia' loop preload='auto' className='hidden'>
        <source src='sounds/Project_Utopia.ogg' type='audio/ogg' />
        <source src='sounds/Project_Utopia.mp3' type='audio/mpeg' />
      </audio>
      <iframe
        src='silence.mp3'
        allow='autoplay'
        id='audio'
        className='hidden'
      ></iframe>
    </React.Fragment>
  );
};

export default Stage1;
