import { test, expect, afterEach, describe } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// Helpers to build fixtures
function callInv(toolName: string, args: Record<string, unknown>): ToolInvocation {
  return { state: "call", toolCallId: "t1", toolName, args } as ToolInvocation;
}

function resultInv(toolName: string, args: Record<string, unknown>, result: unknown = "ok"): ToolInvocation {
  return { state: "result", toolCallId: "t1", toolName, args, result } as ToolInvocation;
}

function partialInv(toolName: string, args: Record<string, unknown>): ToolInvocation {
  return { state: "partial-call", toolCallId: "t1", toolName, args } as ToolInvocation;
}

const STR = "str_replace_editor";
const FM = "file_manager";
const BUTTON = "/components/Button.jsx";

// --- Group A: str_replace_editor, done ---
describe("str_replace_editor — done", () => {
  test("create → Created `Button.jsx`", () => {
    render(<ToolCallBadge toolInvocation={resultInv(STR, { command: "create", path: BUTTON })} />);
    expect(screen.getByText(/Created `Button\.jsx`/)).toBeDefined();
  });

  test("str_replace → Edited `Button.jsx`", () => {
    render(<ToolCallBadge toolInvocation={resultInv(STR, { command: "str_replace", path: BUTTON })} />);
    expect(screen.getByText(/Edited `Button\.jsx`/)).toBeDefined();
  });

  test("view → Read `Button.jsx`", () => {
    render(<ToolCallBadge toolInvocation={resultInv(STR, { command: "view", path: BUTTON })} />);
    expect(screen.getByText(/Read `Button\.jsx`/)).toBeDefined();
  });

  test("insert → Updated `Button.jsx`", () => {
    render(<ToolCallBadge toolInvocation={resultInv(STR, { command: "insert", path: BUTTON })} />);
    expect(screen.getByText(/Updated `Button\.jsx`/)).toBeDefined();
  });

  test("undo_edit → Reverted `Button.jsx`", () => {
    render(<ToolCallBadge toolInvocation={resultInv(STR, { command: "undo_edit", path: BUTTON })} />);
    expect(screen.getByText(/Reverted `Button\.jsx`/)).toBeDefined();
  });
});

// --- Group B: str_replace_editor, in-progress ---
describe("str_replace_editor — in-progress", () => {
  test("create → Creating `Button.jsx`…", () => {
    render(<ToolCallBadge toolInvocation={callInv(STR, { command: "create", path: BUTTON })} />);
    expect(screen.getByText(/Creating `Button\.jsx`…/)).toBeDefined();
  });

  test("str_replace → Editing `Button.jsx`…", () => {
    render(<ToolCallBadge toolInvocation={callInv(STR, { command: "str_replace", path: BUTTON })} />);
    expect(screen.getByText(/Editing `Button\.jsx`…/)).toBeDefined();
  });

  test("view → Reading `Button.jsx`…", () => {
    render(<ToolCallBadge toolInvocation={callInv(STR, { command: "view", path: BUTTON })} />);
    expect(screen.getByText(/Reading `Button\.jsx`…/)).toBeDefined();
  });

  test("insert → Updating `Button.jsx`…", () => {
    render(<ToolCallBadge toolInvocation={callInv(STR, { command: "insert", path: BUTTON })} />);
    expect(screen.getByText(/Updating `Button\.jsx`…/)).toBeDefined();
  });

  test("undo_edit → Reverting `Button.jsx`…", () => {
    render(<ToolCallBadge toolInvocation={callInv(STR, { command: "undo_edit", path: BUTTON })} />);
    expect(screen.getByText(/Reverting `Button\.jsx`…/)).toBeDefined();
  });
});

