/**
 * Generates and downloads a CSV file from an array of prediction records.
 * @param {Array} predictions - The array of prediction objects from the API.
 */
export const downloadHistoryCSV = (predictions) => {
  if (!predictions || predictions.length === 0) return;

  // Define columns/headers for the CSV file
  const headers = [
    'Date',
    'Age',
    'Pregnancies',
    'Glucose',
    'Blood Pressure',
    'Skin Thickness',
    'Insulin',
    'BMI',
    'Diabetes Pedigree Function',
    'Risk Score'
  ];

  // Map the dataset records to CSV row arrays
  const rows = predictions.map((record) => {
    const date = new Date(record.created_at).toLocaleString();
    const age = record.age;
    const pregnancies = record.pregnancies;

    // Helper to return 'N/A' if the field was imputed by KNN
    const getCsvValue = (fieldKey, originalValue) => {
      return record.imputed_fields?.includes(fieldKey) ? 'N/A' : originalValue;
    };

    const glucose = getCsvValue('glucose', record.glucose);
    const bp = getCsvValue('blood_pressure', record.blood_pressure);
    const skin = getCsvValue('skin_thickness', record.skin_thickness);
    const insulin = getCsvValue('insulin', record.insulin);
    const bmi = getCsvValue('bmi', record.bmi?.toFixed(1));
    const dpf = getCsvValue('diabetes_pedigree_function', record.diabetes_pedigree_function?.toFixed(3));
    const riskScore = `${(record.risk_score * 100).toFixed(1)}%`;

    return [date, age, pregnancies, glucose, bp, skin, insulin, bmi, dpf, riskScore];
  });

  // Combine headers and rows, wrapping values in quotes to handle any potential commas
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(value => `"${value}"`).join(','))
  ].join('\n');

  // Create a Blob with the CSV data and initialize a download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Set file name with current date stamp
  const dateStamp = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `diascore_history_${dateStamp}.csv`);
  link.style.visibility = 'hidden';
  
  // Append link to body, trigger programmatically, and then clean up
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};