"use client";
import { useAuth } from "../../context/AuthContext";
import type { MenuProps } from "antd";
import { Button, Dropdown, Modal } from "antd";
import React, { useState } from "react";
import { FaRegUser } from "react-icons/fa6";
import {
  IoCartOutline,
  IoLocationOutline,
  IoLogInOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { MdOutlineManageAccounts } from "react-icons/md";
import { useRouter } from "next/navigation";

interface ProfileDropDownProps {
  onMenuAction?: () => void;
}

const ProfileDropDown: React.FC<ProfileDropDownProps> = ({ onMenuAction }) => {
  const { userSession, logout } = useAuth();
  const router = useRouter();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const isAuthenticated = Boolean(userSession?.accessToken);

  const userName = userSession?.user?.name || userSession?.name || "Guest user";
  const userEmail = userSession?.user?.email || userSession?.email;
  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const items: MenuProps["items"] = isAuthenticated
    ? [
        {
          key: "1",
          label: (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-950 text-xs font-bold text-white shadow-sm ring-2 ring-gray-100">
                {initials}
              </div>
              <div className="min-w-0 flex flex-col">
                <p className="text-[13px] font-semibold text-gray-900 truncate leading-tight">
                  {userName}
                </p>
                {userEmail && (
                  <p className="text-[11px] text-gray-400 truncate leading-tight mt-0.5">
                    {userEmail}
                  </p>
                )}
              </div>
            </div>
          ),
          disabled: true,
        },
        {
          type: "divider",
        },
        {
          key: "2",
          icon: (
            <span className="flex items-center justify-center w-[18px] text-gray-400">
              <MdOutlineManageAccounts size={17} />
            </span>
          ),
          label: (
            <span className="text-[13px] font-medium text-gray-700">
              Manage Account
            </span>
          ),
        },
        {
          key: "3",
          icon: (
            <span className="flex items-center justify-center w-[18px] text-gray-400">
              <IoCartOutline size={16} />
            </span>
          ),
          label: (
            <span className="text-[13px] font-medium text-gray-700">
              My Orders
            </span>
          ),
        },
        {
          key: "4",
          icon: (
            <span className="flex items-center justify-center w-[18px] text-gray-400">
              <IoLocationOutline size={16} />
            </span>
          ),
          label: (
            <span className="text-[13px] font-medium text-gray-700">
              Address
            </span>
          ),
        },
        {
          type: "divider",
        },
        {
          key: "7",
          className: "group hover:!bg-red-500",
          icon: (
            <span className="flex items-center justify-center w-[18px] text-red-400 group-hover:!text-white">
              <IoLogInOutline size={16} />
            </span>
          ),
          label: (
            <span className="text-[13px] font-medium text-red-500 group-hover:!text-white">
              Log out
            </span>
          ),
          danger: true,
        },
      ]
    : [
        {
          key: "login",
          icon: (
            <span className="flex items-center justify-center w-[18px] text-gray-400">
              <IoLogInOutline size={16} />
            </span>
          ),
          label: (
            <span className="text-[13px] font-medium text-gray-700">Login</span>
          ),
        },
        {
          key: "register",
          icon: (
            <span className="flex items-center justify-center w-[18px] text-gray-400">
              <FaRegUser size={14} />
            </span>
          ),
          label: (
            <span className="text-[13px] font-medium text-gray-700">
              Register
            </span>
          ),
        },
      ];

  const handleMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case "login":
        router.push("/login");
        onMenuAction?.();
        break;
      case "register":
        router.push("/register");
        onMenuAction?.();
        break;
      case "2":
        router.push("/my-account/dashboard");
        onMenuAction?.();
        break;
      case "3":
        router.push("/my-account/orders");
        onMenuAction?.();
        break;
      case "4":
        router.push("/my-account/address");
        onMenuAction?.();
        break;
      case "6":
        // router.push("/my-account/settings");
        break;
      case "7":
        setLogoutModalOpen(true);
        break;
      default:
        break;
    }
  };

  const handleConfirmLogout = () => {
    logout();
    setLogoutModalOpen(false);
    onMenuAction?.();
  };

  return (
    <>
      <Dropdown
        menu={{
          items,
          onClick: handleMenuClick,
          className: "!p-1.5",
          style: {
            borderRadius: "14px",
            border: "1px solid #f0f0f0",
            boxShadow:
              "0 4px 6px -1px rgba(0,0,0,0.06), 0 10px 24px -4px rgba(0,0,0,0.08)",
            padding: "6px",
            minWidth: "220px",
            maxWidth: "256px",
            backgroundColor: "#ffffff",
          },
        }}
        placement="bottomRight"
        trigger={["click"]}
        overlayStyle={{
          marginTop: "10px",
        }}
      >
        <button
          type="button"
          className="group flex items-center gap-2 !rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm transition-all duration-200"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-950 text-[11px] font-bold text-white shadow-sm">
            {isAuthenticated ? initials : <FaRegUser size={13} />}
          </div>
          <span className="hidden md:inline-block max-w-[110px] truncate text-[13px] font-medium">
            {isAuthenticated ? userName : "Account"}
          </span>
          <svg
            className="hidden md:block w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </Dropdown>

      <Modal
        title={
          <span className="text-[15px] font-semibold text-gray-900">
            Log Out
          </span>
        }
        open={logoutModalOpen}
        onCancel={() => setLogoutModalOpen(false)}
        centered
        footer={[
          <Button
            key="cancel"
            onClick={() => setLogoutModalOpen(false)}
            className="!rounded-lg !text-[13px] !font-medium !border-gray-200 !text-gray-600 hover:!border-gray-300 hover:!text-gray-800"
          >
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            danger
            onClick={handleConfirmLogout}
            className="!rounded-lg !text-[13px] !font-medium"
          >
            Yes, Log Out
          </Button>,
        ]}
      >
        <p className="text-[13px] text-gray-500 py-1">
          Are you sure you want to log out of your account?
        </p>
      </Modal>
    </>
  );
};

export default ProfileDropDown;
