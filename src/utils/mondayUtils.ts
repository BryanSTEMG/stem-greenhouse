// src/utils/mondayUtils.ts

/**
 * Shape of the data we send to Lambda / Monday.
 * - `suppliesNeeded` is REQUIRED for supply orders but OPTIONAL for copy orders.
 * - New fields `school` and `blackWhiteOk` are optional so either form can pass them.
 */
interface CreateMondayTaskParams {
  formData: {
    name: string;
    email: string;

    // Optional because the copy‑order form no longer has this field
    suppliesNeeded?: string;

    quantity: number;
    neededBy: string;

    // NEW optional fields
    school?: string;          // “Aquinas” | “GRCC”
    blackWhiteOk?: boolean;   // only for copy orders

    // Shared optional fields
    supplyLink?: string;
    additionalInfo?: string;
  };
  boardId: string;
  groupId: string;
  formType: string;   // 'Supply' | 'Copy'
  file?: File;        // optional file upload (only copy orders now)
}

export async function createMondayTask(
  params: CreateMondayTaskParams
): Promise<void> {
  const { formData, boardId, groupId, formType, file } = params;

  let fileContentBase64: string | null = null;
  let fileName: string | null = null;

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

  // URL of your Netlify (or other) backend that fronts the Lambda
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const response = await fetch(`${API_BASE_URL}/createMondayTask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const json = JSON.parse(text);
      throw new Error(json.error || 'Failed to create task');
    } catch {
      throw new Error(text);
    }
  }

  // You can inspect the returned message if needed
  const data = await response.json();
  console.log('Task creation response:', data);
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
