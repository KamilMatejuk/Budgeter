import Toast, { ToastProps } from "./Toast";

export default function Error({ message }: Omit<ToastProps, 'color'>) {
  return <Toast message={message} color="#F44336"/>;
}
