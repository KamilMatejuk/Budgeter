import Toast, { ToastProps } from "./Toast";

export default function ErrorToast({ message }: Omit<ToastProps, 'color'>) {
  return <Toast message={message} color="#F44336"/>;
}
