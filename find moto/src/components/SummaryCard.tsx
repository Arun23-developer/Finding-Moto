import '../styles/SummaryCard.css'

interface SummaryCardProps {
  title: string
  value: string | number
  change: string
  icon: React.ReactNode
  color: string
}

function SummaryCard({ title, value, change, icon, color }: SummaryCardProps) {
  const isPositive = !change.includes('-')

  return (
    <div className={`summary-card card-${color}`}>
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <h4 className="card-title">{title}</h4>
        <p className="card-value">{value}</p>
        <p className={`card-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '↑' : '↓'} {change}
        </p>
      </div>
    </div>
  )
}

export default SummaryCard
