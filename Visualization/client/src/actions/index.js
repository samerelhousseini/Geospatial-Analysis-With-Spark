
import {
    CHANGE_VIEWPORT
} from '../constants';




export const changeViewport = (viewport) => {
    return {
        type: CHANGE_VIEWPORT,
        payload: viewport
    };
}; 


