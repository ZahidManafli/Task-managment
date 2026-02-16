import { useState } from 'react';

const ImageUpload = ({ onImageSelect, existingImages = [] }) => {
  const [previewImages, setPreviewImages] = useState(existingImages);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      const newPreviews = imageFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      }));

      setPreviewImages([...previewImages, ...newPreviews]);
      onImageSelect([...previewImages, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setPreviewImages(newPreviews);
    onImageSelect(newPreviews);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Attach Images
      </label>
      <div className="flex items-center space-x-4">
        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 transition">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <span className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Images</span>
          </span>
        </label>
      </div>
      {previewImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {previewImages.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img.preview || img.url}
                alt={img.name || `Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-300"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
