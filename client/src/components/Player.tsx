import { ServerPlayer } from "../types/server";
import style from "../style/Player.module.scss";

interface Props {
  player: ServerPlayer | null;
  host: string | undefined;
  me: ServerPlayer | null;
}

const Player = ({ player, host, me }: Props) => {
  if (!player || !me || !host) return <></>;

  let usernameOutput = player.username;

  if (player.id === host) {
    usernameOutput += " (host)";
  } else if (player.id === me.id) {
    usernameOutput += " (you)";
  }

  return (
    <div className={style.player}>
      <p className={style.name}>{usernameOutput}</p>
      {me.id === host && player.id !== me.id && (
        <button className={style.kickBtn}>Kick</button>
      )}
    </div>
  );
};

export default Player;
