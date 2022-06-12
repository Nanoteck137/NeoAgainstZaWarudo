import { KeyboardEventHandler, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAppDispatch from "../hooks/useAppDispatch";
import useAppSelector from "../hooks/useAppSelector";
import { setUsername } from "../store/userReducer";
import style from "../style/Home.module.scss";

const Home = () => {
  const dispatch = useAppDispatch();
  const { username } = useAppSelector((state) => state.user);
  const navigate = useNavigate();

  return (
    <div>
      <div className={style.card}>
        <h1>Cards against humanity</h1>
        <div className={style.usernameInput}>
          <label>Username {username}</label>
          <input
            type="text"
            onChange={(e) => dispatch(setUsername(e.target.value))}
          />
          <button onClick={() => navigate("/test")}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
