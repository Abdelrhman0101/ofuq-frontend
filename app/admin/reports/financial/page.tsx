'use client';

import React from 'react';
import FinancialReportsTable from '../../../../components/FinancialReportsTable';
import '../../../../styles/financial-reports.css';

const FinancialReportsPage = () => {
  return (
    <div className="financial-reports-page">
      <FinancialReportsTable />
    </div>
  );
};

export default FinancialReportsPage;