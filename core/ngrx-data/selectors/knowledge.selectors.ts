import {createSelector, createFeatureSelector} from '@ngrx/store';

export const selectKnowledgeStates = (state: any) => state;
export const getKnowledgeFeature = createFeatureSelector<any>('knowledge');
export const getKnowledge = createSelector(selectKnowledgeStates, (state: any) => state.knowledge);

