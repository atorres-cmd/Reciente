import { useState } from "react";
import { 
  Home, 
  AlertTriangle, 
  History, 
  Eye, 
  Sliders
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const menuItems = [
  {
    id: "home",
    label: "Inicio",
    icon: Home,
  },
  {
    id: "visualizacion",
    label: "Visualización",
    icon: Eye,
  },
  {
    id: "alarmas",
    label: "Alarmas",
    icon: AlertTriangle,
  },
  {
    id: "historicos",
    label: "Históricos",
    icon: History,
  },
  {
    id: "control",
    label: "Control",
    icon: Sliders,
  },
];

const SidebarPuente = () => {
  const [activeItem, setActiveItem] = useState("visualizacion");
  const navigate = useNavigate();
  
  const handleMenuClick = (id: string) => {
    setActiveItem(id);
    
    // Navegación según la opción seleccionada
    switch (id) {
      case "home":
        navigate("/");
        break;
      case "visualizacion":
        // Ya estamos en la página de visualización del puente
        break;
      case "alarmas":
        // Navegación a la página de alarmas cuando esté disponible
        break;
      case "historicos":
        // Navegación a la página de históricos cuando esté disponible
        break;
      case "control":
        // Navegación a la página de control cuando esté disponible
        break;
      default:
        break;
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
                  : "hover:bg-operator-sidebar-hover text-gray-600"}`}
            >
              <Icon 
                size={22} 
                className={isActive ? "text-white" : "text-gray-100"} 
              />
              <span className="text-[10px] mt-1 font-medium">{label}</span>
              
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
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">4</span>
        </button>
      </div>
    </aside>
  );
};

export default SidebarPuente;
