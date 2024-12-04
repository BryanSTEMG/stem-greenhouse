// src/utils/mondayUtils.ts

interface CreateMondayTaskParams {
  formData: {
    name: string;
    email: string;
    suppliesNeeded: string;
    quantity: number;
    neededBy: string;
    supplyLink?: string;
    additionalInfo?: string;
    fileName?: string | null;
  };
  boardId: string;
  groupId: string;
  formType: string;
  file?: File | undefined;
}

export async function createMondayTask(params: CreateMondayTaskParams): Promise<void> {
  const { formData, boardId, groupId, formType, file } = params;

  try {
    const form = new FormData();
    form.append("formData", JSON.stringify(formData));
    form.append("boardId", boardId);
    form.append("groupId", groupId);
    form.append("formType", formType);

    if (file) {
      form.append("file", file);
      console.log(`Appending file: ${file.name}`);
    }

    // Determine API Base URL based on environment
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    console.log("API Base URL:", API_BASE_URL);

    const response = await fetch(`${API_BASE_URL}/createMondayTask`, {
      method: "POST",
      body: form,
      // Do NOT set the 'Content-Type' header manually when using FormData
    });

    if (!response.ok) {
      let errorText = await response.text(); // Get the response as text
      console.error('Non-OK response:', errorText);
      try {
        // Try to parse as JSON
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || 'Failed to create task');
      } catch (e) {
        // If parsing fails, throw the raw error text
        throw new Error(errorText);
      }
    }

    const data = await response.json();
    console.log(data.message);
  } catch (error: any) {
    console.error("Error:", error.message);
    throw error;
  }
}
