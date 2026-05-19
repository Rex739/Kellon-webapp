import { FC } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cards",
  description:
    "Manage your Kellon cards and spending tools from one secure place.",
  alternates: {
    canonical: "/cards",
  },
};

// interface pageProps {

// }

const page: FC = ({}) => {
  return <section>Cards</section>;
};

export default page;
