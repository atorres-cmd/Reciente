import React, { useState, useEffect } from 'react';

interface CustomSvgIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

// Componentes SVG de respaldo para cuando no se pueden cargar los archivos
const FallbackIcons: Record<string, React.FC<{size: number, color?: string}>> = {
  T1: ({size, color}) => (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Base del transelevador */}
      <rect x="30" y="70" width="40" height="10" fill={color || "#4CAF50"} stroke="#000" strokeWidth="1" />
      {/* Mástil central */}
      <rect x="45" y="20" width="10" height="50" fill={color || "#4CAF50"} stroke="#000" strokeWidth="1" />
      {/* Cabina */}
      <rect x="35" y="30" width="30" height="15" fill="#555" stroke="#000" strokeWidth="1" />
      {/* Ventana de la cabina */}
      <rect x="40" y="33" width="20" height="8" fill="#88CCFF" stroke="#000" strokeWidth="0.5" />
      {/* Horquillas */}
      <rect x="55" y="40" width="20" height="5" fill={color || "#4CAF50"} stroke="#000" strokeWidth="1" />
      {/* Ruedas */}
      <circle cx="35" cy="80" r="5" fill="#333" />
      <circle cx="65" cy="80" r="5" fill="#333" />
      {/* Etiqueta T1 */}
      <text x="60" y="55" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#000">T1</text>
    </svg>
  ),
  T2: ({size, color}) => (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Base del transelevador */}
      <rect x="30" y="70" width="40" height="10" fill={color || "#2196F3"} stroke="#000" strokeWidth="1" />
      {/* Mástil central */}
      <rect x="45" y="20" width="10" height="50" fill={color || "#2196F3"} stroke="#000" strokeWidth="1" />
      {/* Cabina */}
      <rect x="35" y="30" width="30" height="15" fill="#555" stroke="#000" strokeWidth="1" />
      {/* Ventana de la cabina */}
      <rect x="40" y="33" width="20" height="8" fill="#88CCFF" stroke="#000" strokeWidth="0.5" />
      {/* Horquillas */}
      <rect x="25" y="40" width="20" height="5" fill={color || "#2196F3"} stroke="#000" strokeWidth="1" />
      {/* Ruedas */}
      <circle cx="35" cy="80" r="5" fill="#333" />
      <circle cx="65" cy="80" r="5" fill="#333" />
      {/* Etiqueta T2 */}
      <text x="50" y="55" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#000">T2</text>
    </svg>
  )
};

const CustomSvgIcon: React.FC<CustomSvgIconProps> = ({ name, className = "", size = 30, color }) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  
  // Verificar si la imagen existe
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
    };
    img.onerror = () => {
      console.error(`Error cargando el icono: ${name}.svg`);
      setImageError(true);
      setImageLoaded(false);
    };
    img.src = `/icons/${name}.svg`;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [name]);
  
  // Si hay un error o no se ha cargado la imagen, mostrar el icono de respaldo
  if (imageError && FallbackIcons[name]) {
    const FallbackIcon = FallbackIcons[name];
    return (
      <div className={className}>
        <FallbackIcon size={size} color={color === 'red' ? 'red' : undefined} />
      </div>
    );
  }
  
  // Si no hay un icono de respaldo disponible o la imagen se cargó correctamente, mostrar la imagen
  return (
    <div 
      className={`${className} ${!imageLoaded && !imageError ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      style={{ 
        width: size, 
        height: size,
        backgroundImage: `url(/icons/${name}.svg)`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: color ? `invert(100%) sepia(100%) saturate(10000%) hue-rotate(${color === 'yellow' ? '60deg' : '0deg'})` : undefined
      }}
    />
  );
};

export default CustomSvgIcon;
