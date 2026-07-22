import Link from "next/link";
import { RegisterForm } from "@/components/RegisterForm";

export const metadata = { title: "Create an account | Property Website" };

export default function RegisterPage() {
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
        <RegisterForm />
      </main>
    </>
  );
}
