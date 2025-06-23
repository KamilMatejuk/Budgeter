import Toast, { ToastProps } from "./Toast";

export default function Info({ message }: Omit<ToastProps, 'color'>) {
  return <Toast message={message} color="#4D5CAC"/>;
}
