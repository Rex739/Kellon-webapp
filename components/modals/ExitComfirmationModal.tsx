import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ExitConfirmationProps {
  isOpen: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export function ExitConfirmation({
  isOpen,
  onStay,
  onLeave,
}: ExitConfirmationProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-[300px] rounded-[32px] border-none bg-gray-70 outline-none dark:bg-black2">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold">
            Cancel
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-500">
            Are you sure you want to cancel this purchase?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-end gap-4 sm:justify-end">
          <button
            onClick={onStay}
            className="rounded-full px-3 py-2 text-sm font-bold text-gray-400 transition-colors hover:bg-gray-50 hover:text-black dark:hover:bg-secondary-60/50 dark:hover:text-white cursor-pointer"
          >
            STAY
          </button>
          <button
            onClick={onLeave}
            className="rounded-full px-3 py-2 text-sm font-bold text-primary-70 transition-opacity hover:opacity-80 cursor-pointer"
          >
            LEAVE
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
