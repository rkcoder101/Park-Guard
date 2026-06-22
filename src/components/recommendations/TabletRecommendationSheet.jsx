import { ListFilter, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../common/Button.jsx";
import { RecommendationRail } from "./RecommendationRail.jsx";
import { useCommandCenter } from "../../context/useCommandCenter.js";

export function TabletRecommendationSheet() {
  const { visibleRecommendations } = useCommandCenter();
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="xl:hidden">
      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          className="shadow-panel"
          onClick={() => setIsOpen(true)}
          type="button"
        >
          <ListFilter className="h-4 w-4" aria-hidden="true" />
          Recommendations ({visibleRecommendations.length})
        </Button>
      </div>

      {isOpen ? (
        <div
          aria-labelledby="tablet-recommendation-sheet-title"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          role="dialog"
        >
          <button
            aria-label="Close recommendation panel"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={() => setIsOpen(false)}
            type="button"
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-[28rem] flex-col border-l border-border bg-background shadow-panel sm:max-w-[32rem]">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div>
                <h2
                  className="text-base font-semibold"
                  id="tablet-recommendation-sheet-title"
                >
                  Recommendations
                </h2>
                <p className="text-xs text-muted-foreground">
                  Tablet panel; map context remains behind this sheet.
                </p>
              </div>
              <Button
                aria-label="Close recommendation panel"
                onClick={() => setIsOpen(false)}
                ref={closeButtonRef}
                size="sm"
                type="button"
                variant="secondary"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Close
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <RecommendationRail />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
