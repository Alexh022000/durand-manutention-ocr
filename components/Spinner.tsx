export default function Spinner() {
  return (
    <div
      className="spinner w-12 h-12 rounded-full border-4 border-dm-red-light"
      style={{ borderTopColor: "#C6000A" }}
      aria-label="Chargement"
      role="status"
    />
  );
}
