interface Props {
  report: any
}

const URGENCY_COLORS: Record<string, string> = {
  INMEDIATA: '#c53030',
  URGENTE: '#c05621',
  PREFERENTE: '#b7791f',
  RUTINA: '#276749',
}

export default function ReportDisplay({ report }: Props) {
  const { enrichment } = report
  const color = URGENCY_COLORS[enrichment.urgency] || '#000'

  return (
    <div style={{ marginTop: 32 }}>
      <h2>Transcripcion</h2>
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          background: '#fff8f0',
          border: '1px solid #e2e8f0',
          padding: 16,
          borderRadius: 8,
          lineHeight: 1.6,
          fontSize: 14,
          color: '#000',
        }}
      >
        {report.raw.raw_transcription}
      </pre>
      <h2 style={{ marginTop: 32 }}>Reporte enriquecido</h2>
      <div
        style={{
          background: '#f7fafc',
          border: '1px solid #e2e8f0',
          padding: 16,
          borderRadius: 8,
          color: '#000',
        }}
      >
        <p style={{ fontSize: 18, marginBottom: 12 }}>
          <strong>Urgencia: </strong>
          <span style={{ color, fontWeight: 'bold' }}>{enrichment.urgency}</span>
        </p>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            lineHeight: 1.6,
            fontSize: 14,
            color: '#000',
          }}
        >
          {enrichment.report}
        </pre>
        {enrichment.followup?.length > 0 && (
          <>
            <h3 style={{ marginTop: 16 }}>Seguimiento</h3>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              {enrichment.followup.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
