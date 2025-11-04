import React, { useState, useCallback } from 'react';
import { FileUploader } from './components/FileUploader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Spinner } from './components/Spinner';
import { AnalysisResults, RiskReport } from './types';
import { analyzeFile } from './services/analyzer';
import { calculateRiskScore } from './services/riskAnalyzer';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

function App() {
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [riskReport, setRiskReport] = useState<RiskReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [processedFileCount, setProcessedFileCount] = useState(0);
  const [totalFileCount, setTotalFileCount] = useState(0);

  const handleFiles = useCallback(async (files: FileList) => {
    if (files.length > 15) {
      setError("You can select a maximum of 15 files at a time.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);
    setRiskReport(null);
    setProcessedFileCount(0);
    setTotalFileCount(files.length);

    const analysisPromises = Array.from(files).map(file =>
      analyzeFile(file).then(findings => {
        setProcessedFileCount(prev => prev + 1);
        return { fileName: file.name, findings };
      })
    );

    try {
      const allFileResults = await Promise.all(analysisPromises);
      
      const newResults: AnalysisResults = {};
      allFileResults.forEach(({ fileName, findings }) => {
        if (findings.length > 0) {
          newResults[fileName] = findings;
        }
      });
      
      const allFindings = Object.values(newResults).flat();
      const report = calculateRiskScore(allFindings);
      setRiskReport(report);
      setResults(newResults);

    } catch (err) {
      setError("An error occurred during file analysis. Some files might be unreadable.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = () => {
    setResults(null);
    setRiskReport(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8 bg-brand-bg font-sans">
      <div className="w-full max-w-7xl mx-auto flex flex-col flex-grow">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center text-center py-10">
          {!results && !isLoading && (
            <>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
                Secure, Offline Code Analysis
              </h2>
              <p className="max-w-2xl text-text-secondary mb-8">
                Select up to 15 files to scan for sensitive data like API keys, credentials, and endpoints. All processing is done in your browser.
              </p>
            </>
          )}

          {error && <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>}

          {isLoading ? (
            <div className='flex flex-col items-center justify-center space-y-4'>
              <Spinner />
              <p className='text-text-secondary'>Analyzing files... ({processedFileCount}/{totalFileCount})</p>
            </div>
          ) : results && riskReport ? (
            <ResultsDisplay results={results} riskReport={riskReport} onReset={handleReset} />
          ) : !isLoading ? ( // Handle case where analysis is done but no results
            results !== null ? (
               <ResultsDisplay results={{}} riskReport={{score: 0, level: 'INFO'}} onReset={handleReset} />
            ) : (
               <FileUploader onFilesSelected={handleFiles} />
            )
          ) : null}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
