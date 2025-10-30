import Toast, { ToastProps } from "./Toast";

export default function WarningToast({ message, ...props }: Omit<ToastProps, 'color'>) {
  return <Toast message={message} color="#FFCC00" {...props} />;
}
