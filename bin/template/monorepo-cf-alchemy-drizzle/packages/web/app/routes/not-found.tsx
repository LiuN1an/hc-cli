import { Link } from 'react-router';
import { Button } from '~/components/ui/button';

export function meta() {
  return [{ title: '404 - Not Found' }];
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <p className="mt-4 text-xl text-muted-foreground">Page not found</p>
        <Link to="/" className="mt-8 inline-block">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
