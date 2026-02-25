import Link from 'next/link';
import { getApiHealth } from '@/lib/api-client';

export default async function HomePage() {
  let healthMessage = 'API not reachable yet';

  try {
    const health = await getApiHealth();
    healthMessage = `${health.service}: ${health.status} (${health.timestamp})`;
  } catch {
    healthMessage = 'API health check failed';
  }

  return (
    <main>
      <h1>Formora Starter</h1>
      <p>{healthMessage}</p>
      <ul>
        <li>
          <Link href="/forms">Dashboard: Forms</Link>
        </li>
        <li>
          <Link href="/f/sample-form">Public Form</Link>
        </li>
      </ul>
    </main>
  );
}
