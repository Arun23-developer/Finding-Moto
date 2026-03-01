import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface SalesChartProps {
  type?: 'line' | 'bar'
  dataPoints?: number[]
}

function SalesChart({ type = 'line', dataPoints }: SalesChartProps) {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Sales Revenue ($)',
        data: dataPoints || [12000, 19000, 15000, 25000, 22000, 30000, 28000, 32000, 35000, 38000, 40000, 45000],
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Orders',
        data: [120, 190, 150, 250, 220, 300, 280, 320, 350, 380, 400, 450],
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        tension: 0.4,
        fill: type === 'line',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Sales & Orders',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  if (type === 'bar') {
    return <Bar data={data} options={options} />
  }

  return <Line data={data} options={options} />
}

export default SalesChart
