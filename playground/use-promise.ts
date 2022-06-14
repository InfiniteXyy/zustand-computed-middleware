import { useEffect, useRef, useState } from "react";

export const usePromiseResolved = <T>(promise: Promise<T>): T | null => {
  const [value, setValue] = useState<T | null>(null);
  const promiseRef = useRef(promise);
  promiseRef.current = promise;

  useEffect(() => {
    promise
      .then((value) => {
        if (promiseRef.current === promise) setValue(value);
      })
      .catch(() => {});
  }, [promise]);

  return value;
};