// --- Group C: file_manager ---
describe("file_manager", () => {
  test("delete done → Deleted `Button.jsx`", () => {
    render(<ToolCallBadge toolInvocation={resultInv(FM, { command: "delete", path: BUTTON })} />);
    expect(screen.getByText(/Deleted `Button\.jsx`/)).toBeDefined();
  });

  test("delete in-progress → Deleting `Button.jsx`…", () => {
    render(<ToolCallBadge toolInvocation={callInv(FM, { command: "delete", path: BUTTON })} />);
    expect(screen.getByText(/Deleting `Button\.jsx`…/)).toBeDefined();
  });

  test("rename done → Renamed `old.jsx` → `new.jsx`", () => {
    render(<ToolCallBadge toolInvocation={resultInv(FM, { command: "rename", path: "/components/old.jsx", new_path: "/components/new.jsx" })} />);
    expect(screen.getByText(/Renamed `old\.jsx` → `new\.jsx`/)).toBeDefined();
  });

  test("rename in-progress → Renaming `old.jsx` → `new.jsx`…", () => {
    render(<ToolCallBadge toolInvocation={callInv(FM, { command: "rename", path: "/components/old.jsx", new_path: "/components/new.jsx" })} />);
    expect(screen.getByText(/Renaming `old\.jsx` → `new\.jsx`…/)).toBeDefined();
  });

  test("rename in-progress without new_path → Renaming `old.jsx` → `…`…", () => {
    render(<ToolCallBadge toolInvocation={callInv(FM, { command: "rename", path: "/components/old.jsx" })} />);
    expect(screen.getByText(/Renaming `old\.jsx` → `…`…/)).toBeDefined();
  });
});

// --- Group D: edge cases ---
describe("edge cases", () => {
  test("unknown toolName in-progress → Working…", () => {
    render(<ToolCallBadge toolInvocation={callInv("unknown_tool", {})} />);
    expect(screen.getByText("Working…")).toBeDefined();
  });

  test("unknown toolName done → Done", () => {
    render(<ToolCallBadge toolInvocation={resultInv("unknown_tool", {}, "x")} />);
    expect(screen.getByText("Done")).toBeDefined();
  });

  test("partial-call with empty args → Working…", () => {
    render(<ToolCallBadge toolInvocation={partialInv(STR, {})} />);
    expect(screen.getByText("Working…")).toBeDefined();
  });

  test("partial-call with command but no path → Working…", () => {
    render(<ToolCallBadge toolInvocation={partialInv(STR, { command: "create" })} />);
    expect(screen.getByText("Working…")).toBeDefined();
  });

  test("partial-call with valid command and path → label derived", () => {
    render(<ToolCallBadge toolInvocation={partialInv(STR, { command: "create", path: "/Button.jsx" })} />);
    expect(screen.getByText(/Creating `Button\.jsx`…/)).toBeDefined();
  });

  test("result with falsy result value → treated as in-progress", () => {
    render(<ToolCallBadge toolInvocation={resultInv(STR, { command: "view", path: BUTTON }, "")} />);
    expect(screen.getByText(/Reading `Button\.jsx`…/)).toBeDefined();
  });

  test("nested path extracts only the filename", () => {
    render(<ToolCallBadge toolInvocation={callInv(STR, { command: "create", path: "/src/components/ui/Button.jsx" })} />);
    expect(screen.getByText(/Creating `Button\.jsx`…/)).toBeDefined();
  });

  test("path with no slashes uses the path as filename", () => {
    render(<ToolCallBadge toolInvocation={callInv(STR, { command: "view", path: "index.ts" })} />);
    expect(screen.getByText(/Reading `index\.ts`…/)).toBeDefined();
  });
});

// --- Group E: visual state ---
describe("visual state", () => {
  test("in-progress shows spinner", () => {
    const { container } = render(<ToolCallBadge toolInvocation={callInv(STR, { command: "create", path: BUTTON })} />);
    expect(container.querySelector(".animate-spin")).not.toBeNull();
    expect(container.querySelector(".bg-emerald-500")).toBeNull();
  });

  test("done shows green dot and no spinner", () => {
    const { container } = render(<ToolCallBadge toolInvocation={resultInv(STR, { command: "create", path: BUTTON })} />);
    expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
    expect(container.querySelector(".animate-spin")).toBeNull();
  });
});
