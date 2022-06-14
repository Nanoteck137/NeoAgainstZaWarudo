import { useState } from "react";
import style from "../style/Home.module.scss";

interface Props {
  login: (username: string) => boolean,
}

const Home = ({ login }: Props) => {
  const [username, setUsername] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line
  const [loginError, setLoginError] = useState<string | null>(null);

  const play = () => {
    if (username.length > 0) {
      if(!login(username)) {
        // TODO(patrik): Can we do this? Because maybe the parent re-renders 
        // and we lose this?
        setLoginError("Something went wrong, please try again.");
      }
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
            onChange={(e) => setUsername(e.target.value)}
          />
          {error && <p className={style.error}>{error}</p>}
          <button onClick={play}>Play</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
