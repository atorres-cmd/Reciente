
const headers = [
  "Código",
  "Componente",
  "Estado",
  "Posición",
  "Última acción"
];

const rows = [
  {
    codigo: "TRANS-001",
    componente: "Transelevador 1",
    estado: "Activo",
    posicion: "P1, Y3",
    accion: "Recogida palé #A12345",
  },
  {
    codigo: "TRANS-002",
    componente: "Transelevador 2",
    estado: "En movimiento",
    posicion: "P8, Y2",
    accion: "Desplazamiento vertical",
  },
  {
    codigo: "TRANSF-001",
    componente: "Carro Transferidor",
    estado: "Activo",
    posicion: "P4, Y1",
    accion: "Cambio de pasillo completado",
  },
  {
    codigo: "PUENTE-001",
    componente: "Puente",
    estado: "Inactivo",
    posicion: "P10, Y1",
    accion: "En espera",
  },
  {
    codigo: "ELEV-001",
    componente: "Elevador",
    estado: "Error",
    posicion: "P12, Y2",
    accion: "Fallo en descenso - revisar",
  },
];

const TableKPI = () => (
  <div className="w-full mt-8 rounded-xl shadow-operator overflow-x-auto">
    <div className="bg-white rounded-t-xl border-b border-operator-border px-6 py-2 flex items-center justify-between">
      <div className="text-sm text-gray-700 font-roboto font-medium">
        Componentes del silo: {rows.length}
        <span className="ml-4 font-normal">Estado general: 1 error detectado</span>
      </div>
      {/* Aquí podrían ir botones top-right */}
    </div>
    <table className="min-w-full text-sm">
      <thead>
        <tr className="bg-operator-table-head text-gray-800">
          {headers.map((h) => (
            <th
              key={h}
              className="font-semibold px-4 py-2 border-r last:border-r-0 border-operator-border"
              style={{ minWidth: 140 }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr
            key={row.codigo}
            className={`bg-operator-table-row hover:bg-operator-table-row-alt transition ${row.estado === "Error" ? "bg-red-50" : ""}`}
          >
            <td className="px-4 py-2 border-r border-operator-border">{row.codigo}</td>
            <td className="px-4 py-2 border-r border-operator-border">{row.componente}</td>
            <td className={`px-4 py-2 border-r border-operator-border ${
                row.estado === "Error" ? "text-red-600 font-medium" : 
                row.estado === "En movimiento" ? "text-blue-600" : ""
              }`}>
              {row.estado}
            </td>
            <td className="px-4 py-2 border-r border-operator-border">{row.posicion}</td>
            <td className="px-4 py-2">{row.accion}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default TableKPI;
