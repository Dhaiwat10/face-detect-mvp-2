import React, { useState } from 'react';

function App() {
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [jsonResponse, setJsonResponse] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [message, setMessage] = useState<string>(
    'Select images and click "Process" to see the result.',
  );

  const handleSelectClick = async () => {
    const paths = await window.electron.ipcRenderer.openFileDialog();
    setSelectedPaths(paths);
    setJsonResponse(''); // Clear previous results
    if (paths && paths.length > 0) {
      setMessage(`${paths.length} file(s) selected.`);
    } else {
      setMessage('Select images and click "Process" to see the result.');
    }
  };

  const handleProcessClick = async () => {
    if (selectedPaths.length > 0) {
      setProcessing(true);
      setMessage('Processing...');

      const response =
        await window.electron.ipcRenderer.processImages(selectedPaths);

      // Display the JSON response prettily
      setJsonResponse(JSON.stringify(response, null, 2));

      if (response.success) {
        setMessage('Processing complete!');
      } else {
        setMessage(`An error occurred: ${response.error}`);
      }
      setProcessing(false);
    } else {
      setMessage('Please select one or more image files first.');
    }
  };

  return (
    <div>
      <h1>Electron Image Processor</h1>
      <p>{message}</p>

      <button type="button" onClick={handleSelectClick}>
        Select Images
      </button>

      <button
        type="button"
        onClick={handleProcessClick}
        disabled={processing || selectedPaths.length === 0}
      >
        {processing ? 'Processing...' : 'Process Images'}
      </button>

      {jsonResponse && <pre>{jsonResponse}</pre>}
    </div>
  );
}

export default App;
