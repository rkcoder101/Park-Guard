import { useEffect, useState } from "react";
import { getDataBaseUrl } from "../lib/data/baseUrl.js";

const initialState = {
  data: null,
  error: null,
  isLoading: true,
};

export function useEvaluationSummary() {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let isActive = true;

    async function loadEvaluationSummary() {
      try {
        const response = await fetch(`${getDataBaseUrl()}/evaluation-summary.json`);
        if (!response.ok) {
          throw new Error(`Evaluation summary request failed: ${response.status}`);
        }
        const payload = await response.json();
        if (!payload?.headline || !payload?.display) {
          throw new Error("Evaluation summary is missing headline values");
        }
        if (isActive) {
          setState({ data: payload, error: null, isLoading: false });
        }
      } catch (error) {
        if (isActive) {
          setState({ data: null, error, isLoading: false });
        }
      }
    }

    loadEvaluationSummary();

    return () => {
      isActive = false;
    };
  }, []);

  return state;
}
