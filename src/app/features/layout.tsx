import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features | RepurposeAI',
  description: 'Explore all the powerful features of RepurposeAI - AI-powered content repurposing platform.',
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


