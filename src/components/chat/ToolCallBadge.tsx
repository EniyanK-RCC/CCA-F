"use client";

import { ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";

interface StrReplaceArgs {
  command: "view" | "create" | "str_replace" | "insert" | "undo_edit";
  path: string;
  new_str?: string;
  old_str?: string;
  file_text?: string;
  insert_line?: number;
  view_range?: [number, number];
}

interface FileManagerArgs {
  command: "rename" | "delete";
  path: string;
  new_path?: string;
}

const STR_REPLACE_COMMANDS = ["view", "create", "str_replace", "insert", "undo_edit"];
const FILE_MANAGER_COMMANDS = ["rename", "delete"];

function isStrReplaceArgs(args: unknown): args is StrReplaceArgs {
  if (typeof args !== "object" || args === null) return false;
  const a = args as Record<string, unknown>;
  return typeof a.command === "string" &&
    STR_REPLACE_COMMANDS.includes(a.command) &&
    typeof a.path === "string";
}

function isFileManagerArgs(args: unknown): args is FileManagerArgs {
  if (typeof args !== "object" || args === null) return false;
  const a = args as Record<string, unknown>;
  return typeof a.command === "string" &&
    FILE_MANAGER_COMMANDS.includes(a.command) &&
    typeof a.path === "string";
}

function getFilename(path: string): string {
  return path.split(/[/\\]/).filter(Boolean).at(-1) ?? path;
}

export function deriveLabel(inv: ToolInvocation): string {
  const isDone = inv.state === "result" && Boolean((inv as { result?: unknown }).result);

  if (inv.toolName === "str_replace_editor") {
    if (!isStrReplaceArgs(inv.args)) return isDone ? "Done" : "Working…";
    const file = getFilename(inv.args.path);
    switch (inv.args.command) {
      case "create":     return isDone ? `Created \`${file}\``   : `Creating \`${file}\`…`;
      case "str_replace": return isDone ? `Edited \`${file}\``    : `Editing \`${file}\`…`;
      case "view":       return isDone ? `Read \`${file}\``      : `Reading \`${file}\`…`;
      case "insert":     return isDone ? `Updated \`${file}\``   : `Updating \`${file}\`…`;
      case "undo_edit":  return isDone ? `Reverted \`${file}\``  : `Reverting \`${file}\`…`;
      default:           return isDone ? "Done" : "Working…";
    }
  }

  if (inv.toolName === "file_manager") {
    if (!isFileManagerArgs(inv.args)) return isDone ? "Done" : "Working…";
    const file = getFilename(inv.args.path);
    switch (inv.args.command) {
      case "delete":
        return isDone ? `Deleted \`${file}\`` : `Deleting \`${file}\`…`;
      case "rename": {
        const newFile = inv.args.new_path ? getFilename(inv.args.new_path) : "…";
        return isDone
          ? `Renamed \`${file}\` → \`${newFile}\``
          : `Renaming \`${file}\` → \`${newFile}\`…`;
      }
      default:
        return isDone ? "Done" : "Working…";
    }
  }

  return isDone ? "Done" : "Working…";
}

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const isDone = toolInvocation.state === "result" && Boolean((toolInvocation as { result?: unknown }).result);
  const label = deriveLabel(toolInvocation);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
