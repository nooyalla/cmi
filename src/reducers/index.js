
import { combineReducers } from 'redux';
import {reducer as formReducer} from 'redux-form';
import React from 'react';
const rootReducer = combineReducers({
  form :formReducer
});

export default rootReducer;
