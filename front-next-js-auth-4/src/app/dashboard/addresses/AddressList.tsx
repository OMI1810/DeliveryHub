"use client";
import addressService from "@/services/address.service";
import { IAddressUser } from "@/types/address.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MiniLoader } from "@/components/ui/MiniLoader";

export function AddressList() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressService.getAll(),
  });

  const { mutate: removeAddress, isPending: isDeleting } = useMutation({
    mutationKey: ["delete-address"],
    mutationFn: (id: string) => addressService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  if (isLoading) {
    return (
      <div className="mt-6">
        <MiniLoader width={100} height={100} />
      </div>
    );
  }

  const addressUsers: IAddressUser[] = data?.data || [];

  if (addressUsers.length === 0) {
    return (
      <p className="mt-4 text-gray-500">У вас пока нет сохранённых адресов</p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-xl font-semibold">Ваши адреса</h3>
      {addressUsers.map((item: IAddressUser) => {
        const addr = item.address;
        return (
          <div key={addr.idAddress} className="border rounded-lg p-4 space-y-2">
            <p className="font-medium">{addr.address}</p>
            <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
              {addr.flat && <p>Квартира: {addr.flat}</p>}
              {addr.floor && <p>Этаж: {addr.floor}</p>}
              {addr.entrance && <p>Подъезд: {addr.entrance}</p>}
              {addr.doorphone && <p>Домофон: {addr.doorphone}</p>}
              {addr.comment && (
                <p className="col-span-2">Комментарий: {addr.comment}</p>
              )}
            </div>
            <button
              onClick={() => removeAddress(addr.idAddress)}
              disabled={isDeleting}
              className="mt-2 text-red-600 hover:text-red-800 disabled:text-gray-400"
            >
              {isDeleting ? "Удаление..." : "Удалить"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
