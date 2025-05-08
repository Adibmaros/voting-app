import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// Using atomWithStorage to persist state between refreshes
export const selectedPackageAtom = atomWithStorage("selectedPackage", null);
export const checkoutStepAtom = atomWithStorage("checkoutStep", 1); // 1: Pilih Paket, 2: Checkout, 3: Verifikasi, 4: Terima Voucher
export const userTransactionAtom = atomWithStorage("userTransaction", null);
