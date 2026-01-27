import React from "react";

export const useTimeCounter = () => {
  const [counterMin, setCounterMin] = React.useState(3);
  const [counterSec, setCounterSec] = React.useState(0);

  React.useEffect(() => {
    // Start the timer when the component mounts or is been visible
    const x = setInterval(() => {
      if (counterSec === 0 && counterMin === 0) {
        clearInterval(x);
      } else if (counterSec === 0) {
        setCounterMin(counterMin - 1);
        setCounterSec(59);
      } else {
        setCounterSec(counterSec - 1);
      }
    }, 1000);

    // handle the cleanup for memory optimization
    return () => {
      clearInterval(x);
    };
  }, [counterMin, counterSec]);

  const formattedMin = String(counterMin).padStart(2, "0");
  const formattedSec = String(counterSec).padStart(2, "0");

  return { formattedMin, formattedSec, setCounterMin, setCounterSec };
};
