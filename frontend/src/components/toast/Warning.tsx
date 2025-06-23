import Toast, { ToastProps } from "./Toast";

export default function Warning({ message }: Omit<ToastProps, 'color'>) {
  return <Toast message={message} color="#FFCC00"/>;
}
