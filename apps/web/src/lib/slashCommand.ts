import { Extension } from "@tiptap/core";

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addKeyboardShortcuts() {
    return {
      "/": () => {
        const { state, dispatch } = this.editor.view;
        const { selection } = state;
        const { $from } = selection;

        // Check if we're at the start of a paragraph
        if ($from.parent.type.name !== "paragraph") return false;
        if ($from.parentOffset !== 0) return false;

        // Dispatch a custom event that our React component can listen to
        window.dispatchEvent(new CustomEvent("slash-command", {
          detail: { from: $from.pos, editor: this.editor },
        }));

        return true;
      },
    };
  },
});
