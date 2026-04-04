"use client";
import addressService from "@/services/address.service";
import arcgisService from "@/services/arcgis.service";
import { ICreateAddressDto } from "@/types/address.types";
import { IGeoResult } from "@/types/arcgis.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState } from "react";
import { MiniLoader } from "@/components/ui/MiniLoader";
import { AddressAutocomplete } from "./AddressAutocomplete";

const AddressMap = dynamic(
  () => import("./AddressMap").then((mod) => mod.AddressMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
        Загрузка карты...
      </div>
    ),
  },
);

const DEFAULT_CENTER: [number, number] = [55.7558, 37.6173]; // Москва

export function AddressForm() {
  const queryClient = useQueryClient();
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lon, setLon] = useState<number | undefined>(undefined);
  const [entrance, setEntrance] = useState("");
  const [doorphone, setDoorphone] = useState("");
  const [flat, setFlat] = useState("");
  const [floor, setFloor] = useState("");
  const [comment, setComment] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [isResolving, setIsResolving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { mutate, isPending, error } = useMutation({
    mutationKey: ["create-address"],
    mutationFn: (dto: ICreateAddressDto) => addressService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setAddress("");
      setLat(undefined);
      setLon(undefined);
      setEntrance("");
      setDoorphone("");
      setFlat("");
      setFloor("");
      setComment("");
      setMapCenter(DEFAULT_CENTER);
      setSuccessMessage("Адрес успешно добавлен!");
      setTimeout(() => setSuccessMessage(""), 3000);
    },
    onError: (err) => {
      console.error("Ошибка при создании адреса:", err);
      alert("Ошибка при создании адреса: " + (err as Error).message);
    },
  });

  const handleAddressSelect = (selectedAddress: string, geo: IGeoResult) => {
    setAddress(selectedAddress);
    setLat(geo.lat);
    setLon(geo.lon);
    setMapCenter([geo.lat, geo.lon]);
  };

  const handleMapLocationSelect = async (geo: IGeoResult) => {
    setLat(geo.lat);
    setLon(geo.lon);
    setMapCenter([geo.lat, geo.lon]);

    if (!geo.displayName) {
      setIsResolving(true);
      try {
        const response = await arcgisService.reverseGeocode(geo.lat, geo.lon);
        setAddress(response.data.displayName);
      } catch (err) {
        console.error("Reverse geocoding ошибка:", err);
        setAddress(`Координаты: ${geo.lat.toFixed(6)}, ${geo.lon.toFixed(6)}`);
      } finally {
        setIsResolving(false);
      }
    } else {
      setAddress(geo.displayName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      alert("Введите адрес или выберите точку на карте");
      return;
    }

    mutate({
      address,
      lat,
      lon,
      entrance: entrance || undefined,
      doorphone: doorphone || undefined,
      flat: flat || undefined,
      floor: floor || undefined,
      comment: comment || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="block text-sm font-medium mb-1">
          Или выберите точку на карте
        </label>
        <AddressMap
          center={mapCenter}
          onLocationSelect={handleMapLocationSelect}
        />
        {isResolving && (
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <span className="inline-block w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
            Определяем адрес...
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Адрес *</label>
        <AddressAutocomplete
          value={address}
          onSelect={handleAddressSelect}
          onManualInput={(manualAddress) => {
            setAddress(manualAddress);
            setLat(undefined);
            setLon(undefined);
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Квартира</label>
          <input
            type="text"
            value={flat}
            onChange={(e) => setFlat(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Этаж</label>
          <input
            type="text"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Подъезд</label>
          <input
            type="text"
            value={entrance}
            onChange={(e) => setEntrance(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Домофон</label>
          <input
            type="text"
            value={doorphone}
            onChange={(e) => setDoorphone(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Комментарий</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || isResolving}
        className="bg-primary text-white px-4 py-2 rounded-md disabled:bg-gray-400"
      >
        {isPending ? <MiniLoader /> : "Добавить адрес"}
      </button>

      {error && (
        <p className="text-red-600 text-sm">
          Ошибка: {(error as Error).message}
        </p>
      )}

      {successMessage && (
        <p className="text-green-600 text-sm">{successMessage}</p>
      )}
    </form>
  );
}
