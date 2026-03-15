import { Redirect } from 'expo-router';

// TODO: check auth state and conditionally redirect to (tabs)/dashboard
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
