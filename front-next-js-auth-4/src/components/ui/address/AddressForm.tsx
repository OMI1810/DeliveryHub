"use client";

import { useState, useEffect } from "react";
import { IAddress, ICreateAddressDto } from "@/types/address.types";
import { IGeoResult } from "@/types/arcgis.types";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { MiniLoader } from "@/components/ui/MiniLoader";

interface Props {
  onSubmit: (data: ICreateAddressDto) => void;
  onCancel: () => void;
  isLoading: boolean;
  initialData?: IAddress;
}

export function AddressForm({
  onSubmit,
  onCancel,
  isLoading,
  initialData,
}: Props) {
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [flat, setFlat] = useState(initialData?.flat ?? "");
  const [floor, setFloor] = useState(initialData?.floor ?? "");
  const [entrance, setEntrance] = useState(
    initialData?.entrance?.toString() ?? "",
  );
  const [doorphone, setDoorphone] = useState(initialData?.doorphone ?? "");
  const [comment, setComment] = useState(initialData?.comment ?? "");
  const [geoData, setGeoData] = useState<IGeoResult | null>(null);

  useEffect(() => {
    if (initialData) {
      setAddress(initialData.address ?? "");
      setFlat(initialData.flat ?? "");
      setFloor(initialData.floor ?? "");
      setEntrance(initialData.entrance?.toString() ?? "");
      setDoorphone(initialData.doorphone ?? "");
      setComment(initialData.comment ?? "");
      // Для редактирования — координаты уже есть, геокодирование не нужно
      setGeoData({
        lat: initialData.coordinateY,
        lon: initialData.coordinateX,
        displayName: initialData.address,
        score: 100,
      });
    }
  }, [initialData]);

  const handleAddressSelect = (selectedAddress: string, geo: IGeoResult) => {
    setAddress(selectedAddress);
    setGeoData(geo);
  };

  const handleManualInput = (manualAddress: string) => {
    setAddress(manualAddress);
    // При ручном вводе координаты будут определены на бэкенде
    setGeoData(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    onSubmit({
      address: address.trim(),
      flat: flat.trim() || undefined,
      floor: floor.trim() || undefined,
      entrance: entrance.trim() || undefined,
      doorphone: doorphone.trim() || undefined,
      comment: comment.trim() || undefined,
      lat: geoData?.lat,
      lon: geoData?.lon,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Address with autocomplete */}
      <div>
        <label className="block text-xs font-medium mb-1 text-zinc-300">
          Адрес *
        </label>
        <AddressAutocomplete
          onSelect={handleAddressSelect}
          onManualInput={handleManualInput}
          value={address}
        />
      </div>

      {/* Flat, Floor, Entrance */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs font-medium mb-1 text-zinc-300">
            Кв.
          </label>
          <input
            type="text"
            value={flat}
            onChange={(e) => setFlat(e.target.value)}
            placeholder="42"
            className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-zinc-300">
            Этаж
          </label>
          <input
            type="text"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            placeholder="5"
            className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-zinc-300">
            Подъезд
          </label>
          <input
            type="text"
            value={entrance}
            onChange={(e) => setEntrance(e.target.value)}
            placeholder="1"
            className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
      </div>

      {/* Doorphone */}
      <div>
        <label className="block text-xs font-medium mb-1 text-zinc-300">
          Домофон
        </label>
        <input
          type="text"
          value={doorphone}
          onChange={(e) => setDoorphone(e.target.value)}
          placeholder="1234#"
          className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>

      {/* Comment */}
      <div>
        <label className="block text-xs font-medium mb-1 text-zinc-300">
          Комментарий
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Код домофона, ориентиры..."
          rows={2}
          className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
        />
      </div>

      {/* Detected coordinates info */}
      {geoData && (
        <p className="text-xs text-zinc-500">
          📍 Координаты определены автоматически
        </p>
      )}

      {/* Buttons */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 border border-zinc-700 rounded-xl text-sm font-medium active:bg-zinc-800 disabled:opacity-50"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={isLoading || !address.trim()}
          className="flex-1 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium active:bg-emerald-700 disabled:bg-zinc-700 disabled:text-zinc-500 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <MiniLoader /> Сохранение...
            </>
          ) : initialData ? (
            "Обновить"
          ) : (
            "Добавить"
          )}
        </button>
      </div>
    </form>
  );
}
