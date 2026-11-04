import { RiLoader5Fill } from "react-icons/ri";

const classes = {
  container: "flex w-full items-center justify-center p-8 text-subtext",
  icon: "animate-spin",
};

export default function Loader() {
  return (
    <div className={classes.container}>
      <RiLoader5Fill size={32} className={classes.icon} />
    </div>
  );
}
