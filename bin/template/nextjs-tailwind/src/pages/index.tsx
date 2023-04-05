import { Inter } from "next/font/google";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return <div>Home</div>;
}

export const getServerSideProps: GetServerSideProps = async ({
  locale,
}) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
  };
};
