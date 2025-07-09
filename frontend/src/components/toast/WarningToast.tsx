import Toast, { ToastProps } from "./Toast";

export default function WarningToast({ message }: Omit<ToastProps, 'color'>) {
  return <Toast message={message} color="#FFCC00"/>;
}
