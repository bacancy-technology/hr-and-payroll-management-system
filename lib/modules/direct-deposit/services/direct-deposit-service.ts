import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";

import {
  createBankAccount,
  verifyBankAccount,
} from "@/lib/modules/direct-deposit/services/bank-account-service";

interface DirectDepositSetupInput {
  employeeId: string;
  accountHolderName: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  routingNumber: string;
  isPrimary?: boolean;
  notes?: string | null;
}

export async function setupDirectDeposit(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: DirectDepositSetupInput,
) {
  return createBankAccount(supabase, organizationId, {
    ...input,
    status: "Pending Verification",
  });
}

export async function verifyDirectDeposit(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  bankAccountId: string,
) {
  return verifyBankAccount(supabase, organizationId, bankAccountId);
}
