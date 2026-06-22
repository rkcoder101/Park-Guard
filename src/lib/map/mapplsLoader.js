const SDK_TIMEOUT_MS = 16000;

let sdkPromise = null;
let sdkScript = null;

export function resetMapplsLoader() {
  sdkPromise = null;
  if (sdkScript?.parentNode) {
    sdkScript.parentNode.removeChild(sdkScript);
  }
  sdkScript = null;
}

export function loadMapplsSdk(key) {
  if (!key) {
    return Promise.reject(new Error("missing-mappls-key"));
  }

  if (window.mappls) {
    return Promise.resolve(window.mappls);
  }

  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector("script[data-park-guard-mappls]");
    sdkScript = existingScript ?? document.createElement("script");
    let timeoutId;

    const cleanupListeners = () => {
      sdkScript.removeEventListener("load", handleLoad);
      sdkScript.removeEventListener("error", handleError);
      window.clearTimeout(timeoutId);
    };

    const rejectAndReset = (error) => {
      cleanupListeners();
      sdkPromise = null;
      reject(error);
    };

    const handleLoad = () => {
      if (window.mappls) {
        cleanupListeners();
        resolve(window.mappls);
      } else {
        rejectAndReset(new Error("mappls-global-unavailable"));
      }
    };

    const handleError = () => {
      rejectAndReset(new Error("mappls-sdk-load-failed"));
    };

    timeoutId = window.setTimeout(() => {
      rejectAndReset(new Error("mappls-sdk-timeout"));
    }, SDK_TIMEOUT_MS);

    sdkScript.addEventListener("load", handleLoad);
    sdkScript.addEventListener("error", handleError);

    if (!existingScript) {
      sdkScript.dataset.parkGuardMappls = "true";
      sdkScript.async = true;
      sdkScript.defer = true;
      sdkScript.src = `https://apis.mappls.com/advancedmaps/api/${encodeURIComponent(
        key,
      )}/map_sdk?v=3.0&layer=vector`;
      document.head.appendChild(sdkScript);
    }
  });

  return sdkPromise;
}
