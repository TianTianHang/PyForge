import { useState, type KeyboardEvent } from "react";

interface InstallPackageInputProps {
  disabled?: boolean;
  onInstallPackage: (packageName: string) => void;
}

export function InstallPackageInput({
  disabled = false,
  onInstallPackage,
}: InstallPackageInputProps) {
  const [packageName, setPackageName] = useState("");

  const submit = () => {
    const trimmed = packageName.trim();
    if (!trimmed || disabled) {
      return;
    }

    onInstallPackage(trimmed);
    setPackageName("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={packageName}
        placeholder="输入包名"
        className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-base focus:outline-none focus:border-blue-500 disabled:opacity-50"
        disabled={disabled}
        onChange={(e) => setPackageName(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        className="bg-blue-600 hover:bg-blue-700 text-white border-none px-4 py-2 text-base rounded-md cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled || !packageName.trim()}
        onClick={submit}
      >
        安装
      </button>
    </div>
  );
}
