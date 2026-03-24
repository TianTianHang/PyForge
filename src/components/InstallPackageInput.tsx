import { useState, type KeyboardEvent } from "react";
import "../App.css";

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
    <div className="install-input">
      <input
        type="text"
        value={packageName}
        placeholder="输入包名"
        className="package-input"
        disabled={disabled}
        onChange={(e) => setPackageName(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        className="primary-button"
        disabled={disabled || !packageName.trim()}
        onClick={submit}
      >
        安装
      </button>
    </div>
  );
}
