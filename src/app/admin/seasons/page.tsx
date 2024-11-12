import { Shell } from "@/components/shell";
import * as React from "react";
import SeasonsHandle from "../_components/seasons/SeasonsHandle";
import { SearchParams } from "nuqs";
import { getSeasons, getUser } from "@/lib/db/queries";
import { paginationParamsCache } from "@/hooks/use-pagination-params";
import { getFilteredArtistsAdmin } from "../lib/queries";
import { redirect } from "next/navigation";

interface AdminSeasonsPageProps {
  searchParams: SearchParams;
}

const AdminSeasonsPage: React.FC<AdminSeasonsPageProps> = async ({
  searchParams,
}) => {
  const user = await getUser();
  const { page, per_page } = paginationParamsCache.parse(searchParams);

  const queryTransactionsParamsArtist =
    typeof searchParams.sArtist === "string" ? searchParams.sArtist : "";

  const queryTransactionsParamsBattle =
    typeof searchParams.sBattle === "string" ? searchParams.sBattle : "";

  //promise all
  const [artists, seasons] = await Promise.all([
    getFilteredArtistsAdmin({
      limit: per_page,
      page,
      nickName: queryTransactionsParamsArtist,
    }),

    getSeasons(),
  ]);

  if (user && user.role !== "ADMIN") {
    redirect("/sign-in");
  }
  return (
    <Shell className="mx-auto" as="main">
      <SeasonsHandle artists={artists} seasons={seasons} />
    </Shell>
  );
};

export default AdminSeasonsPage;
