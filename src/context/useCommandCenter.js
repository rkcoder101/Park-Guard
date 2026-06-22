import { useContext } from "react";
import { CommandCenterContext } from "./commandCenterContextObject.js";

export function useCommandCenter() {
  const context = useContext(CommandCenterContext);
  if (!context) {
    throw new Error("useCommandCenter must be used within CommandCenterProvider");
  }
  return context;
}
