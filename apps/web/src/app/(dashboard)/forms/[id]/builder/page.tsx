interface FormBuilderPageProps {
  params: Promise<{ id: string }>;
}

export default async function FormBuilderPage({ params }: FormBuilderPageProps) {
  const { id } = await params;

  return (
    <main>
      <h1>Form Builder</h1>
      <p>Form ID: {id}</p>
    </main>
  );
}
