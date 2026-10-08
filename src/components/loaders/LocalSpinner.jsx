import { Loader2 } from "lucide-react";

export default function LocalSpinner({ size = 18 }) {
  return <Loader2 className="spin" size={size} />;
}