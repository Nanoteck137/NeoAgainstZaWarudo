import { Action, configureStore } from "@reduxjs/toolkit";
import playerReducer from "./playerReducer";
import userReducer from "./userReducer";

const store = configureStore({
  reducer: {
    user: userReducer,
    player: playerReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;