import ButtonWithLoader, { ButtonWithLoaderProps } from "./ButtonWithLoader";

interface ButtonWithProgressProps extends ButtonWithLoaderProps {
  current: number;
  max: number;
}

export default function ButtonWithProgress({
  current,
  max,
  ...props
}: ButtonWithProgressProps) {
  return (
    <div className="relative w-full">
      <ButtonWithLoader {...props} className="w-full" />
      {max > 0 && (
        <div
          className="absolute inset-0 h-full rounded-xl pointer-events-none opacity-25 bg-gray-800 transition-all"
          style={{ width: `${Math.min((current / max) * 100, 100)}%` }}
        />
      )}
    </div>
  );
}
