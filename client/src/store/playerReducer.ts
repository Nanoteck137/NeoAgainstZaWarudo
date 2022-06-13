import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Player from "../types/Player";
import Room from "../types/Room";

const initialState: Player = {
  id: "",
  username: "",
  currentRoom: undefined,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setPlayer: (state, action: PayloadAction<Player>) => {
      state.id = action.payload.id;
      state.username = action.payload.username;
    },
    setRoom: (state, action: PayloadAction<Room>) => {
      state.currentRoom = action.payload;
    },
  },
});

export const { setPlayer, setRoom } = userSlice.actions;
export default userSlice.reducer;
