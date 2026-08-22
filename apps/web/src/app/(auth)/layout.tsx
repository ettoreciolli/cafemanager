export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}