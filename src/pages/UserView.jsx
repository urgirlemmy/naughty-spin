import { useState } from "react";
import SpinWheel from "../components/SpinWheel";
import PageLayout from "../components/layout/PageLayout";

export default function UserView() {
  const [result, setResult] = useState(null);

  return (
    <PageLayout>
      <SpinWheel onFinish={setResult} />
    </PageLayout>
  );
}
