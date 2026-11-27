import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { avatarColor, avatarName, cn } from '@/lib/utils';

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  src?: string | null;
  className?: string;
  fallbackClassName?: string;
}

export default function UserAvatar({
  name,
  email,
  src,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const identifier = name || email || '';
  const initials = avatarName(identifier);
  const color = avatarColor(identifier);

  return (
    <Avatar className={cn('size-9 border border-line', className)}>
      <AvatarImage src={src ?? undefined} alt={identifier || 'User Avatar'} />
      <AvatarFallback
        className={cn(
          'text-xs font-semibold tracking-wide',
          color.bg,
          color.text,
          fallbackClassName
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}