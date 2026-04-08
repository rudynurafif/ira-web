"use client";

import Image, { ImageProps } from "next/image";
import React, { useEffect, useState } from "react";
import { convertOBSUrl } from "@/app/_api/OBS/OBS";

interface SecureImageProps extends Omit<ImageProps, "src"> {
  obsPath: string | undefined;
}

const SecureImage = ({ obsPath, alt, ...props }: SecureImageProps) => {
  const [secureUrl, setSecureUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSecureUrl = async () => {
      if (!obsPath) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const url = await convertOBSUrl(obsPath);
      if (url) {
        // Gabungkan Domain Storage dengan Path/Signature dari API
        const finalUrl = `${process.env.NEXT_PUBLIC_OBS_STORAGE_URL}${url}`;
        setSecureUrl(finalUrl);
      }
      setLoading(false);
    };

    fetchSecureUrl();
  }, [obsPath]);

  if (loading) {
    return (
      <div
        style={{ width: props.width, height: props.height }}
        className="bg-gray-200 animate-pulse rounded-lg"
      />
    );
  }

  if (!secureUrl) return null;

  return <Image {...props} src={secureUrl} alt={alt || "OBS Image"} />;
};

export default SecureImage;
