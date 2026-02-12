export default function Particle({ delay, x, size }) {
  return <div style={{ position: "absolute", left: `${x}%`, bottom: -20, width: size, height: size, borderRadius: "50%", background: "rgba(251,191,36,0.08)", animation: `floatUp 18s ${delay}s infinite linear`, pointerEvents: "none" }} />;
}
