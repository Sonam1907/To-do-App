import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      {session?.user ? (
        <>
          <p>Signed in as {session.user.email}</p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="outline">
              Log out
            </Button>
          </form>
        </>
      ) : (
        <>
          <p>You are not signed in.</p>
          <div className="flex gap-3">
            <Button render={<Link href="/login">Log in</Link>} />
            <Button variant="outline" render={<Link href="/signup">Sign up</Link>} />
          </div>
        </>
      )}
    </div>
  );
}
