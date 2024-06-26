import { useReducer } from "react";

// keyField is the unique key for each item in the list; it's used to prevent
// duplicates from being added.
type PaginatedArrayReducerAction<ValueType> =
  | { type: "add"; payload: ValueType[] }
  | { type: "remove"; payload: string[] };

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
            return !state.some((existingItem) => {
              const val = existingItem[keyField] === item[keyField];
              if (val) {
                console.log(`>>>Item ${item[keyField]} already exists`);
              }
              return val;
            });
          });
          console.log(`Adding ${newItems.length} new items`);
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

  const add = (item: ValueType[]) => dispatch({ type: "add", payload: item });
  const remove = (key: string[]) => dispatch({ type: "remove", payload: key });

  return { state, add, remove };
}

export { usePaginatedArrayReducer, type PaginatedArrayReducerAction };
