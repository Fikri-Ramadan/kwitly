import RegisterPannel from "@/components/auth/RegisterPannel";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; company?: string; }>;
}) {
  const { name, company } = await searchParams;

  return (
    <div className="flex-1 flex">
      <RegisterPannel initialValues={{ name, company }} />
    </div>
  );
}