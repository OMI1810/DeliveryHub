import { TabBar } from "@/components/ui/TabBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold">
              Delivery<span className="text-emerald-500">Hub</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-4 pb-20 max-w-lg mx-auto w-full">
        {children}
      </main>

      {/* Bottom tab bar */}
      <TabBar />
    </div>
  );
}
