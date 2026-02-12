/**
 * Converts an array of objects to CSV format
 */
export const convertToCSV = (data: Record<string, any>[]): string => {
    if (data.length === 0) return '';

    // Get headers from the first object
    const headers = Object.keys(data[0]);

    // Helper function to properly quote and escape CSV fields
    const escapeField = (value: any): string => {
        if (value === null || value === undefined) return '';
        const strValue = String(value);
        // Quote fields that contain semicolons, quotes, or newlines
        if (strValue.includes(';') || strValue.includes('"') || strValue.includes('\n')) {
            return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
    };

    // Create header row with quoted fields using semicolon delimiter
    const headerRow = headers.map(h => escapeField(h)).join(';');

    // Create data rows using semicolon delimiter
    const dataRows = data.map(row => {
        return headers.map(header => escapeField(row[header])).join(';');
    });

    // Add UTF-8 BOM for proper Excel encoding
    return '\uFEFF' + [headerRow, ...dataRows].join('\n');
};

/**
 * Triggers a browser download of CSV data
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

/**
 * Export data to CSV file
 */
export const exportToCSV = (data: Record<string, any>[], filename: string): void => {
    const csvContent = convertToCSV(data);
    downloadCSV(csvContent, filename);
};
