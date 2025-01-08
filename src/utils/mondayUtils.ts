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
  };
  boardId: string;
  groupId: string;
  formType: string;
  file?: File;
}

export async function createMondayTask(params: CreateMondayTaskParams): Promise<void> {
  const { formData, boardId, groupId, formType, file } = params;

  try {
    let fileContentBase64 = null;
    let fileName = null;

    if (file) {
      fileContentBase64 = await readFileAsBase64(file);
      fileName = file.name;
    }

    const payload = {
      formData,
      boardId,
      groupId,
      formType,
      fileContentBase64,
      fileName,
    };

    //update in netlify
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    console.log("API Base URL:", API_BASE_URL);
    console.log("Payload:", payload);

    const response = await fetch(`${API_BASE_URL}/createMondayTask`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log("Response Status:", response.status);

    if (!response.ok) {
      let errorText = await response.text(); 
      console.error('Non-OK response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || 'Failed to create task');
      } catch (e) {
        throw new Error(errorText);
      }
    }

    const data = await response.json();
    console.log("Task creation response message:", data.message);
  } catch (error: any) {
    console.error("Error creating Monday task:", error.message);
    throw error;
  }
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
