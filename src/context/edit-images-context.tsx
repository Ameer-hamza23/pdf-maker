import React, { createContext, useContext, useState } from "react";

export type ImageFilter = "none" | "mono" | "warm" | "cool";

export type EditableImage = {
  id: string;
  uri: string;
  rotation: number;
  filter: ImageFilter;
  crop: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  processedUri?: string;
  key?: string; // Added for DraggableGrid compatibility
};

type EditImagesContextType = {
  images: EditableImage[];
  currentIndex: number;
  addImages: (uris: string[]) => void;
  setCurrentIndex: (index: number) => void;
  updateImage: (id: string, patch: Partial<Omit<EditableImage, "id">>) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
  setImages: (images: EditableImage[]) => void;
};

const EditImagesContext = createContext<EditImagesContextType | undefined>(
  undefined,
);

export function EditImagesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [images, setImagesState] = useState<EditableImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const addImages = (uris: string[]) => {
    const newImages = uris.map((uri) => ({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      uri,
      rotation: 0,
      filter: "none" as ImageFilter,
      crop: { top: 0, left: 0, right: 0, bottom: 0 },
      key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    }));
    setImagesState((prev) => [...prev, ...newImages]);
    if (images.length === 0 && newImages.length > 0) setCurrentIndex(0);
  };

  const updateImage = (
    id: string,
    patch: Partial<Omit<EditableImage, "id">>,
  ) => {
    setImagesState((prev) =>
      prev.map((image) => (image.id === id ? { ...image, ...patch } : image)),
    );
  };

  const setImages = (newImages: EditableImage[]) => {
    setImagesState(newImages);
  };

  const removeImage = (id: string) => {
    setImagesState((prev) => {
      const next = prev.filter((image) => image.id !== id);
      setCurrentIndex((current) => {
        if (next.length === 0) return 0;
        const removedIndex = prev.findIndex((image) => image.id === id);
        if (removedIndex < current) return current - 1;
        return Math.min(current, next.length - 1);
      });
      return next;
    });
  };

  const clearImages = () => {
    setImagesState([]);
    setCurrentIndex(0);
  };

  return (
    <EditImagesContext.Provider
      value={{
        images,
        currentIndex,
        addImages,
        setCurrentIndex,
        updateImage,
        removeImage,
        clearImages,
        setImages,
      }}
    >
      {children}
    </EditImagesContext.Provider>
  );
}

export function useEditImages() {
  const context = useContext(EditImagesContext);
  if (!context)
    throw new Error("useEditImages must be used within EditImagesProvider");
  return context;
}
