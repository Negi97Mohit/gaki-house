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
        });
    },
};
