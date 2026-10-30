import { ArrowDownLeft, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Blocks, BookOpen, BriefcaseBusiness, Check, ChevronDown, Cloud, Code2, Compass, Database, Globe2, HeartPulse, Layers3, Menu, PanelTop, PlugZap, Rocket, Server, Settings2, ShoppingBag, Sparkles, Truck, Workflow, X } from "lucide-react";

const icons = {
  globe: Globe2, layers: Layers3, cloud: Cloud, panels: PanelTop, server: Server, plug: PlugZap, settings: Settings2, cart: ShoppingBag,
  heart: HeartPulse, book: BookOpen, truck: Truck, briefcase: BriefcaseBusiness, rocket: Rocket, building: Blocks,
  arrow: ArrowUpRight, arrowLeft: ArrowLeft, arrowRight: ArrowRight, downLeft: ArrowDownLeft, downRight: ArrowDownRight,
  check: Check, chevron: ChevronDown, menu: Menu, close: X, code: Code2, compass: Compass, database: Database, spark: Sparkles, workflow: Workflow,
};
export type IconName = keyof typeof icons;
export function Icon({ name, size = 20, strokeWidth = 1.7, className }: { name: IconName; size?: number; strokeWidth?: number; className?: string }) {
  const Component = icons[name];
  return <Component aria-hidden="true" size={size} strokeWidth={strokeWidth} className={className} />;
}
