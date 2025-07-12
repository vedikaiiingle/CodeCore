import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiCode, FiPlay, FiCopy, FiDownload } from 'react-icons/fi';

const CodeGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState('javascript');
  const [fileName, setFileName] = useState('generated-code');

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'react', label: 'React' },
    { value: 'node', label: 'Node.js' }
  ];

  const generateCode = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    setIsGenerating(true);
    setProgress(0);
    setGeneratedCode('');
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const sampleCode = generateSampleCode(prompt, language);
      setGeneratedCode(sampleCode);
      setProgress(100);
      toast.success('Code generated successfully!');
    } catch (error) {
      toast.error('Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSampleCode = (prompt, lang) => {
    const codeSamples = {
      javascript: `// Generated JavaScript Code\n// Prompt: ${prompt}\n\nfunction generatedFunction() {\n  console.log("Hello from generated code!");\n  // Your logic here\n  const result = processData();\n  return result;\n}\n\nfunction processData() {\n  // Implementation based on your prompt\n  return "Processed data";\n}\n\nconst output = generatedFunction();\nconsole.log(output);`,
      python: `# Generated Python Code\n# Prompt: ${prompt}\n\ndef generated_function():\n    print("Hello from generated code!")\n    # Your logic here\n    result = process_data()\n    return result\n\ndef process_data():\n    # Implementation based on your prompt\n    return "Processed data"\n\nif __name__ == "__main__":\n    output = generated_function()\n    print(output)`,
      react: `// Generated React Component\n// Prompt: ${prompt}\n\nimport React, { useState, useEffect } from 'react';\n\nconst GeneratedComponent = () => {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(false);\n\n  useEffect(() => {\n    fetchData();\n  }, []);\n\n  const fetchData = async () => {\n    setLoading(true);\n    try {\n      const response = await fetch('/api/data');\n      const result = await response.json();\n      setData(result);\n    } catch (error) {\n      console.error('Error fetching data:', error);\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  return (\n    <div className="generated-component">\n      <h2>Generated Component</h2>\n      {loading ? (<p>Loading...</p>) : (<div><p>Data: {JSON.stringify(data)}</p></div>)}\n    </div>\n  );\n};\n\nexport default GeneratedComponent;`,
      html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Generated HTML</title>\n    <style>\n        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }\n        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <h1>Generated HTML Page</h1>\n        <p>This page was generated based on your prompt: ${prompt}</p>\n        <div id="content">\n            <h2>Content Section</h2>\n            <p>Add your content here...</p>\n        </div>\n    </div>\n</body>\n</html>`
    };
    return codeSamples[lang] || codeSamples.javascript;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success('Code copied to clipboard!');
  };

  const downloadCode = () => {
    const extension = language === 'html' ? 'html' : 
                     language === 'css' ? 'css' : 
                     language === 'python' ? 'py' : 
                     language === 'java' ? 'java' : 
                     language === 'cpp' ? 'cpp' : 'js';
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Code downloaded!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <FiCode className="mr-3 text-blue-600" />
            Code Generator
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programming Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe what you want to generate
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the code you want to generate... (e.g., 'Create a function to calculate factorial', 'Build a React component for a todo list')"
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Name (optional)
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="generated-code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={generateCode}
                disabled={isGenerating}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Code...
                  </>
                ) : (
                  <>
                    <FiPlay className="mr-2" />
                    Generate Code
                  </>
                )}
              </button>
              {/* Progress Bar */}
              {isGenerating && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Generating...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            {/* Output Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Generated Code</h3>
                {generatedCode && (
                  <div className="flex space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      <FiCopy className="mr-1" />
                      Copy
                    </button>
                    <button
                      onClick={downloadCode}
                      className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      <FiDownload className="mr-1" />
                      Download
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-auto">
                {generatedCode ? (
                  <pre className="text-green-400 text-sm">
                    <code>{generatedCode}</code>
                  </pre>
                ) : (
                  <div className="text-gray-500 text-center py-20">
                    <FiCode className="mx-auto text-4xl mb-4 opacity-50" />
                    <p>Generated code will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* How it works section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">1</div>
              <h3 className="font-semibold mb-2">Describe</h3>
              <p className="text-sm text-gray-600">Tell us what code you want to generate</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">2</div>
              <h3 className="font-semibold mb-2">Generate</h3>
              <p className="text-sm text-gray-600">Watch as your code is generated in real-time</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">3</div>
              <h3 className="font-semibold mb-2">Use</h3>
              <p className="text-sm text-gray-600">Copy, download, or integrate the code</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeGenerator; 