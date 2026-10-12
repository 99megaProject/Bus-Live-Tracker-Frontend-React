import ClearDataButton from "../components/ClearDataButton";
import InstallApp from "../components/InstallApp";

export default function Settings() {
  return (
    <div className="page">
      <h1>Settings</h1>
      <InstallApp />
      <ClearDataButton />
    </div>
  );
}
