import { SafetyOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { Menu, type GetProp, type MenuProps } from "antd";
import { useState } from "react";
import MasterPassword from "./components/MasterPassword";
import ComingSoon from "./components/ComingSoon";
import ProfileInfo from "./components/ProfileInfo";

type MenuItem = GetProp<MenuProps, "items">[number];

const items: MenuItem[] = [
    {
        key: "general",
        icon: <SettingOutlined />,
        label: "General",
        children: [
            { key: "appearance", label: "Appearance" },
            { key: "notifications", label: "Notifications" },
            { key: "advanced", label: "Advanced" },
        ],
    },
    {
        key: "account",
        icon: <UserOutlined />,
        label: "Account",
        children: [
            { key: "profileInfo", label: "Profile Information" },
            { key: "accAction", label: "Account Actions" },
        ],
    },
    {
        key: "security",
        label: "Security",
        icon: <SafetyOutlined />,
        children: [
            { key: "masterPwd", label: "Master Password" },
            { key: "2fa", label: "Two-Factor Authentication" },
            { key: "sessionSecurity", label: "Session & Security" },
            { key: "encryptionBackup", label: "Encryption & Backup" },
        ],
    },
];

export default function SettingPage() {
   const [selectedMenuKey, setSelectedMenuKey] = useState<string>("profileInfo");

    const onMenuClick = ({ key }: { key: string }) => {
        setSelectedMenuKey(key);
    };

    const renderContent = () => {
        switch (selectedMenuKey) {
            case "masterPwd":
                return <MasterPassword />;
            case "profileInfo":
                return <ProfileInfo />;
            default:
                return <ComingSoon />;
        }
    };

    return (
        <>
            <div className="p-5">
                <h1 className="text-xl font-bold flex items-center gap-2 mb-[15px]">
                    <SettingOutlined />
                    Settings
                </h1>
                <div className="flex gap-5 w-full justify-items-scretch">
                    <div className=" w-[300px] min-h-[400px] shrink-0">
                        <Menu
                            className=""
                            defaultSelectedKeys={["profileInfo"]}
                            defaultOpenKeys={["general", "account", "security"]}
                            mode="inline"
                            items={items}
                            onClick={onMenuClick}
                        />
                    </div>
                    <div className="grow shrink">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </>
    );
}
