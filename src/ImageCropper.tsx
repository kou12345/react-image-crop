import React, { useState, ChangeEvent, useRef } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

export const ImageCropper: React.FC = () => {
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [croppedImageUrls, setCroppedImageUrls] = useState<string[]>([]);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setSrc(reader.result as string);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCropComplete = async () => {
    if (src && crop && imageRef.current) {
      const croppedImageUrl = await getCroppedImg(imageRef.current, crop);
      setCroppedImageUrls([...croppedImageUrls, croppedImageUrl]);
    }
  };

  const getCroppedImg = (
    image: HTMLImageElement,
    crop: Crop
  ): Promise<string> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(URL.createObjectURL(blob as Blob));
        },
        "image/jpeg",
        0.95
      );
    });
  };

  return (
    <div style={{ display: "flex" }}>
      <div>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {src && (
          <div>
            <div style={{ width: "100%", height: "400px", overflow: "auto" }}>
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={() => handleCropComplete()}
              >
                <img ref={imageRef} src={src} alt="Crop me" />
              </ReactCrop>
            </div>
            <button onClick={handleCropComplete}>Crop</button>
          </div>
        )}
      </div>
      <div style={{ marginLeft: "20px" }}>
        {croppedImageUrls.map((croppedImageUrl, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <img src={croppedImageUrl} alt={`Cropped ${index}`} />
          </div>
        ))}
      </div>
    </div>
  );
};
