import { Editor as TinyMCEEditor } from "@tinymce/tinymce-react";

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <TinyMCEEditor
      apiKey="on744m7z5qglz3dljl45py7oqi6k8z476viskro02ueetjrq"
      value={value}
      init={{
        height: 500,
        menubar: "file edit view insert format tools table help",
        plugins: [
          "anchor",
          "autolink",
          "charmap",
          "codesample",
          "emoticons",
          "image",
          "link",
          "lists",
          "media",
          "searchreplace",
          "table",
          "visualblocks",
          "wordcount",
          "checklist",
          "mediaembed",
          "casechange",
          "formatpainter",
          "pageembed",
          "a11ychecker",
          "tinymcespellchecker",
          "permanentpen",
          "powerpaste",
          "advtable",
          "advcode",
          "editimage",
          "advtemplate",
          "ai",
          "mentions",
          "tinycomments",
          "tableofcontents",
          "footnotes",
          "mergetags",
          "autocorrect",
          "typography",
          "inlinecss",
          "markdown",
          "importword",
          "exportword",
          "exportpdf",
        ],
        toolbar:
          "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
        tinycomments_mode: "embedded",
        tinycomments_author: "Author name",
        mergetags_list: [
          { value: "First.Name", title: "First Name" },
          { value: "Email", title: "Email" },
        ],
        ai_request: (
          request: any,
          respondWith: { string: (callback: () => Promise<string>) => void }
        ) => {
          respondWith.string(() =>
            Promise.reject("See docs to implement AI Assistant")
          );
        },
      }}
      onEditorChange={handleEditorChange}
    />
  );
}
