import React, { useState, useMemo } from 'react';
import { AnalysisResults, Finding, FindingType, RiskLevel, RiskReport } from '../types';
import { ApiKeyIcon, EndpointIcon, FCMKeyIcon, CopyIcon, CheckIcon, DownloadIcon, ListIcon, CodeIcon, ShieldIcon } from './icons';

interface ResultsDisplayProps {
  results: AnalysisResults;
  riskReport: RiskReport;
  onReset: () => void;
}

const findingTypeToIcon: Record<FindingType, React.FC<{className?: string}>> = {
  [FindingType.GOOGLE_API_KEY]: ApiKeyIcon,
  [FindingType.FIREBASE_KEY]: ApiKeyIcon,
  [FindingType.GENERIC_API_KEY]: ApiKeyIcon,
  [FindingType.FCM_SERVER_KEY]: FCMKeyIcon,
  [FindingType.FCM_SENDER_ID]: FCMKeyIcon,
  [FindingType.PRODUCTION_URL]: EndpointIcon,
  [FindingType.STAGING_URL]: EndpointIcon,
  [FindingType.DEV_URL]: EndpointIcon,
  [FindingType.ENDPOINT]: EndpointIcon,
  [FindingType.PASSWORD]: ShieldIcon,
  [FindingType.TOKEN]: ShieldIcon,
  [FindingType.JNI_FUNCTION]: CodeIcon,
  [FindingType.HARDCODED_STRING]: CodeIcon,
};

const findingTypeToColor: Record<FindingType, string> = {
  [FindingType.GOOGLE_API_KEY]: 'bg-red-500/20 text-red-300',
  [FindingType.FIREBASE_KEY]: 'bg-red-500/20 text-red-300',
  [FindingType.GENERIC_API_KEY]: 'bg-red-500/20 text-red-300',
  [FindingType.FCM_SERVER_KEY]: 'bg-yellow-500/20 text-yellow-300',
  [FindingType.FCM_SENDER_ID]: 'bg-yellow-500/20 text-yellow-300',
  [FindingType.PRODUCTION_URL]: 'bg-purple-500/20 text-purple-300',
  [FindingType.STAGING_URL]: 'bg-blue-500/20 text-blue-300',
  [FindingType.DEV_URL]: 'bg-green-500/20 text-green-300',
  [FindingType.ENDPOINT]: 'bg-green-500/20 text-green-300',
  [FindingType.PASSWORD]: 'bg-red-500/20 text-red-300',
  [FindingType.TOKEN]: 'bg-orange-500/20 text-orange-300',
  [FindingType.JNI_FUNCTION]: 'bg-gray-500/20 text-gray-300',
  [FindingType.HARDCODED_STRING]: 'bg-gray-500/20 text-gray-300',
};

const riskLevelToColor: Record<RiskLevel, { text: string; bg: string; ring: string }> = {
    'CRITICAL': { text: 'text-red-400', bg: 'bg-red-900/50', ring: 'ring-red-500' },
    'HIGH': { text: 'text-orange-400', bg: 'bg-orange-900/50', ring: 'ring-orange-500' },
    'MEDIUM': { text: 'text-yellow-400', bg: 'bg-yellow-900/50', ring: 'ring-yellow-500' },
    'LOW': { text: 'text-blue-400', bg: 'bg-blue-900/50', ring: 'ring-blue-500' },
    'INFO': { text: 'text-gray-400', bg: 'bg-gray-900/50', ring: 'ring-gray-500' },
};

