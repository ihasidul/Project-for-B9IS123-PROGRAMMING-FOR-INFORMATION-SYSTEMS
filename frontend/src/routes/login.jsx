import { createFileRoute } from '@tanstack/react-router';
import LoginForm from '../components/auth/LoginForm.jsx';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  return <LoginForm />;
}
