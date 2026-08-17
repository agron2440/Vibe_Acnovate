import { useEffect, useState } from "react";
import { AppExtension } from "@contrail/extensions-sdk";

let registrationPromise: Promise<void> | null = null;

function getRegistrationPromise() {
  if (!registrationPromise) {
    registrationPromise = AppExtension.registerAppExtension();
  }
  return registrationPromise;
}

export function useAppExtensionReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getRegistrationPromise()
      .then(() => {
        if (!cancelled) setIsReady(true);
      })
      .catch((error) => {
        console.error("Error registering app extension:", error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return isReady;
}
