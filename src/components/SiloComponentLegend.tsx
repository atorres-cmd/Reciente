
import { FC } from "react";

export interface LegendItem {
  color: string;
  label: string;
}

interface SiloComponentLegendProps {
  legends: LegendItem[];
}

const SiloComponentLegend: FC<SiloComponentLegendProps> = ({ legends }) => (
  <div className="flex flex-wrap gap-4">
    {legends.map((item) => (
      <div key={item.label} className="flex items-center gap-2">
        <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
        <span className="text-sm">{item.label}</span>
      </div>
    ))}
  </div>
);

export default SiloComponentLegend;
