import Image from "next/image";

interface LogoProps {
  type?: 'LIGHT' | 'DARK';
  width?: number;
  height?: number;
}

export default function Logo({ type = 'LIGHT', width = 192, height = 64 }: LogoProps) {
  return (
    <Image
      src={type === 'LIGHT' ? '/kwitly-logo.svg' : '/kwitly-logo-dark.svg'}
      alt='Kwitly Logo'
      width={width}
      height={height}
      priority
      className="h-8 w-auto object-contain"
    />
  );
}