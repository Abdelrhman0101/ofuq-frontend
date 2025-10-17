'use client';

import React from 'react';
import VisitsReportsTable from '../../../../components/VisitsReportsTable';
import '../../../../styles/visits-reports.css';

const VisitsReportsPage = () => {
  return (
    <div className="visits-reports-page">
      <VisitsReportsTable />
    </div>
  );
};

export default VisitsReportsPage;