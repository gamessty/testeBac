import { ColorSchemeToggle } from '../../components/ColorSchemeToggle/ColorSchemeToggle';
import SignIn from '../../components/SignIn/SignIn';
import SignInButton from '../../components/SignInButton/SignInButton';
import SignOutButton from '../../components/SignOutButton/SignOutButton';
import UserAvatar from '../../components/UserAvatar/UserAvatar';
import { Welcome } from '../../components/Welcome/Welcome';

export default function HomePage() {
  return (
    <>
      <Welcome />
      <ColorSchemeToggle />
      <SignInButton />
      <SignOutButton />
      <SignIn />
      <UserAvatar />
    </>
  );
}