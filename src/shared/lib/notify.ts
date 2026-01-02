<<<<<<< HEAD
import { toast } from "sonner";

export const notify = {
    success: (message: string, description?: string) => {
        toast.success(message, {
            description,
            className: "border-green-500/50 border",
        });
    },
    error: (message: string, description?: string | Error) => {
        const desc = description instanceof Error ? description.message : description;
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
            success: (result) => {
                return data.success(result);
            },
            error: (err) => {
                return data.error(err);
            },
            // Note: Sonner's promise toast doesn't easily support dynamic classNames per state in the options,
            // but the default styling is usually sufficient. Customizing per-state border here is complex
            // without wrapping the promise logic significantly. We'll rely on default Sonner behavior for promises
            // or subsequent specific toast calls if stricness is needed.
=======
// src/shared/lib/notify.ts
import { toast } from "@/shared/hooks/use-toast";

/**
 * Simple notification wrapper around toast
 */
export const notify = {
    success: (message: string, description?: string) => {
        toast({
            title: message,
            description,
            variant: "default",
        });
    },

    error: (message: string, description?: string) => {
        toast({
            title: message,
            description,
            variant: "destructive",
        });
    },

    info: (message: string, description?: string) => {
        toast({
            title: message,
            description,
            variant: "default",
>>>>>>> main
        });
    },
};
