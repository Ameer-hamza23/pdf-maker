import { ElectricScreen } from "@/src/components/electric-screen";

export default function SettingsPage() {
  return (
    <ElectricScreen
      eyebrow="Electric Curator"
      headline="Tune the app without losing the calm."
      description="Settings uses the same editorial hierarchy, rounded surfaces, and restrained emphasis so utility stays beautiful."
      cardTitle="Settings Surface"
      cardBody="Form-heavy screens can stay precise with ghost borders and layered cards."
      chipLabel="Precision mode"
      actionLabel="Manage Preferences"
    />
  );
}
