import { toast } from "sonner";

export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      className: "border-green-500/50 border",
    });
  },

  error: (message: string, description?: string | Error) => {
    const desc =
      description instanceof Error ? description.message : description;

    toast.error(message, {
      description: desc,
      className: "border-red-500/50 border",
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      className: "border-blue-500/50 border",
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      className: "border-yellow-500/50 border",
    });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  dismiss: (id?: string | number) => {
    toast.dismiss(id);
  },

  promise: <T>(
    promise: Promise<T>,
    data: {
      loading: string;
      success: (data: T) => string;
      error: (error: any) => string;
    }
  ) => {
    return toast.promise(promise, {
      loading: data.loading,
      success: (result) => data.success(result),
      error: (err) => data.error(err),
    });
  },
};
