# Face Detection MVP

A desktop application built with Electron and React for detecting and indexing faces from images.

## Features

- Select one or more images from your file system.
- Detects all faces in the selected images using `@vladmandic/face-api`.
- Each unique face is stored as a "person" in a local database.
- Detections are linked to a person and the image they appeared in.
- Previously processed images are skipped.

## Tech Stack

- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [@vladmandic/face-api](https://github.com/vladmandic/face-api) for face detection.
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) for the database.
- Built on top of [Electron React Boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate).

## Prerequisites

### Native Dependencies (macOS)

This project relies on `node-canvas`, which has native dependencies. If you are on macOS, you will need to install them using [Homebrew](https://brew.sh/).

```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

For other operating systems, please refer to the `node-canvas` documentation for the required dependencies.

### Face-API Models

This project requires pre-trained models from `face-api.js` to perform face detection. You need to download them and place them in the correct directory.

1.  **Download the models:** You can download the necessary models from the original `face-api.js` repository. You can clone the repository or download the files directly. The models you need are:
    - `ssd_mobilenetv1_model-weights_manifest.json` and associated shards.
    - `face_landmark_68_model-weights_manifest.json` and associated shards.
    - `face_recognition_model-weights_manifest.json` and associated shards.

    You can find them here: [https://github.com/justadudewhohacks/face-api.js/tree/master/weights](https://github.com/justadudewhohacks/face-api.js/tree/master/weights)

2.  **Create the models directory:** Create a `models` directory inside the `src` directory:
    ```bash
    mkdir src/models
    ```

3.  **Copy the models:** Copy the downloaded model files (the `.json` and the `.weights` files) into the `src/models` directory.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd face-detect-mvp-2
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the application:**
    ```bash
    npm start
    ```

## Building the Application

To create a distributable package for your operating system, run:

```bash
npm run package
```

The packaged application will be located in the `release/build` directory.

## Database

The application uses a SQLite database to store information about indexed images, persons (unique faces), and detections.

-   **Database file:** `faces.db`
-   **Location:** The database file is stored in the user data directory for the application. The application name is `FaceDetectMVP`.
    -   **macOS:** `~/Library/Application Support/FaceDetectMVP/data/faces.db`
    -   **Windows:** `%APPDATA%\\FaceDetectMVP\\data\\faces.db`
    -   **Linux:** `~/.config/FaceDetectMVP/data/faces.db`

**Note:** The database is cleared and re-initialized every time the application starts. You can change this behavior in `src/main/main.ts`.
