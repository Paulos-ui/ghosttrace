import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GHOSTTRACE | The Infrastructure Afterlife',
  icons: { icon: '/favicon.svg' },
  description: 'Reconstruct the ghosts of failed infrastructure with inspectable open-weight AI. A forensic laboratory for forgotten incidents.',
  openGraph: {
    title: 'GHOSTTRACE | Every failure leaves a ghost',
    description: 'A forensic AI laboratory that traces infrastructure failures back through their evidence.',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
