"use client";

import { Editor as TinyMCEEditor } from "@tinymce/tinymce-react";
import { useRef } from "react";

// Import từ local (sau khi đã cài đặt `tinymce`)
import "tinymce/tinymce";
import "tinymce/icons/default";
import "tinymce/themes/silver";

// Plugins
import "tinymce/plugins/advlist";
import "tinymce/plugins/anchor";
import "tinymce/plugins/autolink";
import "tinymce/plugins/autosave";
import "tinymce/plugins/code";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/help";
import "tinymce/plugins/image";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/media";
import "tinymce/plugins/preview";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/table";
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/wordcount";

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
      onEditorChange={(newValue) => onChange(newValue)}
      value={value}
      init={{
        height: 500,
        menubar: "file edit view insert format tools table help",
        plugins:
          "advlist anchor autolink autosave code fullscreen help image link lists media preview searchreplace table visualblocks wordcount",
        toolbar:
          "undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist checklist | forecolor backcolor | link image media | code preview fullscreen",
        content_style:
          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
      }}
    />
  );
}
