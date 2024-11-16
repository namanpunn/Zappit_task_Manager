import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import UserMenu from "./user-menu";
import { PenBox } from "lucide-react";
import Image from "next/image";
import { checkUser } from "@/lib/checkUser";
import UserLoading from "./user-loading";

async function Header() {
  await checkUser()

  return (
    <header className="container mx-auto">
      <nav className="py-6 px-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold">
            <div className="flex space-x-2">
              <div className="bg-[#707AAC] text-white text-lg md:text-xl font-bold p-1 md:p-2 rounded-md">Z</div>
              <div className="bg-[#707AAB] text-white text-lg md:text-xl font-bold p-1 md:p-2 rounded-md">A</div>
              <div className="bg-[#707AAB] text-white text-lg md:text-xl font-bold p-1 md:p-2 rounded-md">P</div>
              <div className="bg-[#707AAB] text-white text-lg md:text-xl font-bold p-1 md:p-2 rounded-md">P</div>
              <div className="bg-[#707AAB] text-white text-lg md:text-xl font-bold p-1 md:p-2 rounded-md">I</div>
              <div className="bg-[#707AAB] text-white text-lg md:text-xl font-bold p-1 md:p-2 rounded-md">T</div>
            </div>
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/project/create">
            <Button variant="destructive" className="flex items-center gap-2">
              <PenBox size={18} />
              <span className="hidden md:inline">Create Project</span>
            </Button>
          </Link>
          <SignedOut>
            <SignInButton forceRedirectUrl="/onboarding">
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserMenu />
          </SignedIn>
        </div>
      </nav>

    <UserLoading/>
    </header>
  );
}

export default Header;