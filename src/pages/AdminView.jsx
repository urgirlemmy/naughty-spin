import PageLayout from "../components/layout/PageLayout";

export default function AdminView() {
  return (
    <PageLayout>
      <div className="flex flex-col items-center mt-20 gap-4">
        <h1
          className="font-display tracking-widest text-5xl"
          style={{
            background: "linear-gradient(90deg, #9D4EDD, #00F5FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ADMIN PANEL
        </h1>
        <p style={{ color: "var(--text-muted)" }}>Dashboard coming in step 9…</p>
      </div>
    </PageLayout>
  );
}