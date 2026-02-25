interface PublicFormPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicFormPage({ params }: PublicFormPageProps) {
  const { slug } = await params;

  return (
    <main>
      <h1>Public Form</h1>
      <p>Slug: {slug}</p>
    </main>
  );
}