const RiskBadge: React.FC<{ level: RiskLevel }> = ({ level }) => {
    const { text, bg, ring } = riskLevelToColor[level];
    return (
        <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${text} ${bg} ring-1 ring-inset ${ring}/30`}>
            {level}
        </span>
    );
};

const RiskMeter: React.FC<{ score: number; level: RiskLevel }> = ({ score, level }) => {
    const { text } = riskLevelToColor[level];
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative flex flex-col items-center justify-center">
            <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="52" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-border-color" transform="translate(0, 160) scale(1, -1)" />
                <circle
                    cx="80" cy="80" r="52"
                    stroke="currentColor" strokeWidth="10" fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`${text} transition-all duration-1000 ease-in-out`}
                    transform="translate(0, 160) scale(1, -1)"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className={`text-4xl font-bold ${text}`}>{score}</span>
                <span className={`text-sm font-semibold uppercase tracking-wider ${text}`}>{level}</span>
            </div>
        </div>
    );
};


const FindingItem: React.FC<{ finding: Finding }> = ({ finding }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(finding.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const Icon = findingTypeToIcon[finding.type];

  return (
    <div className="flex items-center justify-between p-3 bg-surface/50 rounded-md transition-colors hover:bg-surface">
      <div className="flex items-center gap-3 overflow-hidden">
        <Icon className="w-5 h-5 text-primary flex-shrink-0" />
        <code className="text-sm text-text-primary truncate" title={finding.value}>{finding.value}</code>
      </div>
      <button onClick={handleCopy} className="ml-4 p-1 rounded-md hover:bg-border-color transition-colors flex-shrink-0">
        {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5 text-text-secondary" />}
      </button>
    </div>
  );
};


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, riskReport, onReset }) => {
  const [activeTab, setActiveTab] = useState('All');

  const { allFindings, findingsByType, totalFindings, fileCount } = useMemo(() => {
    const allFindings: Finding[] = (Object.values(results) as Finding[][]).flat();
    const findingsByType = allFindings.reduce((acc, finding) => {
      if (!acc[finding.type]) {
        acc[finding.type] = [];
      }
      acc[finding.type].push(finding);
      return acc;
    }, {} as Record<string, Finding[]>);

    return {
      allFindings,
      findingsByType,
      totalFindings: allFindings.length,
      fileCount: Object.keys(results).length
    };
  }, [results]);

  const displayedFindings = useMemo(() => {
    if (activeTab === 'All') {
      return allFindings;
    }
    return allFindings.filter(finding => finding.type === activeTab);
  }, [activeTab, allFindings]);

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };

  const handleExport = (format: 'txt' | 'csv' | 'json') => {
    if (format === 'json') {
      const report = {
        analysis_summary: {
            file_names: Object.keys(results),
            analysis_date: new Date().toISOString(),
            risk_score: riskReport.score,
            risk_level: riskReport.level,
            total_findings: totalFindings
        },
        findings: allFindings.map(({ value, type, fileName, risk }) => ({ value, type, risk, file: fileName }))
      };
      downloadFile(JSON.stringify(report, null, 2), 'decompiler-report.json', 'application/json');
      return;
    }
    
    if (format === 'csv') {
      let csvContent = '"File Name","Finding Type","Risk Level","Value"\n';
      allFindings.forEach(({ fileName, type, risk, value }) => {
        const sanitizedValue = `"${value.replace(/"/g, '""')}"`;
        csvContent += `"${fileName}","${type}","${risk}",${sanitizedValue}\n`;
      });
      downloadFile(csvContent, 'decompiler-report.csv', 'text/csv;charset=utf-8');
      return;
    }

    if (format === 'txt') {
      let content = `Cyber Decompiler Analysis Report\n\n`;
      content += `Overall Risk Score: ${riskReport.score}/100 (${riskReport.level})\n`;
      content += `Total Findings: ${totalFindings}\n`;
      content += `Files Scanned: ${fileCount}\n\n`;

      Object.entries(results).forEach(([fileName, findingsInFile]) => {
        const findings = findingsInFile as Finding[];
        if (findings.length === 0) return;
        content += `========================================\n`;
        content += `File: ${fileName}\n`;
        content += `========================================\n\n`;
        
        findings.forEach(f => {
            content += `[${f.risk}] ${f.type}: ${f.value}\n`;
        });
        content += '\n';
      });
      downloadFile(content, 'decompiler-report.txt', 'text/plain;charset=utf-8');
    }
  };


  const tabs = ['All', ...Object.keys(findingsByType).sort()];
  
  if (totalFindings === 0) {
    return (
      <div className="w-full max-w-4xl text-center bg-surface p-8 rounded-lg">
        <h3 className="text-2xl font-bold text-text-primary mb-4">Analysis Complete</h3>
        <p className="text-text-secondary mb-6">No sensitive information was found in the selected files.</p>
        <button
          onClick={onReset}
          className="bg-primary text-brand-bg font-bold py-2 px-6 rounded-lg hover:bg-primary-hover transition-colors"
        >
          Scan Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl flex flex-col bg-surface rounded-xl shadow-2xl shadow-black/30 overflow-hidden">
      <header className="p-4 sm:p-6 border-b border-border-color flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex-1 flex gap-6 items-center">
            <RiskMeter score={riskReport.score} level={riskReport.level} />
            <div>
              <h2 className="text-xl font-bold text-text-primary">Analysis Report</h2>
              <p className="text-sm text-text-secondary">{totalFindings} potential findings in {fileCount} file(s)</p>
            </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto self-start md:self-center">
          <div className="flex gap-2">
            <button onClick={() => handleExport('txt')} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent border border-secondary text-secondary font-bold py-2 px-4 rounded-lg hover:bg-secondary/20 transition-colors text-sm" title="Export as TXT"><DownloadIcon className="w-4 h-4" /><span>TXT</span></button>
            <button onClick={() => handleExport('csv')} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent border border-secondary text-secondary font-bold py-2 px-4 rounded-lg hover:bg-secondary/20 transition-colors text-sm" title="Export as CSV"><DownloadIcon className="w-4 h-4" /><span>CSV</span></button>
            <button onClick={() => handleExport('json')} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent border border-secondary text-secondary font-bold py-2 px-4 rounded-lg hover:bg-secondary/20 transition-colors text-sm" title="Export as JSON"><DownloadIcon className="w-4 h-4" /><span>JSON</span></button>
          </div>
          <button
            onClick={onReset}
            className="w-full sm:w-auto bg-primary/90 text-brand-bg font-bold py-2 px-4 rounded-lg hover:bg-primary transition-colors text-sm"
          >
            Start New Scan
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-grow min-h-[60vh]">
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border-color p-4">
          <h3 className="text-xs uppercase font-semibold text-text-secondary mb-3 px-2">Categories</h3>
          <nav className="flex flex-row flex-nowrap md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            {tabs.map(tab => {
              const isAllTab = tab === 'All';
              const Icon = isAllTab ? ListIcon : findingTypeToIcon[tab as FindingType];
              const count = isAllTab ? totalFindings : findingsByType[tab]?.length || 0;
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left text-sm font-medium p-2.5 rounded-lg transition-all duration-200 flex items-center justify-between flex-shrink-0 md:flex-shrink group
                    ${isActive 
                      ? 'bg-primary/20 text-primary shadow-inner shadow-primary/10' 
                      : 'text-text-secondary hover:bg-border-color/50 hover:text-text-primary'}`
                  }
                >
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-text-secondary/80 group-hover:text-text-primary'}`} />}
                    <span className="whitespace-nowrap">{tab}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full transition-colors ${isActive ? 'bg-primary text-brand-bg font-semibold' : 'bg-border-color text-text-secondary'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {displayedFindings.length > 0 ? (
                 <div className="space-y-4">
                    {displayedFindings.map((finding, index) => (
                      <div key={index} className="bg-brand-bg p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                           <div className='flex items-center gap-2'>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${findingTypeToColor[finding.type]}`}>{finding.type}</span>
                                <RiskBadge level={finding.risk} />
                           </div>
                           <span className="text-xs text-text-secondary truncate ml-4" title={finding.fileName}>{finding.fileName}</span>
                        </div>
                        <FindingItem finding={finding} />
                      </div>
                    ))}
                 </div>
            ) : (
                <div className="flex items-center justify-center h-full text-text-secondary">
                    <p>No findings in this category.</p>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};
