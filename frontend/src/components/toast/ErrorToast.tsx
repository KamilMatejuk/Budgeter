import Toast, { ToastProps } from "./Toast";

export default function ErrorToast({ message, ...props }: Omit<ToastProps, 'color'>) {
  return <Toast message={message} color="#F44336" {...props} />;
}
