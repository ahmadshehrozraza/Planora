"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useVerifyPassword } from "../api/use-verify-current-password";
import { useDeleteAccount } from "../api/use-delete-account";
import { useChangeEmail } from "../api/use-change-email";
import { useChangePassword } from "../api/use-change-password";
import { useConfirm } from "@/hooks/use-confirm";

export type SecurityActionType = "email" | "password" | "delete" | null;

interface SecurityActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: SecurityActionType;
}

export const SecurityActionModal = ({ isOpen, onClose, actionType }: SecurityActionModalProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { mutateAsync: verifyPassword, isPending: isVerifying } = useVerifyPassword();
  const { mutateAsync: deleteAccount, isPending: isDeleting } = useDeleteAccount();
  const { mutateAsync: changeEmail, isPending: isUpdatingEmail } = useChangeEmail();
  const { mutateAsync: changePassword, isPending: isUpdatingPassword } = useChangePassword();
  
  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Account",
    "This action cannot be undone and will delete your account information permanently.",
    "destructive",
  );

  const isPending = isVerifying || isDeleting || isUpdatingEmail || isUpdatingPassword;

  useEffect(() => {
    if (isOpen) {
      setCurrentPassword("");
      setNewEmail("");
      setNewPassword("");
      setConfirmPassword("");
      setIsVerified(false);
      setEmailError("");
    }
  }, [isOpen, actionType]);

  const handleVerifyStep = async () => {
    if (!currentPassword) {
      toast.error("Current password is required to continue");
      return;
    }
    try {
      await verifyPassword(currentPassword);
      setIsVerified(true);
    } catch (error) {
    }
  };

  const handleFinalSubmit = async () => {
    try {
      if (actionType === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!newEmail) {
          setEmailError("Email address is required");
          return;
        }
        if (!emailRegex.test(newEmail)) {
          setEmailError("Please enter a valid email address");
          return;
        }
        setEmailError("");
        await changeEmail({ currentPassword, newEmail });
        onClose();
      } 
      else if (actionType === "password") {
        if (!newPassword || !confirmPassword) {
          toast.error("Please fill in all password fields");
          return;
        }
        if (newPassword !== confirmPassword) {
          toast.error("New passwords do not match");
          return;
        }
        if (currentPassword === newPassword) {
          toast.error("New password cannot be the same as the current password");
          return;
        }
        await changePassword({ currentPassword, newPassword });
        onClose();
      } 
      else if (actionType === "delete") {
        const ok = await confirmDelete();
        if (!ok) return;

        await deleteAccount(currentPassword);
        onClose();
      }
    } catch (error) {

    }
  };

  if (!actionType) return null;

  return (
    <>
      <DeleteDialog />
      <Dialog open={isOpen} onOpenChange={(open) => !isPending && onClose()}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className={actionType === "delete" ? "text-destructive flex items-center gap-2" : "flex items-center gap-2"}>
              {actionType === "delete" && <AlertTriangle className="size-5" />}
              {actionType === "email" && "Change Email Address"}
              {actionType === "password" && "Change Password"}
              {actionType === "delete" && "Delete Account"}
            </DialogTitle>
            <DialogDescription>
              {!isVerified 
                ? "Please enter your current password to verify your identity."
                : actionType === "email" 
                  ? "Enter your new email address below."
                  : actionType === "password"
                    ? "Enter and confirm your new password."
                    : "Are you absolutely sure you want to delete your account? This cannot be undone."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {!isVerified ? (
              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-1.5">
                  <ShieldAlert className="size-3.5 text-muted-foreground" /> 
                  Current Password
                </Label>
                <Input
                  type="password"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isPending}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyStep()}
                />
              </div>
            ) : (
              <>
                {actionType === "email" && (
                  <div className="flex flex-col gap-2">
                    <Label>New Email Address</Label>
                    <Input
                      type="email"
                      placeholder="new@example.com"
                      value={newEmail}
                      onChange={(e) => {
                        setNewEmail(e.target.value);
                        if (emailError) setEmailError("");
                      }}
                      disabled={isPending}
                      className={emailError ? "border-destructive" : ""}
                    />
                    {emailError && <span className="text-xs text-destructive">{emailError}</span>}
                  </div>
                )}

                {actionType === "password" && (
                  <>
                    <div className="flex flex-col gap-2">
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isPending}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Confirm New Password</Label>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isPending}
                        onKeyDown={(e) => e.key === "Enter" && handleFinalSubmit()}
                      />
                    </div>
                  </>
                )}

                {actionType === "delete" && (
                  <div className="flex items-center gap-3 p-3 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
                    <CheckCircle2 className="size-5 shrink-0" />
                    <p className="text-sm font-medium">Password verified. Final confirmation needed.</p>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>

            {!isVerified ? (
              <Button onClick={handleVerifyStep} disabled={isPending || !currentPassword}>
                {isVerifying && <Loader2 className="size-4 animate-spin mr-2" />}
                {isVerifying ? "Verifying..." : "Verify Password"}
              </Button>
            ) : (
              <Button 
                variant={actionType === "delete" ? "destructive" : "default"} 
                onClick={handleFinalSubmit}
                disabled={isPending}
              >
                {isPending && <Loader2 className="size-4 animate-spin mr-2" />}
                {isPending ? "Processing..." : actionType === "delete" ? "Confirm Delete" : "Update"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};