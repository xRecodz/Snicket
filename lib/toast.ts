import { toast } from "sonner"

export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      style: {
        background: "linear-gradient(135deg, hsl(142 71% 45% / 0.1), hsl(142 71% 45% / 0.05))",
        border: "1px solid hsl(142 71% 45% / 0.3)",
        color: "hsl(142 71% 45%)",
      },
    })
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      style: {
        background: "linear-gradient(135deg, hsl(0 72% 51% / 0.1), hsl(0 72% 51% / 0.05))",
        border: "1px solid hsl(0 72% 51% / 0.3)",
        color: "hsl(0 72% 51%)",
      },
    })
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      style: {
        background: "linear-gradient(135deg, hsl(35 100% 60% / 0.1), hsl(35 100% 60% / 0.05))",
        border: "1px solid hsl(35 100% 60% / 0.3)",
        color: "hsl(35 100% 60%)",
      },
    })
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      style: {
        background: "linear-gradient(135deg, hsl(185 100% 60% / 0.1), hsl(185 100% 60% / 0.05))",
        border: "1px solid hsl(185 100% 60% / 0.3)",
        color: "hsl(185 100% 60%)",
      },
    })
  },

  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: "linear-gradient(135deg, hsl(250 100% 70% / 0.1), hsl(280 100% 65% / 0.05))",
        border: "1px solid hsl(250 100% 70% / 0.3)",
        color: "hsl(250 100% 70%)",
      },
    })
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    },
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
      style: {
        background: "hsl(240 30% 12%)",
        border: "1px solid hsl(250 100% 70% / 0.3)",
        color: "hsl(280 20% 95%)",
      },
    })
  },
}
