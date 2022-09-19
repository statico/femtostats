import { useEffect, useRef, useState } from "react";

/*
	Use this to delay rendering null for a specified time so that chart updates
	appear smoother.
*/
export const useBufferedValue = (value: any, timeout = 1000) => {
  const [buffered, setBuffered] = useState(value);
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (value == null) {
      timer.current = setTimeout(() => {
        setBuffered(null);
      }, timeout);
    } else {
      setBuffered(value);
    }
  }, [value]);

  return buffered;
};
