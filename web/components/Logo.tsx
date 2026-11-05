import Image from "next/image";

interface LogoProps {
  type?: 'LIGHT' | 'DARK';
  width?: number;
  height?: number;
  className?: string;
}

export default function Logo({ type = 'LIGHT', width = 140, height = 51, className }: LogoProps) {
  return (
    <div className={`w-fit h-auto flex items-center ${className}`}>
      <Image
        src={type === 'LIGHT' ? '/kwitly-logo.svg' : '/kwitly-logo-dark.svg'}
        alt='Kwitly Logo'
        width={width}
        height={height}
        priority
        className="object-contain"
      />
    </div>
  );
}