"use client";
import { Avatar, Badge, Button, Input } from "@/components/ui";
import { Bell, Search, LogOut } from "lucide-react";
import RoleSwitcher from "./RoleSwitcher";
import { useRouter } from "next/navigation";

export default function Topbar() {
  const router = useRouter();
  return (
    <header className="h-16 bg-white border-b border-[#E4EAE7] flex items-center px-6 gap-4 z-10">
      <div className="flex-1">
        <Input
          placeholder="Tìm kiếm hợp đồng, đơn hàng..."
          startContent={<Search size={16} className="text-[#6B7A73]" />}
          size="sm"
          className="max-w-xs"
          classNames={{ inputWrapper: "bg-[#F6F8F7] border-[#E4EAE7]" }}
        />
      </div>
      <div className="flex items-center gap-3">
        <RoleSwitcher />
        <Badge content="3" color="danger" size="sm">
          <Button isIconOnly variant="light" size="sm" aria-label="Thông báo">
            <Bell size={20} className="text-[#6B7A73]" />
          </Button>
        </Badge>
        <Avatar size="sm" name="U" className="bg-[#024430] text-white" />
        <Button
          size="sm"
          variant="light"
          startContent={<LogOut size={14} />}
          onClick={() => router.push("/login")}
          className="text-[#6B7A73]"
        >
          Đăng xuất
        </Button>
      </div>
    </header>
  );
}
