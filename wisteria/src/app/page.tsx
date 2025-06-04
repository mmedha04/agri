"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RedirectProps {
  to: string;
}

const Redirect: React.FC<RedirectProps> = ({ to }) => {
  const router = useRouter();

  useEffect(() => {
    router.push("/signup");
  }, [to, router]);

  return null;
};

export default Redirect;
