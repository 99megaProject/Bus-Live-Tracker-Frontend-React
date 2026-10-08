import { Loader2 } from "lucide-react";

export default function GlobalLoader() {
  return (
    <div className="global-loader">
      <Loader2 className="spin" size={40} />
    </div>
  );
}