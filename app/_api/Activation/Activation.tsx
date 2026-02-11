import FwaAxios from "../FwaAxios";

export const Activation = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/customer/activation",
      method: "POST",
      data: body,
    });

    return data;
  } catch (error) {
    throw error;
  }
};
