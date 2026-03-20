import type {
  VoiceActivatedHrAssistant,
  VoiceAssistantCommandResult,
  VoiceAssistantSampleCommand,
} from "@/lib/types";
import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { createSelfServicePtoRequest, getSelfServiceWorkspace } from "@/lib/modules/self-service/services/self-service-service";

interface ParsedVoiceCommand {
  intent: VoiceAssistantCommandResult["intent"];
  days?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
}

const SAMPLE_COMMANDS: VoiceAssistantSampleCommand[] = [
  {
    prompt: "What is my PTO balance this quarter?",
    intent: "pto_balance",
  },
  {
    prompt: "Submit 2 days of PTO for April 10 to April 11 for vacation.",
    intent: "submit_pto_request",
  },
  {
    prompt: "Summarize my latest payroll information.",
    intent: "payroll_summary",
  },
];

function parseVoiceCommand(transcript: string): ParsedVoiceCommand {
  const normalized = transcript.trim().toLowerCase();

  if (!normalized) {
    throw new ApiError(400, "Voice transcript is required.");
  }

  if (normalized.includes("pto balance") || normalized.includes("vacation balance")) {
    return { intent: "pto_balance" };
  }

  if (normalized.includes("payroll") || normalized.includes("paystub") || normalized.includes("paid")) {
    return { intent: "payroll_summary" };
  }

  if (normalized.includes("submit") && normalized.includes("pto")) {
    const daysMatch = normalized.match(/(\d+)\s+day/);
    const dateRangeMatch = normalized.match(
      /for\s+([a-z]+\s+\d{1,2}(?:,\s*\d{4})?)\s+to\s+([a-z]+\s+\d{1,2}(?:,\s*\d{4})?)/i,
    );
    const typeMatch = normalized.match(/for\s+(vacation|annual leave|sick leave|personal leave|family care)/i);

    return {
      intent: "submit_pto_request",
      days: daysMatch ? Number(daysMatch[1]) : undefined,
      type: typeMatch?.[1]
        ?.replace(/\b\w/g, (char) => char.toUpperCase())
        .replace("Pto", "PTO"),
      startDate: dateRangeMatch ? new Date(dateRangeMatch[1]).toISOString().slice(0, 10) : undefined,
      endDate: dateRangeMatch ? new Date(dateRangeMatch[2]).toISOString().slice(0, 10) : undefined,
    };
  }

  return { intent: "help" };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export async function runVoiceAssistantCommand(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  userId: string,
  transcript: string,
) {
  const parsed = parseVoiceCommand(transcript);
  const workspace = await getSelfServiceWorkspace(supabase, organizationId, userId);

  if (parsed.intent === "pto_balance") {
    return {
      id: `voice-result-${Date.now()}`,
      transcript,
      intent: "pto_balance",
      response: `You currently have ${workspace.summary.upcomingApprovedPtoDays} approved PTO days scheduled and ${workspace.summary.pendingPtoRequests} pending PTO requests.`,
      actionTaken: "Looked up self-service PTO summary.",
    } satisfies VoiceAssistantCommandResult;
  }

  if (parsed.intent === "payroll_summary") {
    const latestPaystub = workspace.paystubs[0];

    if (!latestPaystub) {
      return {
        id: `voice-result-${Date.now()}`,
        transcript,
        intent: "payroll_summary",
        response: "No payroll items are available in self-service yet.",
        actionTaken: "Checked self-service payroll records.",
      } satisfies VoiceAssistantCommandResult;
    }

    return {
      id: `voice-result-${Date.now()}`,
      transcript,
      intent: "payroll_summary",
      response: `Your latest payroll entry is ${latestPaystub.payrollRun?.period_label ?? "the latest run"} with net pay ${formatCurrency(latestPaystub.netPay)} and status ${latestPaystub.status}.`,
      actionTaken: "Retrieved latest self-service paystub information.",
    } satisfies VoiceAssistantCommandResult;
  }

  if (parsed.intent === "submit_pto_request") {
    if (!parsed.days || !parsed.startDate || !parsed.endDate || !parsed.type) {
      throw new ApiError(
        400,
        "PTO submission commands must include a leave type, day count, and start/end dates.",
      );
    }

    const request = await createSelfServicePtoRequest(supabase, organizationId, userId, {
      type: parsed.type,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      days: parsed.days,
      notes: "Created by voice assistant command.",
    });

    return {
      id: `voice-result-${request.id}`,
      transcript,
      intent: "submit_pto_request",
      response: `Submitted a ${request.type} request for ${request.days} day(s), from ${request.startDate} to ${request.endDate}.`,
      actionTaken: "Created a self-service PTO request.",
    } satisfies VoiceAssistantCommandResult;
  }

  return {
    id: `voice-result-${Date.now()}`,
    transcript,
    intent: "help",
    response:
      "Try asking about PTO balance, submitting a PTO request, or requesting your latest payroll summary.",
    actionTaken: "Returned voice assistant help guidance.",
  } satisfies VoiceAssistantCommandResult;
}

export async function getVoiceActivatedHrAssistantPreview(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  userId: string,
) {
  const workspace = await getSelfServiceWorkspace(supabase, organizationId, userId);
  const latestPaystub = workspace.paystubs[0];

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      supportedCommands: SAMPLE_COMMANDS.length + 1,
      automationReadyActions: 3,
    },
    sampleCommands: SAMPLE_COMMANDS,
    recentResult: {
      id: "voice-preview-default",
      transcript: "What is my PTO balance this quarter?",
      intent: "pto_balance",
      response: `You currently have ${workspace.summary.upcomingApprovedPtoDays} approved PTO days scheduled and ${workspace.summary.pendingPtoRequests} pending PTO requests. Latest payroll record: ${latestPaystub ? formatCurrency(latestPaystub.netPay) : "Unavailable"}.`,
      actionTaken: "Prepared preview from self-service data.",
    },
  } satisfies VoiceActivatedHrAssistant;
}
