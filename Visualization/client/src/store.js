import { createStore, applyMiddleware, compose } from "redux";

import thunk from "redux-thunk";
import reducers from "./reducers";

export const middlewares = [thunk];

const enhancers = [applyMiddleware(...middlewares)];
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// create store
export const store = createStore(reducers, {}, composeEnhancers(...enhancers));