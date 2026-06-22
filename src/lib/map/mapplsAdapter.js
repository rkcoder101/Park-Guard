import {
  createMarkerIcon,
  createMetricScale,
  getActionColor,
  polygonCoordinatesToPaths,
} from "./mapStyle.js";

const MAP_LOAD_TIMEOUT_MS = 12000;
const BENGALURU_CENTER = { lat: 12.9716, lng: 77.5946 };

export class MapplsAdapter {
  constructor(mappls) {
    this.mappls = mappls;
    this.map = null;
    this.listeners = [];
    this.markerRefs = [];
    this.polygonRefs = [];
    this.gridRefs = [];
    this.coverageCircleRef = null;
    this.recommendations = [];
  }

  async createMap(containerId) {
    if (!this.mappls?.Map) {
      throw new Error("mappls-map-constructor-unavailable");
    }

    this.map = new this.mappls.Map(containerId, {
      center: BENGALURU_CENTER,
      zoom: 11,
      zoomControl: true,
      fullscreenControl: true,
      traffic: false,
      clickableIcons: false,
    });

    await this.waitForMapLoad();
    return this.map;
  }

  waitForMapLoad() {
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = () => {
        if (!settled) {
          settled = true;
          window.clearTimeout(timeoutId);
          resolve();
        }
      };
      const timeoutId = window.setTimeout(() => {
        if (!settled) {
          settled = true;
          reject(new Error("mappls-map-load-timeout"));
        }
      }, MAP_LOAD_TIMEOUT_MS);

      if (typeof this.map?.addListener === "function") {
        const listener = this.map.addListener("load", finish);
        this.listeners.push(listener);
      }

      window.setTimeout(finish, 900);
    });
  }

  setRecommendations({
    onSelect,
    recommendations,
    selectedZoneId,
    visibleMetric,
    zoneByIndex,
  }) {
    this.clearRecommendationOverlays();
    this.recommendations = recommendations;

    if (!recommendations.length) {
      this.clearCoverageCircle();
      return;
    }

    const markerScale = createMetricScale(recommendations, visibleMetric);

    for (const recommendation of recommendations) {
      const zoneFeature = zoneByIndex.get(String(recommendation.zoneIndex));
      const polygon = this.createRecommendationPolygon(
        recommendation,
        zoneFeature,
        recommendation.zoneIndex === selectedZoneId,
      );
      if (polygon) {
        this.polygonRefs.push(polygon);
      }

      const marker = this.createRecommendationMarker({
        markerSize: markerScale(recommendation),
        onSelect,
        recommendation,
      });
      if (marker) {
        this.markerRefs.push(marker);
      }
    }

    const selected = recommendations.find(
      (recommendation) => recommendation.zoneIndex === selectedZoneId,
    );
    this.setSelectedZone(selected ?? null);
  }

  createRecommendationMarker({ markerSize, onSelect, recommendation }) {
    if (!this.mappls?.Marker) {
      throw new Error("mappls-marker-constructor-unavailable");
    }

    const marker = new this.mappls.Marker({
      map: this.map,
      position: {
        lat: recommendation.latitude,
        lng: recommendation.longitude,
      },
      icon_url: createMarkerIcon(recommendation, markerSize),
      width: markerSize,
      height: markerSize,
      popupHtml: `Zone ${recommendation.zoneIndex}`,
    });

    this.addOverlayListener(marker, "click", () => {
      onSelect(recommendation.zoneIndex);
    });

    return marker;
  }

  createRecommendationPolygon(recommendation, zoneFeature, isSelected) {
    if (!this.mappls?.Polygon || !zoneFeature) {
      return null;
    }

    const paths = polygonCoordinatesToPaths(zoneFeature);
    if (!paths) {
      return null;
    }

    const color = getActionColor(recommendation.patrolAction);
    const polygon = new this.mappls.Polygon({
      map: this.map,
      paths,
      fillColor: color,
      fillOpacity: isSelected ? 0.24 : 0.14,
      strokeColor: color,
      strokeOpacity: isSelected ? 0.95 : 0.78,
      strokeWeight: isSelected ? 3 : 2,
      fitbounds: false,
    });

    return polygon;
  }

  setSelectedZone(recommendation) {
    this.clearCoverageCircle();
    if (!recommendation) {
      return;
    }

    if (this.mappls?.Circle) {
      this.coverageCircleRef = new this.mappls.Circle({
        map: this.map,
        center: {
          lat: recommendation.latitude,
          lng: recommendation.longitude,
        },
        radius: recommendation.coverageRadiusM,
        fillColor: "#22d3ee",
        fillOpacity: 0.08,
        strokeColor: "#22d3ee",
        strokeOpacity: 0.82,
        strokeWeight: 2,
      });
    }

    this.panToRecommendation(recommendation);
  }

  panToRecommendation(recommendation) {
    if (!recommendation) {
      return;
    }
    const center = { lat: recommendation.latitude, lng: recommendation.longitude };

    if (typeof this.map?.panTo === "function") {
      this.map.panTo(center);
    } else if (typeof this.map?.setCenter === "function") {
      this.map.setCenter(center);
    }

    if (typeof this.map?.setZoom === "function") {
      this.map.setZoom(15);
    }
  }

  setGridVisibility({ showAllZones, zones }) {
    this.clearGrid();
    if (!showAllZones || !zones?.features?.length || !this.mappls?.Polygon) {
      return;
    }

    for (const feature of zones.features) {
      const paths = polygonCoordinatesToPaths(feature);
      if (!paths) {
        continue;
      }
      const polygon = new this.mappls.Polygon({
        map: this.map,
        paths,
        fillColor: "#0f172a",
        fillOpacity: 0,
        strokeColor: "#64748b",
        strokeOpacity: 0.18,
        strokeWeight: 1,
        fitbounds: false,
      });
      this.gridRefs.push(polygon);
    }
  }

  addOverlayListener(overlay, eventName, callback) {
    if (typeof overlay?.addListener !== "function") {
      return;
    }
    const listener = overlay.addListener(eventName, callback);
    this.listeners.push(listener);
  }

  clearRecommendationOverlays() {
    this.clearOverlays(this.markerRefs);
    this.clearOverlays(this.polygonRefs);
    this.markerRefs = [];
    this.polygonRefs = [];
  }

  clearGrid() {
    this.clearOverlays(this.gridRefs);
    this.gridRefs = [];
  }

  clearCoverageCircle() {
    this.clearOverlays([this.coverageCircleRef]);
    this.coverageCircleRef = null;
  }

  clearOverlays(overlays) {
    for (const overlay of overlays) {
      if (!overlay) {
        continue;
      }
      if (typeof overlay.remove === "function") {
        overlay.remove();
      } else if (typeof this.mappls?.remove === "function") {
        this.mappls.remove({ map: this.map, layer: overlay });
      }
    }
  }

  destroy() {
    for (const listener of this.listeners) {
      if (typeof listener?.remove === "function") {
        listener.remove();
      }
    }
    this.listeners = [];
    this.clearRecommendationOverlays();
    this.clearGrid();
    this.clearCoverageCircle();

    if (typeof this.map?.remove === "function") {
      this.map.remove();
    }
    this.map = null;
  }
}
