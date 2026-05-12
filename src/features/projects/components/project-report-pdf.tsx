import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  header: { borderBottom: '2 solid #1e293b', paddingBottom: 15, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1 },
  subtitle: { fontSize: 10, color: '#64748b', marginTop: 6 },
  badge: { backgroundColor: '#f1f5f9', padding: '4 8', borderRadius: 4, fontSize: 10, color: '#334155', alignSelf: 'flex-start', marginTop: 10 },
  
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginBottom: 12, marginTop: 24, borderBottom: '1 solid #e2e8f0', paddingBottom: 4 },
  
  gridContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, flexWrap: 'wrap' },
  card: { padding: 12, backgroundColor: '#f8fafc', borderRadius: 6, width: '31%', marginBottom: 10, border: '1 solid #e2e8f0' },
  cardLabel: { fontSize: 8, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
  cardValue: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  cardValueAlert: { fontSize: 14, fontWeight: 'bold', color: '#e11d48' },

  table: { display: 'flex', width: '100%', border: '1 solid #e2e8f0', borderBottom: 0 },
  tableRow: { flexDirection: 'row', borderBottom: '1 solid #e2e8f0' },
  tableHeader: { backgroundColor: '#f1f5f9', fontWeight: 'bold' },
  tableCellHeader: { fontSize: 9, color: '#334155', padding: 8, fontWeight: 'bold' },
  tableCell: { fontSize: 8, color: '#475569', padding: 8 },
  
  col20: { width: '20%', borderRight: '1 solid #e2e8f0' },
  col30: { width: '30%', borderRight: '1 solid #e2e8f0' },
  col40: { width: '40%', borderRight: '1 solid #e2e8f0' },
  col50: { width: '50%', borderRight: '1 solid #e2e8f0' },
  col15: { width: '15%', borderRight: '1 solid #e2e8f0' },
  colLast: { width: '20%' },
  
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#94a3b8', borderTop: '1 solid #e2e8f0', paddingTop: 10 }
});

