import { useReducer, useCallback } from "react";

type PaginatedArrayReducerAction<ValueType> =
  | { type: "add"; payload: ValueType[] }
  | { type: "remove"; payload: string[] };

/**
 * A custom hook that manages a paginated array of objects. It prevents
 * duplicates from being added to the array and also allows for
 * insertion-sorting added items with the optional sortFn parameter.
 *
 * @param keyField: the unique key for each object in the list; it's used to
 * prevent duplicates from being added.
 * @param initialState
 * @param sortFn
 * @returns
 */
function usePaginatedArrayReducer<ValueType extends Record<string, unknown>>(
  keyField: string,
  initialState: ValueType[],
  sortFn?: (a: ValueType, b: ValueType) => number,
) {
  const [state, dispatch] = useReducer(
    (
      state: ValueType[],
      action: PaginatedArrayReducerAction<ValueType>,
    ): ValueType[] => {
      switch (action.type) {
        case "add": {
          // Check for duplicates
          const newItems = action.payload.filter((item) => {
            return !state.some(
              (existingItem) => existingItem[keyField] === item[keyField],
            );
          });
          const items = state.concat(newItems);
          if (sortFn) {
            return items.sort(sortFn);
          } else {
            return items;
          }
        }
        case "remove": {
          return state.filter(
            // @ts-expect-error because 'any' is disallowed
            (item) => !action.payload.includes(item[keyField]),
          );
        }
        default:
          // this is impossible, yay typescript :)
          return state;
      }
    },
    initialState,
  );

  const add = useCallback(
    (item: ValueType[]) => dispatch({ type: "add", payload: item }),
    [],
  );
  const remove = useCallback(
    (key: string[]) => dispatch({ type: "remove", payload: key }),
    [],
  );

  return { state, add, remove };
}

export { usePaginatedArrayReducer, type PaginatedArrayReducerAction };
