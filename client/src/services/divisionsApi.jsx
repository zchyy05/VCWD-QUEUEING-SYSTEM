import axios from "axios";

const api_url = import.meta.env.VITE_API_URL;

const handleError = (error) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || "An error occurred";
    throw new Error(message);
  }
  throw error instanceof Error ? error : new Error("An unknown error occurred");
};

export const getAllDivisions = async () => {
  try {
    const response = await axios.get(`${api_url}/division/get-division`);
    return response.data.divisions;
  } catch (error) {
    handleError(error);
  }
};
