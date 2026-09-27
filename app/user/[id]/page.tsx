import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserRedirectPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/u/${encodeURIComponent(id)}`);
}
