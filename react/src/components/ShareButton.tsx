import { useEffect, useRef, useState } from "react";
import { encodeShareParams, type ShareConfig } from "../state/shareLink";

type Status = "idle" | "copied" | "failed";

const LABEL: Record<Status, { icon: string; text: string }> = {
  idle: { icon: "🔗", text: "Share this layout" },
  copied: { icon: "✅", text: "Copied!" },
  failed: { icon: "⚠️", text: "Copy failed" },
};

export function ShareButton({ config }: { config: ShareConfig }) {
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const share = async () => {
    const { origin, pathname } = window.location;
    const url = origin + pathname + encodeShareParams(config);
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2000);
  };

  const { icon, text } = LABEL[status];
  return (
    <button
      type="button"
      className="share-button"
      onClick={share}
      title="Copy a link to this harp layout"
    >
      <span aria-hidden>{icon}</span>
      <span>{text}</span>
    </button>
  );
}
