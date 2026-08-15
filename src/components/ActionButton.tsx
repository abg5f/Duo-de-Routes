import type { ButtonHTMLAttributes } from 'react';

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

const base =
  'flex min-h-14 flex-1 items-center justify-center rounded-xl px-4 text-base font-medium ' +
  'transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] ' +
  'disabled:opacity-40 disabled:active:scale-100';

const variants = {
  primary: 'bg-accent text-accent-fg active:bg-accent-active',
  secondary: 'bg-surface text-fg active:bg-surface-active',
};

export default function ActionButton({
  variant = 'secondary',
  className = '',
  ...props
}: ActionButtonProps) {
  return <button type="button" className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
