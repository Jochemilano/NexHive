import React, { useRef, useState, useEffect } from "react";

const AvatarInput = ({ handleFile, currentAvatar = null }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(currentAvatar);

  // Actualizar preview si cambia currentAvatar desde props
  useEffect(() => {
    setPreview(currentAvatar);
  }, [currentAvatar]);

  const onClick = () => {
    inputRef.current?.click();
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    if (handleFile) handleFile(file);
  };

  return (
    <>
      <div className="avatar-input-container">
        <div
          className="avatar-input-wrapper"
          onClick={onClick}
          role="button"
          tabIndex={0}
          onKeyPress={onClick}
        >
          {!preview && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              fill="var(--text-secondary)"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M4 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.586l-1.707-1.707A.996.996 0 0 0 14.586 3H9.414a.996.996 0 0 0-.707.293L7 5H4zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
            </svg>
          )}
          {preview && (
            <img
              src={preview}
              alt="avatar preview"
              className="avatar-preview"
              draggable={false}
            />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          ref={inputRef}
          style={{ display: "none" }}
        />
      </div>

      <style jsx>{`
        .avatar-input-container {
          width: 100%;
          display: flex;
          justify-content: center;
          margin: 16px 0;
        }

        .avatar-input-wrapper {
          width: 96px;
          height: 96px;
          border: 2px dashed var(--primary);
          border-radius: 50%;
          background-color: var(--bg-soft);
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          transition: 0.3s ease;
        }

        .avatar-input-wrapper:hover,
        .avatar-input-wrapper:focus {
          border-color: var(--secondary);
          transform: scale(1.05);
          outline: none;
        }

        .avatar-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          user-select: none;
          pointer-events: none;
          display: block;
          position: absolute;
          top: 0;
          left: 0;
        }
      `}</style>
    </>
  );
};

export default AvatarInput;