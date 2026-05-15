"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#F6F8F7] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        {/* Big 404 */}
        <div className="text-[120px] font-black leading-none text-[#E4EAE7] select-none mb-2">
          404
        </div>

        {/* Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#024430] mb-4 shadow-lg">
          <span className="text-white font-black text-2xl">D</span>
        </div>

        <h1 className="text-xl font-bold text-[#10231C] mb-2">Trang không tìm thấy</h1>
        <p className="text-sm text-[#6B7A73] mb-6 leading-relaxed">
          Đường dẫn này không tồn tại trong hệ thống DCP.
          <br />Vui lòng kiểm tra lại URL hoặc quay về trang chủ.
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-semibold rounded-xl border-2 border-[#E4EAE7] text-[#6B7A73] hover:text-[#10231C] hover:border-[#10231C] transition-colors"
          >
            ← Quay lại
          </button>
          <Link href="/login">
            <button className="px-4 py-2 text-sm font-semibold rounded-xl text-white bg-[#024430] hover:opacity-90 transition-opacity">
              Trang chủ
            </button>
          </Link>
        </div>

        {/* Supply chain pills */}
        <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap text-xs">
          {[
            { icon: "🏭", label: "NCC" },
            { icon: "🚛", label: "NPP" },
            { icon: "🏥", label: "Khách hàng" },
          ].map((n, i, arr) => (
            <span key={n.label} className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-[#E4EAE7] rounded-lg font-medium text-[#10231C]">
                {n.icon} {n.label}
              </span>
              {i < arr.length - 1 && <span className="text-[#024430] font-bold">→</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
