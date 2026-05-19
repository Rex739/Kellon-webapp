import Continue from "@/components/auth/Continue";
import { FC } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Continue",
  description:
    "Continue to Kellon and access your wallet for borderless payments and global investments.",
  alternates: {
    canonical: "/continue",
  },
};

const page: FC = ({}) => {
  return <Continue />;
};

export default page;
