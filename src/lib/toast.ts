import { toastManager } from "@/components/ui/toast";

export function showErrorToast(title: string, description: string) {
  toastManager.add({
    description,
    title,
    type: "error",
  });
}

export function showSuccessToast(title: string, description: string) {
  toastManager.add({
    description,
    title,
    type: "success",
  });
}
