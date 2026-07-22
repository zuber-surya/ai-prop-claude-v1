import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { getSafeRedirect } from "@/lib/redirect";

export const metadata = { title: "Sign in | Property Website" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const nextRaw = params.next;
  const nextPath = getSafeRedirect(Array.isArray(nextRaw) ? nextRaw[0] : nextRaw);

  return (
    <>
      <header className="border-b border-outline-variant bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center px-4 md:px-10">
          <Link href="/" className="text-xl font-bold text-on-surface">
            Property Website
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <LoginForm nextPath={nextPath} />
      </main>
    </>
  );
}
