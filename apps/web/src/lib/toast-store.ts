import { toast } from "sonner";

type ToastApi = {
  show: (message: string) => void;
  clear: () => void;
};

const api: ToastApi = {
  show: (message) => {
    toast(message);
  },
  clear: () => {
    toast.dismiss();
  },
};

export function useToast<T>(selector: (state: ToastApi) => T): T {
  return selector(api);
}
