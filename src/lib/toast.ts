import { toastManager } from "@/components/ui/toast";

export function showErrorToast(title: string, description: string) {
  toastManager.add({
    type: "error",
    title,
    description,
  });
}

export function showSuccessToast(title: string, description: string) {
  toastManager.add({
    type: "success",
    title,
    description,
  });
}
