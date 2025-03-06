// app/itunes-test/page.js
import ITunesSearch from './iTunesSearch';

export const metadata = {
  title: 'iTunes API Test',
  description: 'Testing iTunes API integration for product catalog',
};

export default function ITunesTestPage() {
  return (
    <main className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">iTunes API Integration Test</h1>
      <ITunesSearch />
    </main>
  );
}