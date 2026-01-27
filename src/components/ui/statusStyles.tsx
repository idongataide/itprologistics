export const getStatusStyle = (status: string): string => {
  const statusStyles: { [key: string]: string } = {
    Completed: "text-[#2FA270] bg-[#EBF7F2] px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium",
    Successful: "text-[#2FA270] bg-[#EBF7F2] px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium",
    Paid: "text-[#2FA270] bg-[#EBF7F2] px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium",
    "At rest": "text-[#2FA270] bg-[#EBF7F2] px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium",
    Failed: "text-[#B11B1B] bg-[#FFEFEF] px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium",
    Rejected: "text-[#B11B1B] bg-[#FFEFEF] px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium",
    // Commercial: "text-[#B11B1B] bg-[#FFEFEF] px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium",
    Enroute: "text-[#B11B1B] bg-[#FFEFEF] px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium",
    commercial: "text-[#B11B1B] bg-[#FFEFEF] px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium",
    Pending: "text-[#D2930C] bg-[#FDF6E7] px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium",
    Available: "text-[#D2930C] bg-[#FDF6E7] px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium",
    Ongoing: "text-[#FF6C2D] bg-[#FFF0EA] px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium",
    Abandoned: "text-[#667085] bg-[#F9FAFB] px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium",
    Unavailable: "text-[#667085] bg-[#F9FAFB] px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium",
    "Awaiting payment": "text-[#4387D8] bg-[#EBF7FF] px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium",
    private: "text-[#4387D8] bg-[#EBF7FF] px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium",
  };

  return statusStyles[status] || "text-gray-600 bg-gray-50 px-3 py-1 rounded-full whitespace-nowrap  text-sm font-medium";
};

export const getAvatarColor = (id: string | number): string => {
  const colors: string[] = [
    // "bg-[#F5879114] text-[#EC6B71]",
    // "bg-[#FBEAFF] text-[#9747FF]", 
    // "bg-[#FFE89833] text-[#FFC600]",
    // "bg-[#EBF7F2] text-[#2FA270]",
    "bg-[#F9FAFB] text-[#2FA270]",
  ];
  
  if (typeof id === 'number') {
    return colors[id % colors.length];
  }
  
  let hash = 0;
  for (let i = 0; i < id?.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}; 