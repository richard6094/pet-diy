import React from 'react';

const UploadedImagesPanel = ({ uploadedImages = [], onRemoveImage }) => {
  const hasImages = uploadedImages.length > 0;
  const handleRemove = (event, id) => {
    event.stopPropagation();
    if (typeof onRemoveImage === 'function') {
      onRemoveImage(id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-4">已上传宠物图片</h2>
      {hasImages ? (
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 h-full overflow-y-auto pr-1">
            {uploadedImages.map((image, index) => (
              <div key={image.id ?? image.name ?? index} className="relative group">
                <img
                  src={image.preview}
                  alt={image.name}
                  className="w-full h-24 object-cover rounded-md shadow-sm"
                />
                <div className="absolute inset-0 rounded-md bg-black/0 group-hover:bg-black/30 transition-opacity duration-200 pointer-events-none" />
                <div className="absolute bottom-1 left-1 text-white text-[10px] bg-black/60 px-1 py-0.5 rounded truncate max-w-[95%]">
                  {image.name}
                </div>
                {onRemoveImage && (
                  <button
                    type="button"
                    onClick={(event) => handleRemove(event, image.id ?? image.name ?? index)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center shadow-lg z-10"
                    aria-label="移除图片"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-sm text-center border border-dashed border-gray-200 rounded-lg p-6 bg-gray-50">
          <svg
            className="w-10 h-10 text-gray-300 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <p>暂未上传任何宠物图片</p>
          <p className="text-xs text-gray-400 mt-1">上传后将在此处展示缩略图</p>
        </div>
      )}
    </div>
  );
};

export default UploadedImagesPanel;
