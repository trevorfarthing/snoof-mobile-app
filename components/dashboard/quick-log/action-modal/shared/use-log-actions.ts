import { SubmitParams, SubmitResult } from "@/lib/hooks/activity-logs/types";
import { useDeleteActivityLog } from "@/lib/hooks/activity-logs/use-delete-activity-log";
import { useAuthContext } from "@/lib/hooks/use-auth-context";
import { usePetStore } from "@/lib/stores/use-pet-store";
import { Alert } from "react-native";

// Minimal contract every activity-log form hook satisfies. Lets useLogActions
// stay generic across walk / feeding / potty / future types.
export type LogFormHandle = {
  submit: (params: SubmitParams) => Promise<SubmitResult>;
  update: (params: SubmitParams) => Promise<SubmitResult>;
  reset: () => void;
  activityLogId: string | null;
  setError: (error: string | null) => void;
};

type Args = {
  form: LogFormHandle;
  // Used in the delete confirm title — e.g. "walk" → "Delete this walk log?".
  label: string;
  onLogged?: () => void;
  onClose: () => void;
};

// Wraps the auth check, the success → onLogged + onClose flow, and the
// destructive-delete confirm.
export const useLogActions = ({ form, label, onLogged, onClose }: Args) => {
  const { activePet } = usePetStore();
  const { session } = useAuthContext();
  const deleteHook = useDeleteActivityLog();
  const userId = session?.user?.id;

  const requireAuth = () => {
    if (!activePet || !userId) {
      form.setError("You must be signed in with an active pet");
      return null;
    }
    return { activePet, userId };
  };

  // Create a new log
  const handleSubmit = async () => {
    const ctx = requireAuth();
    if (!ctx) {
      return;
    }
    const { error } = await form.submit({
      petId: ctx.activePet.id,
      householdId: ctx.activePet.household_id,
      userId: ctx.userId,
    });
    if (error) {
      return;
    }
    form.reset();
    onLogged?.();
    onClose();
  };

  // Update an existing log
  const handleUpdate = async () => {
    const ctx = requireAuth();
    if (!ctx) {
      return;
    }
    const { error } = await form.update({
      petId: ctx.activePet.id,
      householdId: ctx.activePet.household_id,
      userId: ctx.userId,
    });
    if (error) {
      return;
    }
    onLogged?.();
    onClose();
  };

  // Delete an existing log
  const handleDelete = () => {
    if (!form.activityLogId) {
      return;
    }
    Alert.alert(
      `Delete this ${label} log?`,
      "It will disappear for everyone in your household.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await deleteHook.remove(form.activityLogId!);
            if (error) {
              form.setError(error);
              return;
            }
            onLogged?.();
            onClose();
          },
        },
      ],
    );
  };

  return { handleSubmit, handleUpdate, handleDelete };
};
