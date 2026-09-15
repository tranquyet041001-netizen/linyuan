/**
 * Professional Console & Markdown Reporter for E2E Test Suite
 */

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

export function printSummary(summary) {
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.bold}${colors.cyan}  STUDIO EDITOR REDESIGN — E2E TEST EXECUTION REPORT${colors.reset}`);
  console.log('='.repeat(80) + '\n');

  // Tier Breakdown Table
  console.log(`${colors.bold}┌────────────────────────────────────────┬─────────┬─────────┬─────────┬───────────┐${colors.reset}`);
  console.log(`${colors.bold}│ Tier                                   │ Total   │ Passed  │ Failed  │ Status    │${colors.reset}`);
  console.log(`${colors.bold}├────────────────────────────────────────┼─────────┼─────────┼─────────┼───────────┤${colors.reset}`);

  for (const [tier, stats] of Object.entries(summary.byTier)) {
    const isPass = stats.failed === 0;
    const statusText = isPass ? `${colors.green}PASS${colors.reset}` : `${colors.red}FAIL${colors.reset}`;
    const namePad = tier.padEnd(38);
    const totalPad = String(stats.total).padStart(7);
    const passPad = String(stats.passed).padStart(7);
    const failPad = String(stats.failed).padStart(7);
    console.log(`│ ${namePad} │ ${totalPad} │ ${passPad} │ ${failPad} │ ${statusText.padEnd(17)} │`);
  }
  console.log(`${colors.bold}└────────────────────────────────────────┴─────────┴─────────┴─────────┴───────────┘${colors.reset}\n`);

  // Feature Breakdown Table
  console.log(`${colors.bold}┌────────────────────────────────────────────────────────┬─────────┬─────────┬───────────┐${colors.reset}`);
  console.log(`${colors.bold}│ Feature Coverage Matrix                                │ Tests   │ Passed  │ Status    │${colors.reset}`);
  console.log(`${colors.bold}├────────────────────────────────────────────────────────┼─────────┼─────────┼───────────┤${colors.reset}`);

  for (const [feat, stats] of Object.entries(summary.byFeature)) {
    const isPass = stats.failed === 0;
    const statusText = isPass ? `${colors.green}PASS${colors.reset}` : `${colors.red}FAIL${colors.reset}`;
    const featPad = feat.padEnd(54);
    const totalPad = String(stats.total).padStart(7);
    const passPad = String(stats.passed).padStart(7);
    console.log(`│ ${featPad} │ ${totalPad} │ ${passPad} │ ${statusText.padEnd(17)} │`);
  }
  console.log(`${colors.bold}└────────────────────────────────────────────────────────┴─────────┴─────────┴───────────┘${colors.reset}\n`);

  // Summary Metrics
  const durationSec = (summary.durationMs / 1000).toFixed(2);
  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  Total Tests:    ${colors.bold}${summary.total}${colors.reset}`);
  console.log(`  Passed:         ${colors.green}${colors.bold}${summary.passed}${colors.reset}`);
  console.log(`  Failed:         ${summary.failed > 0 ? colors.red : colors.green}${colors.bold}${summary.failed}${colors.reset}`);
  console.log(`  Duration:       ${durationSec}s\n`);

  if (summary.failures.length > 0) {
    console.log(`${colors.bold}${colors.red}Failures (${summary.failures.length}):${colors.reset}`);
    for (const fail of summary.failures) {
      console.log(`\n  ${colors.red}✖ ${fail.title}${colors.reset}`);
      console.log(`    Tier: ${fail.tier} | Feature: ${fail.feature}`);
      if (fail.error) {
        console.log(`    Error: ${fail.error.message}`);
        if (fail.error.expected !== undefined && fail.error.actual !== undefined) {
          console.log(`    Expected: ${JSON.stringify(fail.error.expected)}`);
          console.log(`    Actual:   ${JSON.stringify(fail.error.actual)}`);
        }
        if (fail.error.stack) {
          const lines = fail.error.stack.split('\n').slice(1, 4).join('\n    ');
          console.log(`    Stack:\n    ${colors.gray}${lines}${colors.reset}`);
        }
      }
    }
    console.log('\n' + '='.repeat(80) + '\n');
    return false;
  } else {
    console.log(`${colors.bold}${colors.green}✔ ALL ${summary.total} TESTS PASSED CLEANLY (100% SUCCESS RATE)${colors.reset}`);
    console.log('='.repeat(80) + '\n');
    return true;
  }
}
