
import { useState } from "react";
import { 
  Home, 
  AlertTriangle, 
  Clock, 
  Truck, 
  Construction, 
  LayoutGrid, 
  Anchor, 
  Boxes, 
  Footprints,
  History,
  ArrowUpDown,
  Settings,
  Database
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const menuItems = [
  {
    id: "home",
    label: "Inicio",
    icon: Home,
  },
  {
    id: "tlv1",
    label: "TLV1",
    icon: Construction,
  },
  {
    id: "control_tlv1",
    label: "CTRL TLV1",
    icon: Settings,
  },
  {
    id: "tlv2",
    label: "TLV2",
    icon: Construction,
  },
  {
    id: "control_tlv2",
    label: "CTRL TLV2",
    icon: Settings,
  },
  {
    id: "puente",
    label: "PUENTE",
    icon: Anchor,
  },
  {
    id: "alarmas",
    label: "ALARMAS",
    icon: AlertTriangle,
  },
  {
    id: "historicos",
    label: "HISTÓRICOS",
    icon: History,
  },
  {
    id: "carro",
    label: "CARRO",
    icon: Truck,
  },
  {
    id: "mesas",
    label: "MESAS",
    icon: LayoutGrid,
  },
  {
    id: "pie1",
    label: "PIE1",
    icon: Footprints,
  },
  {
    id: "elevador",
    label: "ELEVADOR",
    icon: ArrowUpDown,
  },
  {
    id: "db111",
    label: "DB111",
    icon: Database,
  },
];

const SidebarOperator = () => {
  const [activeItem, setActiveItem] = useState("home");
  const navigate = useNavigate();
  
  const handleMenuClick = (id: string) => {
    setActiveItem(id);
    
    // Navegación específica para los componentes
    if (id === "tlv1") {
      navigate("/transelevador/t1");
    } else if (id === "control_tlv1") {
      navigate("/control/tlv1");
    } else if (id === "tlv2") {
      navigate("/transelevador/t2");
    } else if (id === "control_tlv2") {
      navigate("/control/tlv2");
    } else if (id === "puente") {
      navigate("/puente");
    } else if (id === "carro") {
      navigate("/ct");
    } else if (id === "elevador") {
      navigate("/elevador");
    } else if (id === "alarmas") {
      navigate("/alarmas");
    } else if (id === "db111") {
      navigate("/db111");
    } else if (id === "home") {
      navigate("/");
    }
  };

  return (
    <aside className="h-screen w-20 bg-operator-sidebar flex flex-col items-center py-4 gap-2 shadow-operator">
      <div className="mb-6 mt-1">
        {/* Logo o icono menú */}
        <img src="/lovable-uploads/6ed98cce-f215-42c8-b04e-84b82d2542ea.png" alt="Logo" className="w-10 h-10 rounded shadow" />
      </div>
      
      <div className="flex flex-col items-center gap-3 overflow-y-auto scrollbar-thin scrollbar-thumb-operator-blue scrollbar-track-transparent py-2 flex-1">
        {menuItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeItem === id;
          return (
            <button
              key={id}
              onClick={() => handleMenuClick(id)}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-all relative group
                ${isActive 
                  ? "bg-operator-blue text-white shadow-md" 
                  : "hover:bg-operator-sidebar-hover text-white"}`}
            >
              <Icon 
                size={22} 
                className="text-white" 
              />
              <span className="text-[10px] mt-1 font-medium !text-white" style={{ color: 'white' }}>{label}</span>
              
              {/* Indicador de elemento activo */}
              {isActive && (
                <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-full"></span>
              )}
              
              {/* Tooltip */}
              <span className="absolute left-16 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white px-3 py-1.5 rounded shadow-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {label}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Contador de alarmas activas */}
      <div className="mt-auto mb-4 relative">
        <button className="relative p-2 rounded-full bg-operator-sidebar-hover hover:bg-operator-blue/20 transition-colors">
          <AlertTriangle size={22} className="text-red-500" />
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">3</span>
        </button>
      </div>
    </aside>
  );
};

export default SidebarOperator;
