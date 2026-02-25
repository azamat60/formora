interface FormResponsesPageProps {
  params: Promise<{ id: string }>;
}

export default async function FormResponsesPage({ params }: FormResponsesPageProps) {
  const { id } = await params;

  return (
    <main>
      <h1>Form Responses</h1>
      <p>Form ID: {id}</p>
    </main>
  );
}
