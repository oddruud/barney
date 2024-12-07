import { useUser } from '@/contexts/UserContext';
import Profile from '@/components/Profile';

export default function ProfileScreen() {
  const { user, setUser } = useUser();

  return (
    <Profile
      user={user}
    />
  );
}