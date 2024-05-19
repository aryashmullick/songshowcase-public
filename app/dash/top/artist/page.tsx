import TopFifty from "@/Components/top50";
import { Suspense } from "react";
import Loading from "../../loading";

export default function TopPage() {
  return (
    <main>
      <Suspense fallback={<Loading />}>
        <TopFifty artist={true} track={false} />
      </Suspense>
      <br />
      <br />
    </main>
  );
}
