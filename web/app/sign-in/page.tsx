import BrandPannel from "@/components/BrandPannel";

export default function Page() {
  return (
    <div className="flex-1 min-h-screen flex font-sans text-white">
      <BrandPannel />
      <div className="flex-1 w-full bg-cyan-50">b</div>
    </div>
  );
}