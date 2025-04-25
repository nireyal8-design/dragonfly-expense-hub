import logo from '@/logo.png';

interface LogoProps {
  size?: "small" | "medium" | "large";
}

export function Logo({ size = "medium" }: LogoProps) {
  const sizes = {
    small: { height: "h-12" },
    medium: { height: "h-16" },
    large: { height: "h-24" },
  };

  return (
    <img src={logo} alt="Logo" className={`${sizes[size].height} w-auto`} />
  );
}
