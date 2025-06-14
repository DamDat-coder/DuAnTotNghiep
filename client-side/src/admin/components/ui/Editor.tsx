"use client";

import { Editor as TinyMCEEditor } from "@tinymce/tinymce-react";
import { useRef } from "react";

export default function Editor({
  value,
  onChange,
}: {
  value: string;
  onChange: (content: string) => void;
}) {
  const editorRef = useRef(null);

  return (
    <TinyMCEEditor
      tinymceScriptSrc="https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js"
      onEditorChange={(newValue) => onChange(newValue)}
      value={value}
      init={{
        height: 500,
        menubar: true,
        plugins:
          "preview anchor autolink fullscreen searchreplace visualblocks code image link media table wordcount",
        toolbar:
          "undo redo | formatselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | preview code fullscreen",
        content_style:
          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
      }}
    />
  );
}
