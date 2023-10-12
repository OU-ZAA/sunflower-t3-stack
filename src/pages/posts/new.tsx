import "material-symbols";
import { useCallback, useMemo } from "react";
import {
  Editor,
  createEditor,
  type BaseEditor,
  type Descendant,
  Transforms,
  Element as SlateElement,
} from "slate";
import { withHistory, type HistoryEditor } from "slate-history";
import {
  Editable,
  Slate,
  useSlate,
  withReact,
  type ReactEditor,
  type RenderElementProps,
  type RenderLeafProps,
} from "slate-react";
import { ToolbarButton } from "~/components/toolbar-button";
import { Icon } from "~/components/icon";

type ElementType =
  | "paragraph"
  | "block-quote"
  | "heading-one"
  | "heading-two"
  | "bulleted-list"
  | "list-item"
  | "numbered-list";

type CustomElement = {
  type: ElementType;
  children: CustomText[];
  align?: "left" | "center" | "right" | "justify";
};

type CustomText = {
  text: string;
  bold?: true;
  code?: true;
  italic?: true;
  underline?: true;
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

type MarkFormat = "bold" | "code" | "italic" | "underline";

type BlockFormat =
  | "block-quote"
  | "heading-one"
  | "heading-two"
  | "bulleted-list"
  | "numbered-list"
  | "left"
  | "center"
  | "right"
  | "justify";

type BlockType = "align" | "type";

const LIST_TYPES = ["numbered-list", "bulleted-list"];
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [
      { text: "This is editable " },
      { text: "rich", bold: true },
      { text: " text, " },
      { text: "much", italic: true },
      { text: " better than a " },
      { text: " <textarea>", code: true },
      { text: "!" },
    ],
  },
  {
    type: "paragraph",
    children: [
      {
        text: "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: "bold", bold: true },
      {
        text: ", or add a semantically rendered block quote in the middle of the page, like this:",
      },
    ],
  },
  {
    type: "block-quote",
    children: [{ text: "A wise quote." }],
  },
  {
    type: "paragraph",
    align: "center",
    children: [{ text: "Try it out for yourself!" }],
  },
];

const isMarkActive = (editor: Editor, format: MarkFormat) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const toggleMark = (editor: Editor, format: MarkFormat) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (
  editor: Editor,
  format: BlockFormat,
  blockType: BlockType = "type",
) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    }),
  );

  return !!match;
};

const toggleBlock = (editor: Editor, format: BlockFormat) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? "align" : "type",
  );
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });

  let newProperties: Partial<SlateElement>;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      // TODO: fix the typing error
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      // TODO: fix the typing error
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    };
  }
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    // TODO: fix the typing error
    Transforms.wrapNodes(editor, block);
  }
};

export default function RichTextExample() {
  const renderElement = useCallback(
    (props: RenderElementProps) => <Element {...props} />,
    [],
  );
  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    [],
  );
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  return (
    <div className="mx-auto mt-4 max-w-2xl border">
      <Slate editor={editor} initialValue={initialValue}>
        <div className="flex gap-4 border-b-2 px-5 py-3">
          <MarkButton format="bold" icon="format_bold" />
          <MarkButton format="italic" icon="format_italic" />
          <MarkButton format="underline" icon="format_underlined" />
          <MarkButton format="code" icon="code" />
          <BlockButton format="heading-one" icon="looks_one" />
          <BlockButton format="heading-two" icon="looks_two" />
          <BlockButton format="block-quote" icon="format_quote" />
          <BlockButton format="numbered-list" icon="format_list_numbered" />
          <BlockButton format="bulleted-list" icon="format_list_bulleted" />
          <BlockButton format="left" icon="format_align_left" />
          <BlockButton format="center" icon="format_align_center" />
          <BlockButton format="right" icon="format_align_right" />
          <BlockButton format="justify" icon="format_align_justify" />
        </div>
        <div className="p-5">
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Enter some rich text…"
            spellCheck
            autoFocus
          />
        </div>
      </Slate>
    </div>
  );
}

const MarkButton = ({ format, icon }: { format: MarkFormat; icon: string }) => {
  const editor = useSlate();
  return (
    <ToolbarButton
      isActive={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </ToolbarButton>
  );
};

const BlockButton = ({
  format,
  icon,
}: {
  format: BlockFormat;
  icon: string;
}) => {
  const editor = useSlate();
  return (
    <ToolbarButton
      isActive={isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? "align" : "type",
      )}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </ToolbarButton>
  );
};

const Element = (props: RenderElementProps) => {
  const style = { textAlign: props.element.align };
  switch (props.element.type) {
    case "block-quote":
      return (
        <blockquote
          style={style}
          className="border-l-2 border-slate-200 pl-3 italic text-slate-400"
          {...props.attributes}
        >
          {props.children}
        </blockquote>
      );
    case "bulleted-list":
      return (
        <ul style={style} {...props.attributes}>
          {props.children}
        </ul>
      );
    case "heading-one":
      return (
        <h1 style={style} {...props.attributes}>
          {props.children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 style={style} {...props.attributes}>
          {props.children}
        </h2>
      );
    case "list-item":
      return (
        <li style={style} {...props.attributes}>
          {props.children}
        </li>
      );
    case "numbered-list":
      return (
        <ol style={style} {...props.attributes}>
          {props.children}
        </ol>
      );
    default:
      return (
        <p style={style} {...props.attributes}>
          {props.children}
        </p>
      );
  }
};

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code className="bg-slate-100 p-1 text-sm">{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};
