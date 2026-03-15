import PageLayout from "../components/layout/PageLayout";
import SlotMachine from "../components/SlotMachine";
import { SpinProvider } from "../context/SpinContext";

export default function Game() {
  return (
    <SpinProvider>
      <PageLayout>
        <SlotMachine />
      </PageLayout>
    </SpinProvider>
  );
}