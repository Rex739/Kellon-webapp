import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Guardian } from "@/types/db";
import {
  getMyGuardians,
  getGuardiansOf,
  addGuardian,
  approveRecovery,
  acceptGuardianInvite,
} from "@/services/api/social-recovery";
import {
  ApprovalFormValues,
  approvalSchema,
  GuardianFormValues,
  guardianSchema,
} from "@/lib/validations/social-recovery";

export const useSocialRecovery = (isOpen: boolean) => {
  const [currentView, setCurrentView] = useState<"main" | "manage-guardians">(
    "main",
  );
  const [activeTab, setActiveTab] = useState<"my-guardians" | "guardian-for">(
    "my-guardians",
  );
  const [myGuardians, setMyGuardians] = useState<Guardian[]>([]);
  const [guardianFor, setGuardianFor] = useState<Guardian[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const guardianForm = useForm<GuardianFormValues>({
    resolver: zodResolver(guardianSchema),
    defaultValues: { guardianId: "" },
  });

  const approvalForm = useForm<ApprovalFormValues>({
    resolver: zodResolver(approvalSchema),
    defaultValues: { requestId: "" },
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [myRes, forRes] = await Promise.all([
        getMyGuardians(),
        getGuardiansOf(),
      ]);
      if (myRes.success) setMyGuardians(myRes.data || []);
      if (forRes.success) setGuardianFor(forRes.data || []);
    } catch {
      toast.error("Failed to sync guardian data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch data when modal opens or view changes to management
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData, currentView]);

  const handleAddGuardian = async (values: GuardianFormValues) => {
    const exists = myGuardians.some(
      (g) => g.guardian?.tag?.toLowerCase() === values.guardianId.toLowerCase(),
    );

    if (exists) {
      toast.error("User is already a guardian or pending.");
      return;
    }
    const res = await addGuardian(values.guardianId);
    if (res.success) {
      toast.success("Guardian added");
      guardianForm.reset();
      fetchData();
    } else {
      toast.error(res.message || "Failed to add guardian");
    }
  };

  const handleApproveRequest = async (values: ApprovalFormValues) => {
    setIsLoading(true);
    try {
      const res = await approveRecovery(values.requestId);
      if (res.success) {
        toast.success("Recovery request approved");
        approvalForm.reset();
      } else {
        toast.error(res.message || "Approval failed. Check the ID.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async (userId: string) => {
    const res = await acceptGuardianInvite(userId);
    if (res.success) {
      toast.success("Invitation accepted!");
      fetchData();
    } else {
      toast.error(res.message || "Failed to accept invitation");
    }
  };

  return {
    currentView,
    setCurrentView,
    activeTab,
    setActiveTab,
    myGuardians,
    guardianFor,
    isLoading,
    guardianForm,
    approvalForm,
    fetchData,
    handleAddGuardian,
    handleApproveRequest, // Added this
    handleAcceptInvite, // Added this
  };
};
