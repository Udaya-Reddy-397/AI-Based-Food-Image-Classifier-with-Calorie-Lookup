const CLASS_NAMES = [
  "Chicken Curry", // 0
  "Omelette", // 1
  "Palak Paneer", // 2
  "Appam", // 3
  "Avial", // 4
  "Banana Chips", // 5
  "Chapati / Roti", // 6
  "Chocolate Cake", // 7
  "Fruit Salad", // 8
  "Idli", // 9
  "Kulfi", // 10
  "Marble Cake", // 11
  "Masala Dosa", // 12
  "Masala Vada", // 13
  "Mutton Biryani", // 14
  "Pancake", // 15
  "Sambar", // 16
  "Uttapam", // 17
  "Lemonade", // 18
  "Puttu", // 19
];

// 640x640 is standard YOLOv8 size
const MODEL_SIZE = 640;

export async function detectFood(imageElement: HTMLImageElement): Promise<{ name: string; count: number }[]> {
  try {
    // 1. Load model with WASM provider (dynamically import to prevent page crash on Vercel)
    const ort = await import('onnxruntime-web');
    ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';
    const session = await ort.InferenceSession.create('/best.onnx', { executionProviders: ['wasm'] });

    // 2. Preprocess image (draw to 640x640 canvas and extract RGB)
    const canvas = document.createElement('canvas');
    canvas.width = MODEL_SIZE;
    canvas.height = MODEL_SIZE;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error("Could not get canvas context");
    
    ctx.drawImage(imageElement, 0, 0, MODEL_SIZE, MODEL_SIZE);
    const imgData = ctx.getImageData(0, 0, MODEL_SIZE, MODEL_SIZE).data;
    
    // YOLOv8 format: float32 array, shape [1, 3, 640, 640], RGB, normalized to 0-1
    const float32Data = new Float32Array(3 * MODEL_SIZE * MODEL_SIZE);
    
    for (let i = 0; i < MODEL_SIZE * MODEL_SIZE; i++) {
      float32Data[i] = imgData[i * 4] / 255.0; // R
      float32Data[MODEL_SIZE * MODEL_SIZE + i] = imgData[i * 4 + 1] / 255.0; // G
      float32Data[2 * MODEL_SIZE * MODEL_SIZE + i] = imgData[i * 4 + 2] / 255.0; // B
    }

    const tensor = new ort.Tensor('float32', float32Data, [1, 3, MODEL_SIZE, MODEL_SIZE]);

    // 3. Run Inference
    const results = await session.run({ images: tensor });
    const output = results.output0.data as Float32Array; // shape [1, 24, 8400]

    // 4. Post-process (NMS)
    const boxes = [];
    const numClasses = CLASS_NAMES.length;
    const numBoxes = 8400; // 8400 boxes for 640x640 YOLOv8

    for (let i = 0; i < numBoxes; i++) {
      let maxProb = 0;
      let classId = -1;

      // Find class with highest probability
      for (let j = 0; j < numClasses; j++) {
        const prob = output[(4 + j) * numBoxes + i];
        if (prob > maxProb) {
          maxProb = prob;
          classId = j;
        }
      }

      if (maxProb > 0.4) { // Confidence threshold (adjustable)
        const xc = output[0 * numBoxes + i];
        const yc = output[1 * numBoxes + i];
        const w = output[2 * numBoxes + i];
        const h = output[3 * numBoxes + i];

        boxes.push({
          x1: xc - w / 2,
          y1: yc - h / 2,
          x2: xc + w / 2,
          y2: yc + h / 2,
          score: maxProb,
          classId: classId
        });
      }
    }

    // NMS (Non-Maximum Suppression)
    boxes.sort((a, b) => b.score - a.score);
    const finalBoxes = [];
    
    for (let i = 0; i < boxes.length; i++) {
      let keep = true;
      for (let j = 0; j < finalBoxes.length; j++) {
        if (boxes[i].classId === finalBoxes[j].classId) {
          const iou = calculateIoU(boxes[i], finalBoxes[j]);
          if (iou > 0.45) { // Overlap threshold
            keep = false;
            break;
          }
        }
      }
      if (keep) {
        finalBoxes.push(boxes[i]);
      }
    }

    // 5. Aggregate counts
    const foodCounts: Record<string, number> = {};
    for (const box of finalBoxes) {
      const name = CLASS_NAMES[box.classId];
      foodCounts[name] = (foodCounts[name] || 0) + 1;
    }

    return Object.entries(foodCounts).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count
    }));

  } catch (err) {
    console.error("YOLO Inference error:", err);
    return [];
  }
}

function calculateIoU(box1: any, box2: any) {
  const x1 = Math.max(box1.x1, box2.x1);
  const y1 = Math.max(box1.y1, box2.y1);
  const x2 = Math.min(box1.x2, box2.x2);
  const y2 = Math.min(box1.y2, box2.y2);

  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const area1 = (box1.x2 - box1.x1) * (box1.y2 - box1.y1);
  const area2 = (box2.x2 - box2.x1) * (box2.y2 - box2.y1);

  if (intersection === 0) return 0;
  return intersection / (area1 + area2 - intersection);
}
