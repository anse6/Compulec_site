import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input, Button, List, Tooltip, message } from "antd";
import { AimOutlined, EnvironmentOutlined, LoadingOutlined, CloseOutlined } from "@ant-design/icons";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useAdminTheme } from "../AdminThemeContext";

// Les images du marqueur par défaut de Leaflet ne sont pas trouvées par Vite sans cette correction
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

// Vue par défaut : le Cameroun
const DEFAULT_CENTER = [5.6, 12.3];
const DEFAULT_ZOOM = 6;
const SELECTED_ZOOM = 15;

// Géocodage OpenStreetMap (Nominatim) : gratuit, sans clé, 1 requête par seconde maximum
const NOMINATIM = "https://nominatim.openstreetmap.org";

/** Adresse courte et lisible à partir d'une réponse Nominatim (≤ 250 caractères). */
function formatAddress(result) {
  const a = result?.address || {};
  const parts = [
    a.road && (a.house_number ? `${a.house_number} ${a.road}` : a.road),
    a.neighbourhood || a.quarter || a.suburb,
    a.city || a.town || a.village || a.municipality || a.county,
    a.state,
    a.country,
  ].filter(Boolean);
  const unique = parts.filter((p, i) => parts.indexOf(p) === i);
  const text = unique.length ? unique.join(", ") : result?.display_name || "";
  return text.slice(0, 250);
}

async function nominatim(path, lang) {
  const response = await fetch(`${NOMINATIM}${path}&format=jsonv2&addressdetails=1&accept-language=${lang}`);
  if (!response.ok) throw new Error(`Nominatim ${response.status}`);
  return response.json();
}

// Clic sur la carte → nouvelle position
function ClickHandler({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

// Recentre la carte quand la position change (recherche, géolocalisation, chargement d'un projet)
function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, Math.max(map.getZoom(), SELECTED_ZOOM), { duration: 0.8 });
  }, [position, map]);
  return null;
}

/**
 * Choix de la localisation d'un projet sur une carte.
 *
 * Props (compatibles Form.Item) :
 *  - value / onChange : adresse texte (champ « localisation » enregistré)
 *  - coords / onCoordsChange : { lat, lng } enregistrés avec le projet
 */
export default function LocationPicker({ value, onChange, coords, onCoordsChange }) {
  const { t, i18n } = useTranslation();
  const isDark = useAdminTheme();
  const lang = (i18n.language || "fr").startsWith("en") ? "en" : "fr";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);
  const lastRequest = useRef(0);

  const lat = coords?.lat ?? null;
  const lng = coords?.lng ?? null;
  const position = useMemo(() => (lat != null && lng != null ? [lat, lng] : null), [lat, lng]);

  // Recentrer une fois sur le projet existant (mode modification)
  const centeredOnce = useRef(false);
  useEffect(() => {
    if (position && !centeredOnce.current) {
      centeredOnce.current = true;
      setFlyTarget(position);
    }
  }, [position]);

  const throttle = async () => {
    const wait = 1100 - (Date.now() - lastRequest.current);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRequest.current = Date.now();
  };

  /** Place le marqueur et remplit l'adresse à partir des coordonnées. */
  const pick = async (lat, lng, knownAddress) => {
    const rounded = { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
    onCoordsChange(rounded);
    if (knownAddress) {
      onChange(knownAddress);
      return;
    }
    setResolving(true);
    try {
      await throttle();
      const result = await nominatim(`/reverse?lat=${rounded.lat}&lon=${rounded.lng}&zoom=16`, lang);
      onChange(formatAddress(result) || `${rounded.lat}, ${rounded.lng}`);
    } catch {
      // Hors ligne ou service indisponible : on garde au moins les coordonnées
      onChange(`${rounded.lat}, ${rounded.lng}`);
      message.warning(t("admin.projects.map.reverseError"));
    } finally {
      setResolving(false);
    }
  };

  const search = async () => {
    const q = query.trim();
    if (q.length < 2) return;
    setSearching(true);
    try {
      await throttle();
      const found = await nominatim(`/search?q=${encodeURIComponent(q)}&limit=6`, lang);
      setResults(found);
      if (!found.length) message.info(t("admin.projects.map.noResult"));
    } catch {
      message.error(t("admin.projects.map.searchError"));
    } finally {
      setSearching(false);
    }
  };

  const choose = (result) => {
    const lat = Number(result.lat);
    const lng = Number(result.lon);
    setResults([]);
    setQuery("");
    setFlyTarget([lat, lng]);
    pick(lat, lng, formatAddress(result));
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      message.error(t("admin.projects.map.geoUnsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setFlyTarget([p.coords.latitude, p.coords.longitude]);
        pick(p.coords.latitude, p.coords.longitude);
      },
      () => message.error(t("admin.projects.map.geoDenied")),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const clear = () => {
    onCoordsChange({ lat: null, lng: null });
    onChange("");
  };

  return (
    <div>
      {/* Recherche d'adresse */}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <Input.Search
          size="large"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onSearch={search}
          loading={searching}
          enterButton
          allowClear
          placeholder={t("admin.projects.map.searchPlaceholder")}
          style={{ flex: 1, minWidth: 0 }}
        />
        <Tooltip title={t("admin.projects.map.myPosition")}>
          <Button size="large" icon={<AimOutlined />} onClick={locateMe} />
        </Tooltip>
      </div>

      {results.length > 0 && (
        <List
          size="small"
          bordered
          style={{ marginBottom: 8, borderRadius: 8, maxHeight: 220, overflowY: "auto" }}
          dataSource={results}
          renderItem={(r) => (
            <List.Item style={{ cursor: "pointer" }} onClick={() => choose(r)}>
              <EnvironmentOutlined style={{ color: primary, marginRight: 8 }} />
              <span style={{ fontSize: 13 }}>{r.display_name}</span>
            </List.Item>
          )}
        />
      )}

      {/* Carte */}
      <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: `1px solid ${border}` }}>
        <MapContainer
          center={position || DEFAULT_CENTER}
          zoom={position ? SELECTED_ZOOM : DEFAULT_ZOOM}
          style={{ height: 320, width: "100%", cursor: "crosshair" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={pick} />
          <FlyTo position={flyTarget} />
          {position && (
            <Marker
              position={position}
              draggable
              eventHandlers={{ dragend: (e) => { const p = e.target.getLatLng(); pick(p.lat, p.lng); } }}
            />
          )}
        </MapContainer>
        {resolving && (
          <div
            style={{
              position: "absolute", top: 10, right: 10, zIndex: 1000,
              background: "#fff", borderRadius: 8, padding: "6px 10px",
              fontSize: 12, color: "#0F172A", boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            <LoadingOutlined /> {t("admin.projects.map.resolving")}
          </div>
        )}
      </div>

      <p style={{ fontSize: 12, color: textSub, margin: "6px 0 10px" }}>{t("admin.projects.map.help")}</p>

      {/* Adresse retenue (modifiable) */}
      <Input
        size="large"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={250}
        prefix={<EnvironmentOutlined style={{ color: primary }} />}
        suffix={
          position ? (
            <Tooltip title={t("admin.projects.map.clear")}>
              <CloseOutlined onClick={clear} style={{ color: textSub, cursor: "pointer" }} />
            </Tooltip>
          ) : null
        }
        placeholder={t("admin.projects.map.addressPlaceholder")}
        style={{ borderRadius: 8 }}
      />
      {position && (
        <p style={{ fontSize: 12, color: textSub, margin: "6px 0 0" }}>
          GPS : {position[0]}, {position[1]}
        </p>
      )}
    </div>
  );
}
