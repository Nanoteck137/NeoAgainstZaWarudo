import { KeyboardEventHandler, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../context/socketContext";
import useAppDispatch from "../hooks/useAppDispatch";
import useAppSelector from "../hooks/useAppSelector";
import { setPlayer } from "../store/playerReducer";
import { setUsername } from "../store/userReducer";
import style from "../style/Home.module.scss";
import Player from "../types/Player";

const Home = () => {
  const dispatch = useAppDispatch();
  const { username } = useAppSelector((state) => state.user);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const socket = useContext(SocketContext);
  const [loginError, setLoginError] = useState<string | null>(null);

  const play = () => {
    console.log(socket?.id);

    if (username.length > 0) {
      socket?.emit("client:login", { username }, (player: Player) => {
        console.log({ player });

        if (player) {
          dispatch(setPlayer(player));
          navigate("/browse");
        } else {
          setLoginError("Something went wrong, please try again.");
        }
      });
    } else {
      setError("Please enter a username");
    }
  };

  return (
    <div className={style.container}>
      <div className={style.card}>
        <h1>Cards against humanity</h1>
        <div className={style.usernameInput}>
          <label className="required">Username</label>
          <input
            type="text"
            onChange={(e) => dispatch(setUsername(e.target.value))}
          />
          {error && <p className={style.error}>{error}</p>}
          <button onClick={play}>Play</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
