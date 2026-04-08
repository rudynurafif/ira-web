import axios from "axios";

export const convertOBSUrl = async (obsUrl: string) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/obs/convert", // Menembak proxy internal kita
      data: {
        url: obsUrl,
      },
    });

    return res?.data?.data || res?.data;
  } catch (error) {
    console.error("Error converting OBS URL via Proxy:", error);
    return null;
  }
};
