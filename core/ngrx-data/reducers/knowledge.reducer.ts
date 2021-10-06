import { createReducer, on } from '@ngrx/store';
import { KnowledgeAction } from '../actions';

export const initialState = {
  knowledge: '',
};

export function knowledgeReducer(state, action) {
  return knowledgeReducerFunc(state, action);
}

const arr = [
  'knowledge',
];

function getReducerFunc(arrP) {
  const arrFunc = [];
  arrP.forEach((e) => {
    arrFunc.push(
      on(KnowledgeAction[e + 'Action'], (state, action) => {
        return Object.assign({}, state, { [e]: action.payload });
      })
    );
  });
  return arrFunc;
}

const knowledgeReducerFunc = createReducer(
  initialState,
  ...getReducerFunc(arr),
  on(KnowledgeAction.mutiAction, (state, action) => {
    return Object.assign({}, state, { ...action.payload });
  })
);

export const Key = 'knowledge';