export const ProjectReportPDF = ({ analytics, predictions }: { analytics: any, predictions: any }) => {
  const meta = analytics?.meta || {};
  const kpi = analytics?.kpi || {};
  const tasks = analytics?.tasks || [];
  const members = analytics?.members || [];
  const risks = analytics?.risks || [];

  const currency = meta.currency || 'PKR';
  
  const activeRisks = risks.filter((r: any) => r.status === "OPEN" || r.status === "IN_PROGRESS");
  const completedTasks = tasks.filter((t: any) => t.progress === 100).length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        <View style={styles.header}>
          <Text style={styles.title}>{meta.name}</Text>
          <Text style={styles.subtitle}>Executive Project Report • Generated on {format(new Date(), 'PPP p')}</Text>
          <Text style={styles.badge}>{meta.projectStatus?.replace(/_/g, ' ')} STATUS</Text>
        </View>

        <Text style={styles.sectionTitle}>1. AI Executive Summary</Text>
        <View style={styles.gridContainer}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Completion Progress</Text>
            <Text style={styles.cardValue}>{meta.progress}% ({completedTasks}/{kpi.totalTasks} Tasks)</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Allocated Budget</Text>
            <Text style={styles.cardValue}>{currency} {(meta.budget || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>AI Projected Cost</Text>
            <Text style={predictions?.projectedBudgetVariance < 0 ? styles.cardValueAlert : styles.cardValue}>
              {currency} {predictions?.projectedTotalCost?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>COCOMO Effort</Text>
            <Text style={styles.cardValue}>{meta.calculatedEffort > 0 ? `${meta.calculatedEffort} P-Months` : 'N/A'}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>AI Deadline Forecast</Text>
            <Text style={predictions?.isDelayed ? styles.cardValueAlert : styles.cardValue}>
              {predictions?.isDelayed ? `Delayed by ${predictions.delayDays} days` : 'On Track'}
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Active Risks</Text>
            <Text style={activeRisks.length > 0 ? styles.cardValueAlert : styles.cardValue}>{activeRisks.length} Critical/Open</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>2. Team Performance & Resource Matrix</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.col30}><Text style={styles.tableCellHeader}>Team Member</Text></View>
            <View style={styles.col20}><Text style={styles.tableCellHeader}>Role</Text></View>
            <View style={styles.col15}><Text style={styles.tableCellHeader}>Tasks (Done)</Text></View>
            <View style={styles.col15}><Text style={styles.tableCellHeader}>Points</Text></View>
            <View style={styles.colLast}><Text style={styles.tableCellHeader}>Budget Managed</Text></View>
          </View>
          {members.length > 0 ? members.map((m: any) => (
            <View style={styles.tableRow} key={m.memberId}>
              <View style={styles.col30}><Text style={styles.tableCell}>{m.name}</Text></View>
              <View style={styles.col20}><Text style={styles.tableCell}>{m.role || 'Member'}</Text></View>
              <View style={styles.col15}><Text style={styles.tableCell}>{m.tasksCompleted} / {m.totalTasks}</Text></View>
              <View style={styles.col15}><Text style={styles.tableCell}>{m.pointsEarned} pts</Text></View>
              <View style={styles.colLast}><Text style={styles.tableCell}>{currency} {(m.budgetManaged || 0).toLocaleString()}</Text></View>
            </View>
          )) : (
            <View style={styles.tableRow}><View style={{ width: '100%' }}><Text style={styles.tableCell}>No members assigned.</Text></View></View>
          )}
        </View>

        <Text style={styles.sectionTitle}>3. Complete Risk Register</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.col50}><Text style={styles.tableCellHeader}>Risk Title</Text></View>
            <View style={styles.col20}><Text style={styles.tableCellHeader}>Impact</Text></View>
            <View style={styles.col15}><Text style={styles.tableCellHeader}>Probability</Text></View>
            <View style={styles.colLast}><Text style={styles.tableCellHeader}>Status</Text></View>
          </View>
          {risks.length > 0 ? risks.slice(0, 20).map((r: any) => (
            <View style={styles.tableRow} key={r.id}>
              <View style={styles.col50}><Text style={styles.tableCell}>{r.title || 'Untitled Risk'}</Text></View>
              <View style={styles.col20}><Text style={styles.tableCell}>{r.impact}</Text></View>
              <View style={styles.col15}><Text style={styles.tableCell}>{r.probability}</Text></View>
              <View style={styles.colLast}><Text style={styles.tableCell}>{r.status}</Text></View>
            </View>
          )) : (
            <View style={styles.tableRow}><View style={{ width: '100%' }}><Text style={styles.tableCell}>No risks found.</Text></View></View>
          )}
        </View>

        <Text style={styles.sectionTitle}>4. Comprehensive Task Ledger</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.col40}><Text style={styles.tableCellHeader}>Task Name</Text></View>
            <View style={styles.col20}><Text style={styles.tableCellHeader}>Assignee</Text></View>
            <View style={styles.col20}><Text style={styles.tableCellHeader}>Status / Prio</Text></View>
            <View style={styles.colLast}><Text style={styles.tableCellHeader}>Effort</Text></View>
          </View>
          {tasks.slice(0, 40).map((task: any) => (
            <View style={styles.tableRow} key={task.id}>
              <View style={styles.col40}><Text style={styles.tableCell}>{task.name}</Text></View>
              <View style={styles.col20}><Text style={styles.tableCell}>{task.assigneeId || 'Unassigned'}</Text></View>
              <View style={styles.col20}><Text style={styles.tableCell}>{task.column?.name || 'Pending'} ({task.priority})</Text></View>
              <View style={styles.colLast}><Text style={styles.tableCell}>{task.effortPoints} pts</Text></View>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 9, color: '#94a3b8', marginTop: 10, fontStyle: 'italic' }}>
          *Note: Tables are limited to the top most recent records for PDF readability. Export to Excel for the complete raw data dump.
        </Text>

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `Planora Analytics PDF Report • Page ${pageNumber} of ${totalPages} • Strictly Confidential`
        )} fixed />
      </Page>
    </Document>
  );
};