import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
  }[];
}

const defaultChartData: ChartData = {
  labels: [],
  datasets: []
};

export const ImportPage: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData>(defaultChartData);
  const [rawData, setRawData] = useState<any[]>([]);
  const [granularity, setGranularity] = useState<number>(0);

  useEffect(() => {
    processData(rawData); // Process data when rawData or granularity changes
  }, [rawData, granularity]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      Papa.parse(files[0], {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          setRawData(results.data);
        }
      });
    }
  };

  const processData = (data: any[]) => {
    const interval = granularity === 0 ? 1 : granularity; // Every X seconds
    const filteredData = data.filter((_, index) => index % interval === 0);
    const labels = filteredData.map((d: any) => d.Time); // Adjust based on your CSV time column
    const cpuUsage = filteredData.map((d: any) => d['Total CPU Usage [%]']);
    const cpuTemp = filteredData.map((d: any) => d['CPU Package [�C]']);
    const gpuLoad = filteredData.map((d: any) => d['GPU Core Load [%]']);
    const gpuTemp = filteredData.map((d: any) => d['GPU Temperature [�C]']);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Total CPU Usage (%)',
          data: cpuUsage,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          fill: true,
        },
        {
          label: 'CPU Package Temperature (°C)',
          data: cpuTemp,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          fill: true,
        },
        {
          label: 'GPU Core Load (%)',
          data: gpuLoad,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          fill: true,
        },
        {
          label: 'GPU Temperature (°C)',
          data: gpuTemp,
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          fill: true,
        }
      ]
    });
  };

  return (
    <div>
      <h1>Import HWiNFO CSV Data</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <div>
        <label>
          Data Granularity: {granularity} seconds
          <input
            type="range"
            min="0"
            max="60"
            step="10"
            value={granularity}
            onChange={(e) => setGranularity(parseInt(e.target.value, 10))}
            onMouseUp={() => processData(rawData)}
            onTouchEnd={() => processData(rawData)}
          />
        </label>
      </div>
      <div>
        <Line data={chartData} />
      </div>
    </div>
  );
};

export default ImportPage;
