import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

const DataTable = ({ data }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Data Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {Object.keys(data[0] || {}).map((header) => (
                  <th key={header} className="px-4 py-2 text-left">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b">
                  {Object.values(row).map((value, j) => (
                    <td key={j} className="px-4 py-2">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataTable;