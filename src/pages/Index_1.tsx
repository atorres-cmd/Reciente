
import SidebarOperator from "../components/SidebarOperator";
import HeaderOperator from "../components/HeaderOperator";
import TableKPI from "../components/TableKPI";
import SiloVisualization from "../components/SiloVisualization";
import AlarmPanel from "../components/AlarmPanel";
import PasillosStatusCard from "../components/PasillosStatusCard";

const Index = () => {
  return (
    <div className="flex bg-operator-gray-bg min-h-screen font-sans">
      <SidebarOperator />
      <div className="flex-1 flex flex-col">
        <HeaderOperator />
        <main className="flex-1 p-10">
          <h1 className="text-2xl font-semibold text-gray-800">Panel de Control de Silo</h1>
          <p className="text-gray-600 mt-1">Monitor de estado y operaciones en tiempo real</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="lg:col-span-2">
              <SiloVisualization />
            </div>
            <div className="lg:col-span-2">
              <AlarmPanel />
            </div>
            <div className="lg:col-span-2">
              <PasillosStatusCard />
            </div>
            <div className="lg:col-span-2">
              <TableKPI />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
