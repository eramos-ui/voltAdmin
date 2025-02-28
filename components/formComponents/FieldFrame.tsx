//import '../styles/styles.css' ;


interface FieldFrameProps {
    title: string;
    style?: React.CSSProperties; 
    children: React.ReactNode;
}

export const FieldFrame: React.FC<FieldFrameProps> = ({ title, style , children }) => {
  return (
    <div className="p-4 border border-gray-300 rounded-lg shadow-md" style={style}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="bg-white p-4 rounded-lg shadow-inner">
        {children}
      </div>
    </div>
  );  
};
