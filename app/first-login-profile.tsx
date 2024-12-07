import { useUser } from '@/contexts/UserContext';
import Profile from '@/components/Profile';

export default function FirstLoginProfileScreen() {
  const { user, setUser } = useUser();

  return (
    <Profile
      user={user}
      firstLogin={true}
    />
  );
}