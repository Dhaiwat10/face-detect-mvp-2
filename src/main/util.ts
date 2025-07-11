/* eslint import/prefer-default-export: off */
import { BrowserWindow } from 'electron';
import { URL } from 'url';
import path from 'path';
import * as faceapi from '@vladmandic/face-api/dist/face-api.node.js';
import * as canvas from 'canvas';
import getDb from './database';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export const processImages = async (
  mainWindow: BrowserWindow,
  filePaths: string[],
) => {
  const db = getDb();
  const knownFaces = db.prepare('SELECT id, descriptor FROM persons').all() as {
    id: number;
    descriptor: string;
  }[];
  const labeledFaceDescriptors = knownFaces.map((face) => {
    const descriptor = new Float32Array(JSON.parse(face.descriptor));
    return new faceapi.LabeledFaceDescriptors(face.id.toString(), [descriptor]);
  });
  let faceMatcher: faceapi.FaceMatcher | null =
    labeledFaceDescriptors.length > 0
      ? new faceapi.FaceMatcher(labeledFaceDescriptors)
      : null;

  const insertImageStmt = db.prepare(
    'INSERT OR IGNORE INTO images (path) VALUES (?)',
  );
  const insertPersonStmt = db.prepare(
    'INSERT INTO persons (descriptor) VALUES (?)',
  );
  const insertDetectionStmt = db.prepare(
    'INSERT INTO detections (person_id, image_id, box_x, box_y, box_width, box_height) VALUES (?, ?, ?, ?, ?, ?)',
  );
  const selectImageStmt = db.prepare('SELECT id FROM images WHERE path = ?');

  const imageFiles = filePaths;
  const detectionOptions = new faceapi.SsdMobilenetv1Options({
    minConfidence: 0.3,
  });

  await imageFiles.reduce(async (promise, imageFile) => {
    await promise;
    const imagePath = imageFile;
    mainWindow.webContents.send('update-results', `Processing ${imagePath}...`);

    const existingImage = selectImageStmt.get(imagePath);
    if (existingImage) {
      console.log(`Image ${imagePath} already indexed. Skipping.`);
      return;
    }

    const img = await canvas.loadImage(imagePath);
    const results = await faceapi
      .detectAllFaces(img as any, detectionOptions)
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (!results.length) return;

    const imageId = insertImageStmt.run(imagePath).lastInsertRowid;
    results.forEach((result) => {
      const bestMatch = faceMatcher
        ? faceMatcher.findBestMatch(result.descriptor)
        : { label: 'unknown', distance: 1.0 };
      let personId: number | bigint;
      if (bestMatch.label !== 'unknown' && bestMatch.distance < 0.55) {
        personId = parseInt(bestMatch.label, 10);
      } else {
        const descriptor = JSON.stringify(Array.from(result.descriptor));
        const newPerson = insertPersonStmt.run(descriptor);
        personId = newPerson.lastInsertRowid;
        labeledFaceDescriptors.push(
          new faceapi.LabeledFaceDescriptors(personId.toString(), [
            result.descriptor,
          ]),
        );
        faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);
      }
      const { x, y, width, height } = result.detection.box;
      insertDetectionStmt.run(personId, imageId, x, y, width, height);
    });
    console.log(`Indexed ${results.length} faces from ${imagePath}`);
  }, Promise.resolve());
};

export const getAllIndexedFaces = async () => {
  const db = getDb();
  const knownFaces = db.prepare('SELECT id, descriptor FROM persons').all() as {
    id: number;
    descriptor: string;
  }[];
  return knownFaces;
};
