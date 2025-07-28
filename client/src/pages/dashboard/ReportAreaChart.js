import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { useAuthContext } from 'context/useAuthContext';
import { apiRoutes } from 'config';

const ReportAreaChart = ({ onStatsChange }) => {
  const theme = useTheme();
  const { user } = useAuthContext();
  const { secondary } = theme.palette.text;
  const line = theme.palette.divider;

  const [options, setOptions] = useState({
    chart: {
      height: 340,
      type: 'line',
      toolbar: { show: false }
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 1.5
    },
    grid: { strokeDashArray: 4 },
    xaxis: {
      categories: [],
      labels: {
        style: {
          colors: []
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: { show: true },
    tooltip: {
      theme: 'light'
    }
  });

  const [series, setSeries] = useState([
    {
      name: 'Student Registrations',
      data: []
    }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(apiRoutes.statRoute + 'enrollmentTrends', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        const json = await res.json();

        if (json.success && json.data && json.data.monthlyTrend) {
          const { monthlyTrend, annualEnrollment, monthlyEnrollment, percentageOverAnnual } = json.data;

          // Pass stats up to parent if callback is provided
          if (onStatsChange) {
            onStatsChange({ annualEnrollment, monthlyEnrollment, percentageOverAnnual });
          }

          // Map month numbers to names
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const categories = monthlyTrend.map((item) => monthNames[item.month - 1]);
          const data = monthlyTrend.map((item) => item.count);

          setSeries([
            {
              name: 'Student Registrations',
              data
            }
          ]);

          setOptions((prevState) => ({
            ...prevState,
            colors: [theme.palette.warning.main],
            xaxis: {
              ...prevState.xaxis,
              categories,
              labels: {
                ...prevState.xaxis.labels,
                style: {
                  colors: Array(categories.length).fill(secondary)
                }
              }
            },
            grid: {
              borderColor: line
            }
          }));
        }
      } catch (error) {
        console.error('Chart data fetch error:', error);
      }
    };

    if (user?.token) {
      fetchData();
    }
  }, [theme, secondary, line, user?.token, onStatsChange]);

  return <ReactApexChart options={options} series={series} type="line" height={345} />;
};

export default ReportAreaChart;
