interface InfoRowProps {
  label: string;
  value: string | number | null | undefined;
  capitalize?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, capitalize = false }) => {
  return (
    <div className="flex items-center">
      <div className="w-[30%]">
        <p className="font-normal text-[#667085]">{label}</p>
      </div>             
      <div className="w-[70%] text-right pl-2">
        <p className={`font-medium text-[#475467] ${capitalize ? 'capitalize' : ''}`}>
          {value || 'N/A'}
        </p>
      </div> 
    </div>
  );
};

export default InfoRow; 