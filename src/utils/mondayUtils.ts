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
    }

    console.log("API Base URL:", process.env.REACT_APP_API_BASE_URL);

    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/createMondayTask`, {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      let errorText = await response.text(); // Get the response as text
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
