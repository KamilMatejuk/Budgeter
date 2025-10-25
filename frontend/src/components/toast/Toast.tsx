export interface ToastProps {
  message: string;
  color: string;
}

export default function Toast({ message, color }: ToastProps) {
  return (
    <div
      className={`p-4 rounded-lg border`}
      style={{color: color, borderColor: color, backgroundColor: `${color}20`}}>
      <p className="text-center">{message}</p>
    </div>
  );
}
