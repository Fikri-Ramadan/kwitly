import Image from "next/image";

interface LogoProps {
  type?: 'light' | 'dark';
  width?: number;
  height?: number;
}

export default function Logo({ type = 'light', width = 96, height = 32 }: LogoProps) {
  return (
    <Image
      src={type === 'light' ? '/kwitly-logo.svg' : '/kwitly-logo-dark.svg'}
      alt='Kwitly Logo'
      width={width}
      height={height}
      priority
      className="object-contain"
    />
  );
}