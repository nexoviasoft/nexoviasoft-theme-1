"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "../../../utils/cn";
import { menuItems } from "./side_bar/Menu";
import { useAuth } from "../../../context/AuthContext";
import { MdLogout } from "react-icons/md";
import { Button, Modal } from "antd";

const MobileTabs = () => {
  const path = usePathname().split("/").pop();
  const { logout } = useAuth();
  const router = useRouter();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleConfirmLogout = () => {
    logout();
    setLogoutModalOpen(false);
    router.push("/");
  };

  return (
    <nav className="md:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={`/my-account/${item.link}`}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-full text-xs font-medium border transition-colors",
              path === item.link
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-gray-700 border-pink-100 hover:bg-pink-50"
            )}
          >
            <span className="flex items-center justify-center">
              {item.icon}
            </span>
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => setLogoutModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
        >
          <MdLogout size={16} />
          লগআউট
        </button>
      </div>
      <Modal
        title="লগআউট"
        open={logoutModalOpen}
        onCancel={() => setLogoutModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setLogoutModalOpen(false)}>
            বাতিল
          </Button>,
          <Button key="confirm" type="primary" danger onClick={handleConfirmLogout}>
            হ্যাঁ, লগআউট
          </Button>,
        ]}
      >
        <p>আপনি কি নিশ্চিত লগআউট করতে চান?</p>
      </Modal>
    </nav>
  );
};

export default MobileTabs;

