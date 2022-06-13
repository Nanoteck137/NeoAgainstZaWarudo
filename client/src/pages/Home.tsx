import { KeyboardEventHandler, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAppDispatch from "../hooks/useAppDispatch";
import useAppSelector from "../hooks/useAppSelector";
import useSocket from "../hooks/useSocket";
import { setUsername } from "../store/userReducer";
import style from "../style/Home.module.scss";

const Home = () => {
  const dispatch = useAppDispatch();
  const { username } = useAppSelector((state) => state.user);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const socket = useSocket();

  const play = () => {
    if (username.length > 0) {
      socket?.emit("initialize", { username });
      navigate("/browse");
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
