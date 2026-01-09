import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { useAuthContext } from 'context/useAuthContext';
import { apiRoutes } from 'config';

const MonthlyBarChart = ({ onTotalChange }) => {
  const theme = useTheme();
  const { user } = useAuthContext();

  const { secondary } = theme.palette.text;
  const primaryMain = theme.palette.primary.light;

  // State for chart data
  const [series, setSeries] = useState([{ data: [] }]);
  const [options, setOptions] = useState({
    chart: {
      type: 'bar',
      height: 400,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        columnWidth: '45%',
        borderRadius: 4
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: [], // dynamic categories (course names)
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: [] }
      }
    },
    yaxis: { show: false },
    grid: { show: false },
    tooltip: { theme: 'light' }
  });

  useEffect(() => {
    // Update colors and labels styles when theme changes
    setOptions((prevState) => ({
      ...prevState,
      colors: [primaryMain],
      xaxis: {
        ...prevState.xaxis,
        labels: {
          style: {
            colors: prevState.xaxis.categories.map(() => secondary)
          }
        }
      }
    }));
  }, [primaryMain, secondary]);

  useEffect(() => {
    async function fetchRegistrations() {
      try {
        const res = await fetch(apiRoutes.statRoute + 'enrollments', {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include' // Cookies are sent automatically
        });
        const json = await res.json();

        if (json.success && json.data) {
          const { courseEnrollments } = json.data;
          const { totalEnrollments } = json.data;
          // Call the callback to pass the total up
          if (onTotalChange) {
            onTotalChange(totalEnrollments);
          }
          const categories = courseEnrollments.map((item) => item.courseName);
          const data = courseEnrollments.map((item) => item.registrations);

          setSeries([{ data }]);
          setOptions((prev) => ({
            ...prev,
            xaxis: {
              ...prev.xaxis,
              categories,
              labels: {
                style: {
                  colors: categories.map(() => secondary)
                }
              }
            }
          }));
        }
      } catch (error) {
        console.error('Failed to fetch registrations:', error);
      }
    }

    if (user) fetchRegistrations();
  }, [user, secondary, onTotalChange]);

  return (
    <div id="chart">
      <ReactApexChart options={options} series={series} type="bar" height={365} />
    </div>
  );
};

export default MonthlyBarChart;
