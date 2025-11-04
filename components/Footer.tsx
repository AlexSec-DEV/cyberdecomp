
import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="w-full text-center py-4 mt-8 border-t border-border-color">
            <p className="text-xs text-text-secondary">
                This is an educational tool. Analysis is based on pattern matching and may produce false positives. Always verify findings.
            </p>
        </footer>
    );
};
