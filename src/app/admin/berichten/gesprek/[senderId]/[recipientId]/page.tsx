import { AdminGesprekClient } from "./admin-gesprek-client";

type PageProps = {
  params: Promise<{ senderId: string; recipientId: string }>;
};

export default async function AdminGesprekPage({ params }: PageProps) {
  const { senderId, recipientId } = await params;
  return (
    <AdminGesprekClient senderId={senderId} recipientId={recipientId} />
  );
}
