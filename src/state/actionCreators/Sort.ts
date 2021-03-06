import { ActionTypes } from "../actionTypes"

export const updateSort = (e: any) => {
  return { type: ActionTypes.UPDATE_SORT, payload: e?.target.value }
}

export const sortProducts = () => {
  return { type: ActionTypes.SORT_PRODUCTS }
}
