import { statusColor } from '../../utils/format';

export default function Badge({ label }: { label: string }) {
  return (
    <span className={`badge ${statusColor(label)}`}>{label}</span>
  );
}
