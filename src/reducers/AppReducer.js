/**
 * Global variables are handled here
 * @param {*} state
 * @param {*} action
 *
 * state:
 * * player: THREE.Mesh
 * * camera: THREE.PerspectiveCamera
 * * gui: GUI
 */

export const Actions = {
  UPDATE_PLAYER: 'update_player',
  UPDATE_CAMERA: 'update_camera',
  UPDATE_GUI: 'update_gui',
  UPDATE_SOUND: 'update_sound',
  UPDATE_CHECKPOINTS: 'update_checkpoints',
};

export const AppReducer = (state, action) => {
  switch (action.type) {
    case Actions.UPDATE_PLAYER:
      return {
        ...state,
        player: action.payload,
      };
    case Actions.UPDATE_CAMERA:
      return {
        ...state,
        camera: action.payload,
      };
    case Actions.UPDATE_GUI:
      return {
        ...state,
        gui: action.payload,
      };
    case Actions.UPDATE_SOUND:
      return {
        ...state,
        sound: !action.payload,
      };
    case Actions.UPDATE_CHECKPOINTS:
      return {
        ...state,
        checkpoints: [...state.checkpoints, action.payload],
      };
  }
};
