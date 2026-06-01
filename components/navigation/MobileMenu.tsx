"use client";

import { FC, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Icons } from "@/components/Icons";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { truncateAddress } from "@/lib/truncate-address";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ModeToggle from "@/components/ModeToggle";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  address?: `0x${string}`;
  onDisconnect: () => void;
}

const MobileMenu: FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  address,
  onDisconnect,
}) => {
  const truncatedAddress = truncateAddress(address, 4, 4);

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!address) return;
    copyToClipboard(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2s
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="fixed inset-0 bg-black/50 z-50"
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-72 bg-white dark:bg-secondary-60 shadow-lg flex flex-col p-4"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
              <Icons.Logo className="h-10 w-10 bg-white dark:bg-secondary-60 p-2 rounded-md shadow-2xl border border-black dark:border-white" />
            </div>
            {/* Wallet Address Card */}
            {address && (
              <div className="rounded-lg p-3 mb-2 flex justify-between items-center border border-primary-50 dark:border-primary-50 my-4  dark:shadow-topbar">
                <div className="flex space-x-2">
                  <div className="  text-sm font-light tracking-mid">
                    {truncatedAddress}
                  </div>
                  <button
                    onClick={handleCopy}
                    aria-label="Copy address"
                    className="ml-2 cursor-copy"
                  >
                    {copied ? (
                      <Icons.CopySuccess className="h-4 w-4 text-green-500" />
                    ) : (
                      <Icons.Copy className="h-4 w-4 text-black dark:text-white " />
                    )}
                  </button>
                </div>
                <div>
                  {/* Disconnect directly below address */}
                  {address && (
                    <div className="">
                      <Button
                        size={"xs"}
                        onClick={() => {
                          onDisconnect();
                          onClose();
                        }}
                        className="text-white text-xs font-semibold"
                      >
                        Disconnect
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            <Separator className="mt-auto" />
            <div className="w-full py-2 flex items-center">
              <span className="text-xs font-medium">switch network</span>
              <ModeToggle className="w-auto ml-auto" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
