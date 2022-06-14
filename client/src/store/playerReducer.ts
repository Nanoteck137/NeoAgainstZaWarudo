import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ServerPlayer } from "../types/server";

const initialState: ServerPlayer = {
  id: "",
  username: "",
  currentRoom: undefined,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setPlayer: (state, action: PayloadAction<ServerPlayer>) => {
      state.id = action.payload.id;
      state.username = action.payload.username;
    },
    setRoom: (state, action: PayloadAction<string>) => {
      state.currentRoom = action.payload;
    },
  },
});

export const { setPlayer, setRoom } = userSlice.actions;
export default userSlice.reducer;
