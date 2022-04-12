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
  UPDATE_PLAYER: "update_player",
  UPDATE_CAMERA: "update_camera",
  UPDATE_GUI: "update_gui"
}

export const AppReducer = (state, action) => {
  switch (action.type) {
    case Actions.UPDATE_PLAYER:
      return {
        ...state,
        player: action.payload
      }
    case Actions.UPDATE_CAMERA:
      return {
        ...state,
        camera: action.payload
      }
    case Actions.UPDATE_GUI:
      return {
        ...state,
        gui: action.payload
      }
  }
}