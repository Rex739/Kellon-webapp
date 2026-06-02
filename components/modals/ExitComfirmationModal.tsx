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
            className="text-sm font-bold text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            STAY
          </button>
          <button
            onClick={onLeave}
            className="text-sm font-bold text-primary-70 hover:opacity-80 transition-opacity cursor-pointer"
          >
            LEAVE
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
