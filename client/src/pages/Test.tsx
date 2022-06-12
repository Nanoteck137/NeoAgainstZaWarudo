import useAppSelector from "../hooks/useAppSelector";

const Test = () => {
  const { username } = useAppSelector((state) => state.user);

  return (
    <div>
      <h1>{username}</h1>
    </div>
  );
};

export default Test;
