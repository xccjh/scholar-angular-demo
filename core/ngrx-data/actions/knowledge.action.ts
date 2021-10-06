import { createAction, props } from '@ngrx/store';

export const knowledgeAction = createAction(
  '[Knowledge] knowledgeAction',
  props<{ payload: string }>()
);

export const mutiAction = createAction(
  '[Home] mutiAction',
  props<{ payload: object }>()
);

